import packageJson from '../package.json'
import manifest from '../public/manifest.json'

export const environment = process.env.NODE_ENV
export const isDevelopment = process.env.NODE_ENV === 'development'
const appSlug = packageJson.name
const serverPort = parseInt(process.env.PORT ?? '3004')

// Get domain name from URL
const getDomainName = (url: string): string => {
  try {
    const hostname = new URL(url).hostname
    // For localhost, return "Local"
    if (hostname === 'localhost') {
      return 'Local'
    }
    // For other domains, get the subdomain or domain name
    const domain = hostname.split('.')[0]
    return domain.charAt(0).toUpperCase() + domain.slice(1)
  } catch (error) {
    // If URL parsing fails or domain is unknown, return "Unknown"
    return 'Unknown'
  }
}

interface EnvironmentConfiguration {
  appSlug: string
  appVersion: string
  appUrl: string
  appName: string
  appTagline?: string
  appDescription?: string
  serverPort: number
  locale?: string
  googleAnalyticsId?: string | null
  fonts?: string[][]

  startPagePath?: string
  allowedHostsList?: string[]

  isProduction?: boolean
  sendRealMessages?: boolean
}

interface AllConfigurations {
  default?: EnvironmentConfiguration
  development?: Partial<EnvironmentConfiguration>
  production?: Partial<EnvironmentConfiguration>
  test?: Partial<EnvironmentConfiguration>
}

const completeConfig: AllConfigurations = {
  default: {
    serverPort,
    appSlug,
    appVersion: packageJson.version,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://nextjs-pwa-firebase-boilerplate.vercel.app/',
    appName: `${getDomainName(process.env.NEXT_PUBLIC_APP_URL ?? 'https://nextjs-pwa-firebase-boilerplate.vercel.app/')}'s Life`,
    appTagline: manifest.description,
    appDescription: `${getDomainName(process.env.NEXT_PUBLIC_APP_URL ?? 'https://nextjs-pwa-firebase-boilerplate.vercel.app/')}'s Life – ${manifest.description}`,
    locale: 'en_US', // sv_SE
    googleAnalyticsId: 'G-XXXXXXXXXX',
    fonts: [
      ['Inter', 'wght@300;400;500;700']
    ],
    allowedHostsList: [`localhost:${serverPort}`, (new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://nextjs-pwa-firebase-boilerplate.vercel.app/')).host]
  },

  development: {
    appUrl: `http://localhost:${serverPort}/`,
    appName: "Local's Life",
    appDescription: `Local's Life – ${manifest.description}`,
    googleAnalyticsId: null
  },

  production: {
  }
}

// Public API
export const config = { ...completeConfig.default, ...completeConfig[environment] }
export default config
