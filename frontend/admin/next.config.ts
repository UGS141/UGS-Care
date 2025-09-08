import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure proper handling of static assets
  assetPrefix: undefined,
  // Use correct configuration for Next.js 15.5.2
  serverExternalPackages: []
};

export default nextConfig;
