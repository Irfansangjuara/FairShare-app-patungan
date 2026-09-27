import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/token",
        destination: "/dashboard/token",
        permanent: true,
      },
      {
        source: "/developer",
        destination: "/dashboard/token",
        permanent: true,
      },
      {
        source: "/dashboard/developer",
        destination: "/dashboard/token",
        permanent: true,
      },
    ];
  },
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
    ];
  },
};

export default nextConfig;
