import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  typescript: {
    ignoreBuildErrors: true,
  },
  serverComponentsExternalPackages: ['stripe', 'resend', '@neondatabase/serverless'],

};

export default nextConfig;
