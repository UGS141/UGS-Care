import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure proper handling of static assets
  assetPrefix: undefined,
  // Use correct configuration for Next.js 15.5.2
  serverExternalPackages: [],
  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
