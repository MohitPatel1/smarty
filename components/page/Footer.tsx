import React from 'react'
import Link from 'next/link'
import { config } from 'config/config'
import { getSiteConfig } from 'config/site'

const Footer = (): React.ReactElement => {
  // Get hostname from window or headers in SSR
  const [siteConfig, setSiteConfig] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return getSiteConfig(window.location.hostname)
    }
    // During SSR, we'll use the default config
    return getSiteConfig('')
  })

  // Update config when component mounts in browser
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setSiteConfig(getSiteConfig(window.location.hostname))
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
