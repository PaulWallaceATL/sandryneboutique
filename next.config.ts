import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // globalpayments-api ships conditional requires that can't be statically bundled.
  serverExternalPackages: ["globalpayments-api"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
