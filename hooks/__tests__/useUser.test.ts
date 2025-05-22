import { renderHook, act } from '@testing-library/react'
import { getAuth, User } from '@firebase/auth'
import { useUser } from '../useUser'

jest.mock('@firebase/auth', () => ({
  getAuth: jest.fn()
}))

jest.mock('lib/data/firebase', () => ({
  firebaseApp: {}
}))

describe('useUser', () => {
  const mockAuth = {
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn()
  }

  const mockUser: Partial<User> = {
    email: 'test@example.com',
    uid: 'test-uid'
  }

  const mockAdminUser: Partial<User> = {
    email: 'mohit.patel1966@gmail.com',
    uid: 'admin-uid'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getAuth as jest.Mock).mockReturnValue(mockAuth)
  })

  it('initializes with null user', () => {
    mockAuth.onAuthStateChanged.mockImplementation(cb => {
      cb(null)
      return () => {}
    })

    const { result } = renderHook(() => useUser())
    expect(result.current.user).toBeNull()
    expect(result.current.isAdmin).toBe(false)
  })

  it('updates user state on auth state change', () => {
    mockAuth.onAuthStateChanged.mockImplementation(cb => {
      cb(mockUser as User)
      return () => {}
    })

    const { result } = renderHook(() => useUser())
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAdmin).toBe(false)
  })

  it('identifies admin user correctly', () => {
    mockAuth.onAuthStateChanged.mockImplementation(cb => {
      cb(mockAdminUser as User)
      return () => {}
    })

    const { result } = renderHook(() => useUser())
    expect(result.current.user).toEqual(mockAdminUser)
    expect(result.current.isAdmin).toBe(true)
  })

  it('handles sign out successfully', async () => {
    mockAuth.onAuthStateChanged.mockImplementation(cb => {
      cb(mockUser as User)
      return () => {}
    })
    mockAuth.signOut.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useUser())
    await act(async () => {
      await result.current.signOut()
    })

    expect(mockAuth.signOut).toHaveBeenCalled()
  })

  it('handles sign out error gracefully', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    mockAuth.onAuthStateChanged.mockImplementation(cb => {
      cb(mockUser as User)
      return () => {}
    })
    const error = new Error('Sign out failed')
    mockAuth.signOut.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useUser())
    await act(async () => {
      await result.current.signOut()
    })

    expect(consoleWarnSpy).toHaveBeenCalledWith('Warning: Sign out failed')
    consoleWarnSpy.mockRestore()
  })

  it('cleans up auth listener on unmount', () => {
    const unsubscribe = jest.fn()
    mockAuth.onAuthStateChanged.mockReturnValue(unsubscribe)

    const { unmount } = renderHook(() => useUser())
    unmount()

    expect(unsubscribe).toHaveBeenCalled()
  })
}) 