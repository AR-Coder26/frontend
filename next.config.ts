import type { NextConfig } from "next";

// Optional same-origin API proxy (see src/lib/api/client.ts for the full explanation).
// When NEXT_PUBLIC_API_PROXY=true the browser calls this site's own /api/* and Next forwards
// it to the backend at NEXT_PUBLIC_API_URL. The destination is derived from that one variable,
// so there is no second backend address to keep in sync. Off by default.
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
const useApiProxy = process.env.NEXT_PUBLIC_API_PROXY === "true";

const nextConfig: NextConfig = {
  images: {
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