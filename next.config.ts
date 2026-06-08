import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  assetPrefix: ".",
  basePath: "/polly-mission-control",
};

export default nextConfig;
