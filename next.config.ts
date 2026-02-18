import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // pdfjs-dist optionally imports Node's canvas — disable it for browser builds
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
