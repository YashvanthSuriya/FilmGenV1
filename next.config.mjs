/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" }
        ]
      },
      {
        source: "/freecut-editor/(.*)",
        headers: [{ key: "Cross-Origin-Resource-Policy", value: "cross-origin" }]
      }
    ]
  },
  async rewrites() {
    return {
      afterFiles: [
        {
          source: "/freecut-editor/:path*",
          destination: "/freecut-editor/index.html"
        }
      ]
    }
  }
}

export default nextConfig
