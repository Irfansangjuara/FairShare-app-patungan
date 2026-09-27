import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/dashboard/events/new",
        destination: "/events/new",
      },
      {
        source: "/dashboard/events/:id",
        destination: "/events/:id",
      },
    ];
  },
};

export default nextConfig;
