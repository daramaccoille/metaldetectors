import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent build errors if these packages are used in edge runtime
  serverExternalPackages: ['drizzle-orm', '@neondatabase/serverless'],
};

export default nextConfig;
