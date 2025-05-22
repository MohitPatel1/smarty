interface SiteConfig {
  name: string
  logo: string
  email: string
  domain: string
}

// Default configuration for known domains
const defaultConfigs: Record<string, Partial<SiteConfig>> = {
  'mohitpatel.life': {
    name: 'Mohit',
    logo: '/mohit.png',
    email: 'mohit@teziapp.com'
  },
  'fenil.life': {
    name: 'Fenil',
    logo: '/fenil.png',
    email: 'fenil@teziapp.com'
  }
}

export const getSiteConfig = (hostname: string): SiteConfig => {
  // Remove 'www.' if present and get the base domain
  const domain = hostname.replace('www.', '')
  
  // Get the first part of the domain (before the first dot)
  const name = domain.split('.')[0]
  
  // Use default config if available, otherwise use dynamic values
  const defaultConfig = defaultConfigs[domain] || {}
  
  return {
    name: defaultConfig.name || name.charAt(0).toUpperCase() + name.slice(1),
    logo: defaultConfig.logo || '/default-logo.png',
    email: defaultConfig.email || `${name}@${domain}`,
    domain: domain
  }
} 