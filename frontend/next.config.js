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
          destination: 'http://omniagentos-backend-1:8000/api/v1/:path*',
          basePath: false
        }
      ]
    }
  },
  // Increase timeout for long-running transcription requests
  httpAgentOptions: {
    timeout: 300000 // 5 minutes
  },
  httpsAgentOptions: {
    timeout: 300000 // 5 minutes
  }
}

module.exports = nextConfig
