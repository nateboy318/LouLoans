/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'https://iu2mua5qjd.execute-api.us-east-1.amazonaws.com/prod/ztsimp02/:path*'
        }
      ]
    }
  }
  
  module.exports = nextConfig