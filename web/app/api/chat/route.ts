/**
 * POST /api/chat
 * Streaming chat endpoint — proxies to Anthropic Claude API.
 * Falls back to a simple echo if ANTHROPIC_API_KEY is not set.
 */

import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are OpenCode, an AI coding agent in a Replit-style IDE. You generate working code that renders in a live preview.

When the user asks you to build something, OUTPUT CODE FILES using this format:
- Use fenced code blocks with the language tag
- Put a filename comment on the FIRST LINE inside each code block
- For HTML: <!-- filename: index.html -->
- For CSS: /* filename: styles.css */
- For JS: // filename: script.js

Example response structure:
\`\`\`html
<!-- filename: index.html -->
<!DOCTYPE html>
<html>...</html>
\`\`\`

\`\`\`css
/* filename: styles.css */
body { ... }
\`\`\`

\`\`\`javascript
// filename: script.js
console.log("hello");
\`\`\`

RULES:
- Always generate an index.html as the main entry point
- Make HTML files self-contained OR reference styles.css and script.js
- Use modern CSS (flexbox, grid, custom properties)
- Write clean, working code — the preview renders immediately
- Keep explanations brief — let the code speak
- For complex apps, split into multiple files
- Default to vanilla HTML/CSS/JS unless a framework is requested
- Make it visually polished — good colors, spacing, typography`

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const CHAT_SYSTEM_PROMPT = `You are OpenCode, an AI coding assistant. The user is asking questions about code that was generated in a Replit-style IDE.

Answer questions about the code that was generated. Don't output code blocks or json:file blocks. Just explain clearly and concisely.

Be helpful, reference specific files and functions when relevant, and explain architectural decisions.`

const DESIGN_SYSTEM_PROMPT = `You are a UI/UX design expert working in a Replit-style IDE. Convert visual descriptions or screenshots into pixel-perfect HTML/CSS. Focus on layout, typography, color, spacing, and visual polish. Use modern CSS (grid, flexbox, custom properties). Always output structured code files.

When generating code, OUTPUT CODE FILES using this format:
- Use fenced code blocks with the language tag
- Put a filename comment on the FIRST LINE inside each code block
- For HTML: <!-- filename: index.html -->
- For CSS: /* filename: styles.css */
- For JS: // filename: script.js

RULES:
- Always generate an index.html as the main entry point
- Create visually stunning, pixel-perfect implementations
- Use modern CSS with custom properties for design tokens
- Pay close attention to spacing, typography, color, and visual hierarchy
- If a screenshot is provided, replicate the design as closely as possible
- Use flexbox and grid for responsive layouts
- Include subtle animations and transitions for polish
- Default to a clean, modern aesthetic unless told otherwise`

interface ChatRequest {
  messages: ChatMessage[]
  context?: string
  mode?: 'build' | 'chat' | 'design'
  imageData?: string
  images?: string[]
}

export async function POST(req: NextRequest) {
  try {
    const { messages, context, mode = 'build', imageData, images } = (await req.json()) as ChatRequest
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      // No API key — return a helpful message as SSE
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          const msg = 'ANTHROPIC_API_KEY is not configured. Using mock responses. Set the environment variable to enable real AI responses.'
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: msg })}\n\n`))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        },
      })
      return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
      })
    }

    const client = new Anthropic({ apiKey })
    const basePrompt = mode === 'design' ? DESIGN_SYSTEM_PROMPT : mode === 'chat' ? CHAT_SYSTEM_PROMPT : SYSTEM_PROMPT
    const systemPrompt = context
      ? `${basePrompt}\n\nAdditional context:\n${context}`
      : basePrompt

    // Resolve all image sources: prefer `images` array, fall back to single `imageData`
    const allImages = images || (imageData ? [imageData] : [])

    const anthropicMessages: Anthropic.MessageParam[] = messages.map((m, i) => {
      // Attach images to the last user message
      if (allImages.length > 0 && m.role === 'user' && i === messages.length - 1) {
        const imageBlocks: Anthropic.ImageBlockParam[] = []
        for (const img of allImages) {
          const match = img.match(/^data:(image\/[^;]+);base64,(.+)$/)
          if (match) {
            const mediaType = match[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
            const data = match[2]
            imageBlocks.push({ type: 'image' as const, source: { type: 'base64' as const, media_type: mediaType, data } })
          }
        }
        if (imageBlocks.length > 0) {
          return {
            role: m.role,
            content: [...imageBlocks, { type: 'text' as const, text: m.content }],
          }
        }
      }
      return { role: m.role, content: m.content }
    })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: systemPrompt,
      messages: anthropicMessages,
      stream: true,
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of response) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'text', content: event.delta.text })}\n\n`)
              )
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Stream error'
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', content: msg })}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
    })
  } catch (error: unknown) {
    console.error('Chat API error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'

    // Classify the error for better client-side handling
    let status = 500
    let errorType = 'server_error'
    if (message.includes('rate') || message.includes('429') || message.includes('quota')) {
      status = 429
      errorType = 'rate_limit'
    } else if (message.includes('auth') || message.includes('key') || message.includes('401')) {
      status = 401
      errorType = 'auth_error'
    } else if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
      status = 504
      errorType = 'timeout'
    }

    return new Response(JSON.stringify({ error: message, type: errorType }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
