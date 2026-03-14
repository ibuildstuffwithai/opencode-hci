/**
 * Proxy all requests to the OpenCode backend server.
 * This avoids CORS issues when the web UI and OpenCode server are on different ports.
 */

import { NextRequest, NextResponse } from "next/server";

const OPENCODE_SERVER = process.env.OPENCODE_SERVER_URL || "http://127.0.0.1:4096";

async function proxyRequest(
  req: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse | Response> {
  const path = "/" + params.path.join("/");
  const url = new URL(path, OPENCODE_SERVER);

  // Forward query params
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (key !== "host" && key !== "connection") {
      headers[key] = value;
    }
  });

  // Forward directory header if set
  const directory = req.headers.get("x-opencode-directory") || process.env.OPENCODE_DIRECTORY || process.cwd();
  headers["x-opencode-directory"] = directory;

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    fetchOptions.body = await req.text();
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    fetchOptions.signal = controller.signal;
    const response = await fetch(url.toString(), fetchOptions);
    clearTimeout(timeout);

    // For SSE streams, pipe through directly
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/event-stream")) {
      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (key !== "transfer-encoding") {
        responseHeaders.set(key, value);
      }
    });

    const body = await response.arrayBuffer();
    return new NextResponse(body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Proxy error";
    return NextResponse.json(
      { error: `Failed to connect to OpenCode server: ${message}` },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxyRequest(req, ctx);
}

export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxyRequest(req, ctx);
}

export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxyRequest(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxyRequest(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxyRequest(req, ctx);
}
