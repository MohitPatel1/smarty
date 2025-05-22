import React from 'react'
import Link from 'next/link'
import { useSite } from 'contexts/SiteContext'

interface HeaderProps {
  title?: string
  children?: React.ReactNode
}

const Header: React.FC<HeaderProps> = ({ title, children }) => {
  const { siteConfig } = useSite()
  const displayTitle = title || siteConfig.name
  return (
    <header className='color-header-bg color-background-fg'>
      <AppIcon />
      {displayTitle}
      {children}
      <style jsx>{`
        header {
          position: fixed;
          z-index: 1000;
          width: 100%;
          left: 0;
          top: 0;
          height: 50px;
          line-height: 50px;
          font-weight: normal;
          text-align: center;
        }

        :global(main) {
          margin-top: 50px;
        }
      `}
      </style>
    </header>
  )
}

export default Header

const AppIcon: React.FC = () => {
  const { siteConfig } = useSite()
  return (
    <Link href='/' className='app-icon' title={siteConfig.name}>
      <img src='/favicon.png' alt={siteConfig.name} />
      <style jsx>{`
        a:hover {
          filter: none;
        }

        img {
          position: absolute;
          left: 10px;
          top: 10px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
        }
      `}
      </style>
    </Link>
  )
}
