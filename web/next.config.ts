import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/delivery-policy",
        destination: "/shipping-and-delivery-policy",
        permanent: true,
      },
    ];
  },
  turbopack: {
    root: webRoot,
  },
  images: {
    remotePatterns: [
      {
        // Profile photo URLs for accounts that may have used Google sign-in previously
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
