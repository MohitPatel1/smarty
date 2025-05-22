import React from 'react'
import Head from 'next/head'

import { useSite } from 'contexts/SiteContext'

export interface PageProps {
  title?: string
  description?: string
  imageUrl?: string
  iconUrl?: string
  path?: string
}

const PageHead = ({ title, description, imageUrl, iconUrl = '/favicon.png', path = '/' }: PageProps): React.ReactElement | null => {
  const { siteConfig } = useSite()
  const pageTitle = (title !== undefined && title !== null)
    ? `${(title)} – ${siteConfig.name}`
    : `${siteConfig.name} – ${siteConfig.domain}`

  const pageDescription = description ?? `${siteConfig.name}'s Life – ${siteConfig.domain}`

  // SEO: title 60 characters, description 160 characters
  // if (isDevelopment()) console.log(`PageHead (dev):\n• title (${60 - pageTitle.length}): "${pageTitle}"\n• description (${160 - pageDescription.length}): "${pageDescription}"`)

  const thumbnailUrl = imageUrl ?? `/images/preview_default.png`

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name='description' content={pageDescription} />

      <meta charSet='utf-8' />
      <meta httpEquiv='content-language' content='en' />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />

      <link rel='manifest' href='/manifest.json' />

      <link rel='shortcut icon' type='image/x-icon' href={iconUrl} />

      <meta property='og:site_name' content={siteConfig.name} />
      <meta property='og:title' content={pageTitle} />
      <meta property='og:description' content={pageDescription} />
      <meta property='og:locale' content='en_US' />

      {(thumbnailUrl !== undefined && thumbnailUrl !== null) && (
        <>
          <meta property='og:image' content={thumbnailUrl} />
          <meta name='twitter:image' content={thumbnailUrl} />
        </>
      )}

      <meta name='twitter:card' content='summary' />
      <meta name='twitter:title' content={pageTitle} />
      <meta name='twitter:description' content={pageDescription} />

      <link rel='apple-touch-icon' href={iconUrl} />
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
      <meta name='apple-mobile-web-app-title' content={siteConfig.name} />

      {/*
        <link rel='apple-touch-startup-image' href='' />

        <link rel='canonical' href={websiteUrl} />
        <meta property='og:url' content={websiteUrl} />

        <meta name='twitter:site' content={`@${config.landingPage.social.twitter}`} />
      */}

    </Head>
  )
}
export default PageHead
