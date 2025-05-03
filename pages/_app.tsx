import React, { useEffect } from 'react'
import type { AppProps } from 'next/app'
import Router from 'next/router'
import Link from 'next/link'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import OfflineIndicator from '../components/common/OfflineIndicator'

import PageHead from 'components/page/PageHead'
// import Header from 'components/page/Header'
import Footer from 'components/page/Footer'
import Notifications from 'components/page/Notifications'
import { googlePageview } from 'components/page/GoogleAnalytics'

// Import global CSS files here
import 'aether-css-framework/dist/aether.min.css'
import 'public/app.css'

Router.events.on('routeChangeComplete', path => googlePageview(path))

export default function App ({ Component, pageProps, router }: AppProps): React.ReactElement {
  // props (Server + Client): Component, err, pageProps, router     
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registration successful', registration);
          
          // Check for updates on page load
          registration.update();
          
          // Listen for new service worker installation
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is installed and ready to take over
                  if (confirm('New version available! Click OK to refresh.')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('Service Worker registration failed', err);
        });
    }
  }, []);

  return (
    <ErrorBoundary>
      <PageHead
        {...pageProps}
        path={router.asPath}
      />
      {/*
      <Header
        title={config.appName}
      />
 */}
      <OfflineIndicator />
      <main>
        <Component
          {...pageProps}
          {...router}
        />
      </main>
      <Footer />

      <Link href='/' className='button circle-menu-button'><img src='/icons/home.svg' alt='Home' /></Link>
      <button className='circle-menu-button right'><img src='/icons/person.svg' alt='User' /></button>
      <button className='circle-menu-button bottom right'><img src='/icons/help.svg' alt='Help' /></button>

      <Notifications />
    </ErrorBoundary>
  )
}
