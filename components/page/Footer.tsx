import React from 'react'
import Link from 'next/link'
import { getSiteConfig } from 'config/site'

const Footer = (): React.ReactElement => {
  const [siteConfig, setSiteConfig] = React.useState(() => {
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

  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const newConfig = getSiteConfig(window.location.hostname)
        setSiteConfig(newConfig)
      }
    } catch (error) {
      console.error('Error updating site config:', error)
    }
  }, [])
  
  return (
    <footer>
      <span>
        <Link href='/about'>About {siteConfig.name}</Link>
        {' | '}
        By <a href={`https://${siteConfig.domain}`} target='_blank' rel='noopener noreferrer'>{siteConfig.name}</a>
        <SiteLogo config={siteConfig} />
        {' | '}
        <a href={`mailto:${siteConfig.email}`} target='_blank' rel='noopener noreferrer'>Contact</a>
      </span>
      <style jsx>{`
        :global(main) {
          margin-bottom: 3em;
        }

        footer {
          color: #777777;
          height: unset;
          padding: 0.4em 0.5em 0.6em;
          text-align: center;
        }

        footer :global(a) {
          color: inherit;
          border-color: inherit;
        }
      `}
      </style>
    </footer>
  )
}

interface SiteLogoProps {
  config: {
    name: string
    logo: string
    domain: string
  }
}

const SiteLogo = ({ config }: SiteLogoProps): React.ReactElement => (
  <a href={`https://${config.domain}`} target='_blank' rel='noopener noreferrer' className='no-link'>
    <img
      src={config.logo}
      alt={config.name}
      title={config.name}
      onError={(e) => {
        // Fallback to default logo if the specified one fails to load
        const target = e.target as HTMLImageElement
        target.src = '/default-logo.png'
      }}
    />
    <style jsx>{`
      a {
        margin-left: 0.2em;
        border-bottom: none;
      }
      img {
        width: 18px;
        height: 18px;
        vertical-align: bottom;
      }
    `}
    </style>
  </a>
)

export default Footer
