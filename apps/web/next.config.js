/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tắt powered-by header (bảo mật)
  poweredByHeader: false,

  // Kiểm tra strict mode React
  reactStrictMode: true,

  // Biến môi trường public expose cho client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  },
};

module.exports = nextConfig;
