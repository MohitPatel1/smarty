import React from 'react'
import type { GetStaticPropsResult } from 'next'

import { useSite } from 'contexts/SiteContext'
import SigninWithEmailForm from 'components/user/SigninWithEmailForm'
import SigninWithGoogleButton from 'components/user/SigninWithGoogleButton'

interface SignInPageProps {
  title: string
  query?: { [key: string]: string }
}

function SigninPage (): React.ReactElement {
  const { siteConfig } = useSite()
  return (
    <>
      <h1>Sign in to {siteConfig.name}</h1>
      <SigninWithGoogleButton />
      <p>or sign in with email:</p>
      <SigninWithEmailForm />
    </>
  )
}

export default SigninPage

export async function getStaticProps (): Promise<GetStaticPropsResult<SignInPageProps>> {
  return {
    props: {
      title: 'Sign in'
    }
  }
}
