import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'

import { useSite } from 'contexts/SiteContext'

export default class MyDocument extends Document {
  // this.props (Server only): __NEXT_DATA__, ampPath, assetPrefix, bodyTags, canonicalBase, dangerousAsPath, dataOnly, devFiles, dynamicImports, files, hasCssMode, head, headTags, html, htmlProps, hybridAmp, inAmpMode, isDevelopment, polyfillFiles, staticMarkup, styles
  // Page props in: this.props.__NEXT_DATA__.props.pageProps
  render (): React.ReactElement {
    const locale = 'en'
    const { siteConfig } = useSite()
    return (
      <Html lang={locale}>
        <Head>
          <link rel='stylesheet' href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap' />
          
          {/* PWA Meta Tags */}
          <meta name="application-name" content={siteConfig.name} />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content={siteConfig.name} />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#007bff" />

          {/* PWA Icons */}
          <link rel="apple-touch-icon" href="/icons/mohit-192x192.png" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="shortcut icon" href="/favicon.ico" />

          {/* Global Site Tag (gtag.js) - Google Analytics */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
