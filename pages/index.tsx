import React from 'react'
import type { GetStaticPropsContext, GetStaticPropsResult } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'

import { config } from 'config/config'
import { useSite } from 'contexts/SiteContext'
import { convertDates } from 'lib/data/firebase'
import { showErrorNotification } from 'lib/showNotification'
import { PageProps } from 'components/page/PageHead'
import { Article, articlesCollection, ArticlesContextProvider } from 'hooks/useArticles'
import { useUser } from 'hooks/useUser'
import ChatWindow from 'components/chat/ChatWindow'

import ArticleList from 'components/articles/ArticleList'
import CreateArticleForm from 'components/articles/CreateArticleForm'

interface ArticleListPageProps extends PageProps {
  articles: Article[]
}

function ArticleListPage ({ articles }: ArticleListPageProps) {
  // Note: 'query' contains both /:params and ?query=value from url
  const { query } = useRouter()
  const { user, signOut } = useUser()
  const { siteConfig } = useSite()

  const handleSignOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    void signOut()
  }

  return (
    <>
      <h1>{siteConfig.name}'s Life</h1>

      <p><em>{siteConfig.domain}</em></p>

      <ArticlesContextProvider
        articles={articles}
        onError={showErrorNotification}
      >
        <ArticleList />
        {/* <CreateArticleForm /> */}
      </ArticlesContextProvider>

      <h2>Sign in (using Firebase Authentication)</h2>
      {(user != null)
        ? (
          <>
            <p>You are signed in as <strong>{user.email ?? user.displayName}</strong></p>
            <p><a href="#" onClick={handleSignOut}>Sign out</a></p>
            
            <h2>Chat</h2>
            <ChatWindow />
          </>
          )
        : (
          <Link href='/signin' className="signin-link">
            Click here to sign in
          </Link>
          )}

      <h2>Chat with Admin</h2>
      <Link legacyBehavior href='/chatWithMohit'>
        <a>Go to Chat</a>
      </Link>

      <h2>Add to Home Screen</h2>
      <p>You can add this to your Home Screen on iOS/Android, it should then start full screen.</p>

      <p>Version {config.appVersion}</p>
    </>
  )
}

export default ArticleListPage

// SSG
export async function getStaticProps ({ params }: GetStaticPropsContext): Promise<GetStaticPropsResult<ArticleListPageProps>> {
  const articlesRaw = await articlesCollection()
  const articles = articlesRaw.map(convertDates) as Article[]
  return {
    props: {
      articles
    },
    revalidate: 10 * 60 // Refresh page every 10 minutes
  }
}

// SSR
// export async function getServerSideProps ({ req, res, query: { slug } }) {
//   return {
//     articles
//   }
// }
