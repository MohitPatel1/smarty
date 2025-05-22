import React, { useEffect } from 'react'
import type { GetStaticPropsResult } from 'next'
import Router from 'next/router'
import querystring from 'querystring'
import { signInWithEmailLink, isSignInWithEmailLink, User, updateProfile } from '@firebase/auth'

import { config } from 'config/config'
import { firebaseAuth } from 'lib/data/firebase'

const titleCase = (str: string): string => str.replace(/(?:^|\s|[-"'([{])+\S/g, (c) => c.toUpperCase())
const emailToName = (email: string): string => titleCase(email.split('@')[0].replace(/\./g, ' '))

interface EmailAuthenticatePageProps {
  title: string
  query?: { [key: string]: string }
}

const EmailAuthenticatePage: React.FC<EmailAuthenticatePageProps> = ({ query }) => {
  useEffect(() => {
    const authenticateUser = async () => {
      try {
        if (isSignInWithEmailLink(firebaseAuth, window.location.href)) {
          let email = window.localStorage.getItem('emailForSignIn')
          if (!email) {
            email = window.prompt('Please provide your email for confirmation')
          }
          if (email) {
            const result = await signInWithEmailLink(firebaseAuth, email, window.location.href)
            window.localStorage.removeItem('emailForSignIn')
            const user = result.user
            if (user) {
              await updateProfile(user, { displayName: email.split('@')[0] })
            }
            void Router.push('/')
          }
        }
      } catch (error: any) {
        console.error('Error authenticating user:', error)
      }
    }

    void authenticateUser()
  }, [])

  return (
    <>
      <h1>Logging in to {config.appName}...</h1>
    </>
  )
}

export default EmailAuthenticatePage

export async function getStaticProps (): Promise<GetStaticPropsResult<EmailAuthenticatePageProps>> {
  return {
    props: {
      title: 'Logging in'
    }
  }
}
