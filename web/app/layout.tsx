import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenCode HCI — Human-Centered Coding Agent",
  description: "A coding agent with 4-pillar interaction quality: Alignment, Steerability, Verification, Adaptability",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Inline script to prevent flash of wrong theme
  const themeScript = `
    (function() {
      try {
        var t = localStorage.getItem('opencode-theme') || 'dark';
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(t);
      } catch(e) {}
    })();
  `;

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-background text-foreground font-sans antialiased transition-colors duration-200">{children}</body>
    </html>
  );
}
