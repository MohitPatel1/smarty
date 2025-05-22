import React, { createContext, useContext, useEffect, useState } from 'react'
import { getSiteConfig } from 'config/site'

interface SiteConfig {
  name: string
  logo: string
  email: string
  domain: string
}

interface SiteContextType {
  siteConfig: SiteConfig
  updateSiteConfig: (hostname: string) => void
}

const SiteContext = createContext<SiteContextType | undefined>(undefined)

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    try {
      if (typeof window !== 'undefined') {
        return getSiteConfig(window.location.hostname)
      }
      return getSiteConfig('')
    } catch (error) {
      console.error('Error getting site config:', error)
      return {
        name: 'Site',
        logo: '/default-logo.png',
        email: 'contact@site.com',
        domain: 'site.com'
      }
    }
  })

  const updateSiteConfig = (hostname: string) => {
    try {
      const newConfig = getSiteConfig(hostname)
      setSiteConfig(newConfig)
      // Update document title
      document.title = `${newConfig.name}'s Portfolio`
    } catch (error) {
      console.error('Error updating site config:', error)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      updateSiteConfig(window.location.hostname)
    }
  }, [])

  return (
    <SiteContext.Provider value={{ siteConfig, updateSiteConfig }}>
      {children}
    </SiteContext.Provider>
  )
}

export const useSite = () => {
  const context = useContext(SiteContext)
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider')
  }
  return context
} 