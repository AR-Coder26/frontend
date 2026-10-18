import type { NextConfig } from "next";

// Optional same-origin API proxy (see src/lib/api/client.ts for the full explanation).
// When NEXT_PUBLIC_API_PROXY=true the browser calls this site's own /api/* and Next forwards
// it to the backend at NEXT_PUBLIC_API_URL. The destination is derived from that one variable,
// so there is no second backend address to keep in sync. Off by default.
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
const useApiProxy = process.env.NEXT_PUBLIC_API_PROXY === "true";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // AVIF first, WebP fallback — smaller images, better LCP.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // {
      //   protocol: "https",
      //   hostname: "placehold.co",
      // },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Permanent (301) redirects.
  //  - /brand/* pages were built around designer names the store has no authorisation to use.
  //    Remove this rule if you later create brand pages for your OWN brand.
  //  - Add one entry per renamed / merged product so old URLs keep their ranking, e.g.
  //    { source: "/products/old-slug-1", destination: "/products/new-slug", permanent: true },
  async redirects() {
    return [
      { source: "/brand/:slug", destination: "/products", permanent: true },
      // { source: "/products/zara-shahjahan-luxury-embroidered-lawn-suit-1", destination: "/products/<new-slug>", permanent: true },
    ];
  },
  async rewrites() {
    if (!useApiProxy) return [];
    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_API_PROXY=true requires NEXT_PUBLIC_API_URL to be set.");
    }
    // `source` must match API_PROXY_PATH in src/lib/api/client.ts.
    return [{ source: "/api/:path*", destination: `${apiUrl}/:path*` }];
  },
};

export default nextConfig;