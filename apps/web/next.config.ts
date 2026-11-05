import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  /**
   * The browser always calls /api/* on the storefront's own domain, and Next
   * forwards it to Express. The session cookie is therefore first-party, which
   * works even when web (Vercel) and API (Render, Railway…) live on different domains.
   */
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },

  images: {
    remotePatterns: [
      // Supabase Storage public bucket (product images)
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
