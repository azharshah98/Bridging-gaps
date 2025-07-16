/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'images.unsplash.com'
    ],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    webpackBuildWorker: true,
  }
}

module.exports = nextConfig 