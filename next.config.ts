import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  assetPrefix: ".",
  basePath: "/polly-mission-control",
  env: {
    NEXT_PUBLIC_USE_WORKER: process.env.NEXT_PUBLIC_USE_WORKER || "false",
    NEXT_PUBLIC_WORKER_URL: process.env.NEXT_PUBLIC_WORKER_URL || "https://openclaw-api.digitalartifacts.studio",
  },
};

export default nextConfig;
