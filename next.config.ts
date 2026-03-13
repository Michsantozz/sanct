import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/middlewareClientMaxBodySize
  // String format (recommended) — Supported units: b, kb, mb, gb
  experimental: {
    proxyClientMaxBodySize: "50mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
