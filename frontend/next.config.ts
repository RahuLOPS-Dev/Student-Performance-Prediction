import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export → produces a fully self-contained `out/` folder that can be
  // hosted on any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3, etc.)
  output: "export",
  // Serve static assets from the repo root (works on GitHub Pages subpaths too)
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
