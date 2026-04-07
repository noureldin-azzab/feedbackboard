import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serve uploaded images from local filesystem under /uploads
  // MIGRATION NOTE: This remotePatterns config assumes images are served from
  // the same host (localhost in dev). On AWS you'd point this at your S3 bucket
  // or CloudFront CDN domain.
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      // Add your production domain here when deploying
      // { protocol: "https", hostname: "your-domain.com", pathname: "/uploads/**" },
    ],
  },
  // The upload helper uses fs + process.cwd() for local storage.
  // This is intentional — it's a migration target: swap lib/uploads.ts for S3.
  serverExternalPackages: ["pg"],
};

export default nextConfig;
