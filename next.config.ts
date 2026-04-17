import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow custom dev hosts (e.g. lvh.me) so Turbopack/HMR and dev assets work
  // when the browser origin is not localhost. See allowedDevOrigins in Next.js docs.
  allowedDevOrigins: ["lvh.me", "*.lvh.me"],
};

export default nextConfig;
