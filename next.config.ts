import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only enable standalone output when building inside Docker
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
};

export default nextConfig;
