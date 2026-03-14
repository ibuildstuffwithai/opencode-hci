/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_OPENCODE_URL: process.env.NEXT_PUBLIC_OPENCODE_URL || "http://127.0.0.1:4096",
    NEXT_PUBLIC_OPENCODE_WS: process.env.NEXT_PUBLIC_OPENCODE_WS || "ws://127.0.0.1:4096",
  },
};

export default nextConfig;
