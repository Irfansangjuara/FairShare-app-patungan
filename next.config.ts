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
      {
        source: "/dashboard/settings",
        destination: "/settings",
      },
      {
        source: "/dashboard/token",
        destination: "/token",
      },
      {
        source: "/dashboard/developer",
        destination: "/token",
      },
      {
        source: "/developer",
        destination: "/token",
      },
    ];
  },
};

export default nextConfig;
