const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false // Enable in development
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['www.mohitpatel.life', 'mohitpatel.life', 'res.cloudinary.com', 'firebasestorage.googleapis.com'],
  },
  experimental: {
    turbo: {
      rules: {
        // Add any custom Turbopack rules here
      }
    }
  }
}

module.exports = withPWA(nextConfig)
