const withOffline = require('next-offline')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.mohitpatel.life', 'mohitpatel.life', 'res.cloudinary.com']
  },

  // Enable experimental features for Turbopack
  experimental: {
    turbo: {
      rules: {
        // Add any custom Turbopack rules here
      }
    }
  },

  transformManifest: manifest => ['/'].concat(manifest), // add the homepage to the cache

  // Trying to set NODE_ENV=production when running yarn dev causes a build-time error so we turn on the SW in dev mode so that we can actually test it
  generateInDevMode: true,

  offline: {
    workboxOpts: {
      swDest: 'static/service-worker.js',
      runtimeCaching: [
        {
          urlPattern: /^https?.*/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'https-calls',
            networkTimeoutSeconds: 15,
            expiration: {
              maxEntries: 150,
              maxAgeSeconds: 30 * 24 * 60 * 60 // 1 month
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    }
  }
}

module.exports = withOffline(nextConfig)
