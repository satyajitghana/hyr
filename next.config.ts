import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Include Geist font TTF files in the serverless function bundle.
  // Without this, Vercel strips them during tree-shaking and the PDF route
  // falls back to Helvetica ("Geist fonts not found" warning).
  outputFileTracingIncludes: {
    "/api/resume/pdf": ["./node_modules/geist/dist/fonts/**/*.ttf"],
  },
  webpack: (config) => {
    // pdfjs-dist optionally imports Node's canvas — disable it for browser builds
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
