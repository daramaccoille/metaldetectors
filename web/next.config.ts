import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['resend', '@neondatabase/serverless'],
};

export default nextConfig;
