import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenCode HCI — Human-Centered Coding Agent",
  description: "A coding agent with 4-pillar interaction quality: Alignment, Steerability, Verification, Adaptability",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground font-sans antialiased">{children}</body>
    </html>
  );
}
