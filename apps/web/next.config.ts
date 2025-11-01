import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: [
    "@kyosan-map/ui",
    "@kyosan-map/out-camera",
    "@kyosan-map/db",
    "@kyosan-map/map",
  ],
  experimental: {
    useCache: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kyosanmap-contents-server.pages.dev",
      },
    ],
  },
  serverExternalPackages: ["@libsql/client/web"],
};

export default nextConfig;
