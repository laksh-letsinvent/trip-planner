import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Phase 3 deploy: produces .next/standalone, a self-contained server
  // bundle the Dockerfile copies in — no need for node_modules at runtime.
  output: "standalone",
};

export default nextConfig;
