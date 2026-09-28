import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

// React's development build reconstructs callstacks with eval(), so `unsafe-eval`
// is required locally. Production React never calls eval(), so the deployed policy
// omits it.
const scriptSrc = isDevelopment
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const contentSecurityPolicy = [
  "default-src 'self'",
  scriptSrc,
  // Fonts are self-hosted by `next/font`, so no third-party font/style origin
  // is needed.
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https:",
  // canvas-confetti renders through an offscreen canvas created from a Worker
  // backed by a blob: URL, so blob workers must be permitted.
  "worker-src 'self' blob:",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // Serve modern formats and cache optimized variants for 31 days. The source
  // mascot/illustration WebPs are large; AVIF/WebP re-encoding cuts the image
  // payload substantially (images dominate the page weight).
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
  },

  experimental: {
    // Rewrites barrel imports so only the icons actually used are bundled,
    // instead of pulling in the whole icon module graph.
    optimizePackageImports: ["lucide-react"],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
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
    ];
  },
};

export default nextConfig;
