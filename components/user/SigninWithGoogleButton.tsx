import React from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { GoogleAuthProvider, signInWithPopup } from '@firebase/auth'

import { config } from 'config/config'
import { firebaseAuth } from 'lib/data/firebase'
import showNotification from 'lib/showNotification'

interface SigninWithGoogleButtonProps {
  googleEventName?: string
  redirectTo?: string
}

const SigninWithGoogleButton = ({ redirectTo = config.startPagePath ?? '/' }: SigninWithGoogleButtonProps): React.ReactElement => {
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(firebaseAuth, provider)
    } catch (error: any) {
      console.error('Error signing in with Google:', error)
      showNotification(`Could not sign in with Google: ${error.message}`, 'error')
    }
  }

  return (
    <div className='google-signin-container'>
      <button color='primary' onClick={handleGoogleSignIn}>
        <Image src='/images/google_g.svg' alt='Google G Logo' width={24} height={24} style={{ marginRight: 6 }} />
        Sign in with Google
      </button>
      <style jsx>{`
        button {
          display: inline-flex;
          justify-content: center;
          align-items: center;
        }
      `}
      </style>
    </div>
  )
}
export default SigninWithGoogleButton
