/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  experimental: {
    serverComponentsExternalPackages: ["msedge-tts", "ws"]
  },
  async headers() {
    return [
      {
        // 1. Toàn bộ tệp âm thanh MP3: Cache vĩnh viễn 1 năm tại Edge Vercel & Trình duyệt
        source: "/audio/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, s-maxage=31536000, immutable"
          },
          {
            key: "Accept-Ranges",
            value: "bytes"
          }
        ]
      },
      {
        // 2. Icon, Manifest, Fonts: Cache 1 năm
        source: "/(icons|manifest.json)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, s-maxage=31536000, immutable"
          }
        ]
      },
      {
        // 3. Static Next.js Bundles: Immutable Cache
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, s-maxage=31536000, immutable"
          }
        ]
      },
      {
        // 4. API TTS Audio Cache: Cache 1 tuần
        source: "/api/tts",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
