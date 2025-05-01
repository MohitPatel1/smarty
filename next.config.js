const withOffline = require('next-offline')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.mohitpatel.life', 'mohitpatel.life', 'res.cloudinary.com']
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
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build --> Error: Can't resolve 'fs'
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
    return config
  }

  // // For <Icon /> support:
  // webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
  //   config.module.rules.push({
  //     test: /\.svg$/,
  //     loader: 'raw-loader'
  //   })
  //   return config
  // }
}

module.exports = withOffline(nextConfig)
