interface SiteConfig {
  name: string
  logo: string
  email: string
  domain: string
}

const siteConfigs: Record<string, SiteConfig> = {
  'mohitpatel.life': {
    name: 'Mohit',
    logo: '/mohit.png',
    email: 'mohit@teziapp.com',
    domain: 'mohitpatel.life'
  },
  'fenil.life': {
    name: 'Fenil',
    logo: '/fenil.png',
    email: 'fenil@teziapp.com',
    domain: 'fenil.life'
  }
}

export const getSiteConfig = (hostname: string): SiteConfig => {
  // Remove 'www.' if present
  const domain = hostname.replace('www.', '')
  return siteConfigs[domain] || siteConfigs['fenil.life'] // fallback to fenil.life
} 