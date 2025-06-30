/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  async rewrites() {
    // 支持环境变量指定后端地址，默认为localhost
    const backendHost = process.env.BACKEND_HOST || 'localhost';
    const backendPort = process.env.BACKEND_PORT || '8787';
    
    return [
      {
        source: '/api/:path*',
        destination: `http://${backendHost}:${backendPort}/api/:path*`, // 代理到后端API
      },
    ]
  },
  eslint: {
    dirs: ['src'],
  },
}

module.exports = nextConfig 