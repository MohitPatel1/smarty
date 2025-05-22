/*
  import useUser from 'hooks/useUser'
  const { user } = useUser()
*/
import { useState, useEffect } from 'react'
import { User } from '@firebase/auth'

import { firebaseAuth } from 'lib/data/firebase'

export interface UserState {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

export const useUser = (): UserState => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      await firebaseAuth.signOut()
    } catch (error: unknown) {
      console.warn(`Warning: ${(error instanceof Error) ? error.message : 'Unknown error'}`)
    }
  }

  return { user, loading, signOut }
}
