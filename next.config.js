const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['www.mohitpatel.life', 'mohitpatel.life', 'fenil.life', 'www.fenil.life', 'res.cloudinary.com', 'firebasestorage.googleapis.com'],
  }
}

module.exports = withPWA(nextConfig)
