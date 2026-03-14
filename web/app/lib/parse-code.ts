// Parse AI response for code blocks with file paths.
// Extracts filename from comments like <!-- filename: index.html -->

import { FileNode } from "../store";

export interface ParsedFile {
  path: string;
  language: string;
  content: string;
}

const LANG_MAP: Record<string, string> = {
  html: "html",
  htm: "html",
  css: "css",
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  tsx: "typescriptreact",
  jsx: "javascriptreact",
  json: "json",
  md: "markdown",
  markdown: "markdown",
  py: "python",
  python: "python",
};

function inferFilename(language: string, content: string, index: number): string {
  // Try to extract filename from first line comment
  const firstLine = content.split("\n")[0];
  const commentPatterns = [
    /<!--\s*filename:\s*(.+?)\s*-->/i,
    /\/\*\s*filename:\s*(.+?)\s*\*\//i,
    /\/\/\s*filename:\s*(.+)/i,
    /#\s*filename:\s*(.+)/i,
  ];
  for (const pat of commentPatterns) {
    const m = firstLine.match(pat);
    if (m) return m[1].trim();
  }

  // Default filenames
  const defaults: Record<string, string> = {
    html: "index.html",
    css: "styles.css",
    javascript: "script.js",
    js: "script.js",
    typescript: "app.ts",
    ts: "app.ts",
    json: "data.json",
    python: "main.py",
    py: "main.py",
  };

  const base = defaults[language] || `file${index}.${language || "txt"}`;
  return index > 0 && defaults[language] ? base.replace(".", `${index + 1}.`) : base;
}

export function parseCodeBlocks(text: string): ParsedFile[] {
  const files: ParsedFile[] = [];
  // Match ```lang ... ``` blocks
  const regex = /```(\w+)?\s*(<!--\s*filename:\s*.+?-->|\/\*\s*filename:\s*.+?\*\/|\/\/\s*filename:\s*.+)?\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const lang = match[1] || "text";
    const fileHint = match[2] || "";
    let content = match[3].trimEnd();

    // Extract filename from the hint or first content line
    let filename = "";
    const hintPatterns = [
      /filename:\s*(.+?)(?:\s*-->|\s*\*\/|$)/i,
    ];
    for (const pat of hintPatterns) {
      const m = fileHint.match(pat);
      if (m) {
        filename = m[1].trim();
        break;
      }
    }

    if (!filename) {
      // Check first line of content
      const firstLine = content.split("\n")[0];
      const contentPatterns = [
        /<!--\s*filename:\s*(.+?)\s*-->/i,
        /\/\*\s*filename:\s*(.+?)\s*\*\//i,
        /\/\/\s*filename:\s*(.+)/i,
        /#\s*filename:\s*(.+)/i,
      ];
      for (const pat of contentPatterns) {
        const m = firstLine.match(pat);
        if (m) {
          filename = m[1].trim();
          // Remove the filename comment from content
          content = content.split("\n").slice(1).join("\n");
          break;
        }
      }
    }

    if (!filename) {
      filename = inferFilename(lang, content, files.length);
    }

    files.push({
      path: filename,
      language: LANG_MAP[lang] || lang,
      content: content.trim(),
    });
  }

  return files;
}

export function filesToFileNodes(files: ParsedFile[]): FileNode[] {
  const root: FileNode = {
    name: "project",
    path: "project",
    type: "folder",
    children: [],
  };

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length - 1; i++) {
      const dirName = parts[i];
      const dirPath = parts.slice(0, i + 1).join("/");
      let existing = current.children?.find((c) => c.name === dirName && c.type === "folder");
      if (!existing) {
        existing = { name: dirName, path: dirPath, type: "folder", children: [] };
        current.children = current.children || [];
        current.children.push(existing);
      }
      current = existing;
    }

    const fileName = parts[parts.length - 1];
    current.children = current.children || [];
    current.children.push({
      name: fileName,
      path: file.path,
      type: "file",
      content: file.content,
      touched: true,
    });
  }

  // If only one level, return children directly
  if (root.children && root.children.length > 0) {
    // Check if all files are at root level (no subdirectories)
    const hasOnlyFiles = root.children.every((c) => c.type === "file");
    if (hasOnlyFiles) {
      return [root];
    }
  }

  return [root];
}
