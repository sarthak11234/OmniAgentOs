/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase max request body size to 100MB
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/v1/:path*',
          // Use 127.0.0.1 instead of localhost to avoid IPv6 resolution issues on Windows
          destination: 'http://127.0.0.1:8000/api/v1/:path*',
          basePath: false
        }
      ]
    }
  }
}

module.exports = nextConfig

