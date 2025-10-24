import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['coin-images.coingecko.com'],
    remotePatterns: [
      { protocol: "https", hostname: "assets.coingecko.com" },
      { protocol: "https", hostname: "www.coingecko.com" },
      { protocol: "https", hostname: "s2.coinmarketcap.com" },
      { protocol: "https", hostname: "static.crypto.com" },
      { protocol: "https", hostname: "**.coingecko.com" }, // wildcard fallback
    ],
  },
  experimental: {
    typedRoutes: false,
  },
  typescript: {
    ignoreBuildErrors: true, // optional safety
  },
};

export default nextConfig;
