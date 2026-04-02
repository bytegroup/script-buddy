/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for catching potential issues early
  reactStrictMode: true,

  // Image optimization — allow localhost backend and future CDN domains
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
    ],
  },

  // Custom HTTP headers for security (production-ready baseline)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Environment variable exposure to the browser (prefix with NEXT_PUBLIC_)
  env: {
    NEXT_PUBLIC_API_BASE_URL:
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
  },
};

export default nextConfig;
