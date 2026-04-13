import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@kyosan-map/ui", "@kyosan-map/out-camera","@kyosan-map/map","@kyosan-map/db"],
  serverExternalPackages: ["@libsql/client/web"],
};

export default nextConfig;
