import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
    viewTransition: true
  },
  serverExternalPackages: ["@prisma/client"]
};

export default nextConfig;
