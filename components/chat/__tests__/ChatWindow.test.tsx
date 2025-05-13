import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import type { FirebaseFirestore } from '@firebase/firestore-types'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  DocumentData,
  QuerySnapshot,
  Firestore
} from '@firebase/firestore'
import ChatWindow from '../ChatWindow'
import useUser from 'hooks/useUser'
import showNotification from 'lib/showNotification'

// Mock the hooks and modules
jest.mock('hooks/useUser')
jest.mock('lib/showNotification')

// Mock Firebase modules
jest.mock('lib/data/firebase', () => {
  const mockCollection = jest.fn()
  return {
    firebaseDB: {
      collection: mockCollection
    }
  }
})

// Mock Firebase functions
jest.mock('@firebase/firestore', () => {
  const mockAddDoc = jest.fn()
  const mockOnSnapshot = jest.fn()
  const mockQuery = jest.fn()
  const mockOrderBy = jest.fn()
  const mockCollection = jest.fn()

  return {
    collection: mockCollection,
    query: mockQuery,
    orderBy: mockOrderBy,
    onSnapshot: mockOnSnapshot,
    addDoc: mockAddDoc,
    serverTimestamp: () => new Date('2024-01-01T12:00:00Z')
  }
})

describe('ChatWindow', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User'
  }

  const mockMessages = [
    {
      id: '1',
      text: 'Hello',
      userId: 'test-uid',
      userName: 'Test User',
      timestamp: new Date('2024-01-01T11:00:00Z')
    },
    {
      id: '2',
      text: 'Hi there',
      userId: 'other-uid',
      userName: 'Other User',
      timestamp: new Date('2024-01-01T11:01:00Z')
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock useUser hook
    ;(useUser as jest.Mock).mockReturnValue({ user: mockUser })

    // Set up Firebase mocks
    const { collection: mockCollection, query: mockQuery, orderBy: mockOrderBy, onSnapshot: mockOnSnapshot } = jest.requireMock('@firebase/firestore')
    mockCollection.mockReturnValue('messages-collection')
    mockQuery.mockReturnValue('messages-query')
    mockOrderBy.mockReturnValue('messages-order')

    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = jest.fn()

    // Mock Firebase snapshot
    mockOnSnapshot.mockImplementation((query: unknown, callback: (snapshot: QuerySnapshot<DocumentData>) => void) => {
      const mockSnapshot = {
        docs: mockMessages.map(msg => ({
          id: msg.id,
          data: () => ({
            ...msg,
            timestamp: {
              toDate: () => msg.timestamp
            }
          })
        })),
        metadata: {
          hasPendingWrites: false,
          fromCache: false,
          isEqual: (other: unknown) => false
        },
        size: mockMessages.length,
        empty: mockMessages.length === 0,
        query: {} as any,
        docChanges: () => [],
        forEach: (callback: (doc: any) => void) => {
          mockMessages.forEach(msg => callback({
            id: msg.id,
            data: () => ({
              ...msg,
              timestamp: {
                toDate: () => msg.timestamp
              }
            })
          }))
        }
      }
      callback(mockSnapshot as unknown as QuerySnapshot<DocumentData>)
      return () => {}
    })
  })

  it('renders sign in message when user is not authenticated', () => {
    ;(useUser as jest.Mock).mockReturnValue({ user: null })
    render(<ChatWindow />)
    expect(screen.getByText('Please sign in to use the chat')).toBeInTheDocument()
  })

  it('renders chat window with messages when user is authenticated', async () => {
    render(<ChatWindow />)
    
    // Check if messages are rendered
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument()
      expect(screen.getByText('Hi there')).toBeInTheDocument()
    })

    // Check if message form is rendered
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument()
    expect(screen.getByText('Send')).toBeInTheDocument()
  })

  it('sends a new message when form is submitted', async () => {
    const { addDoc: mockAddDoc } = jest.requireMock('@firebase/firestore')
    render(<ChatWindow />)
    
    const input = screen.getByPlaceholderText('Type a message...')
    const form = screen.getByRole('button', { name: 'Send' }).closest('form')!

    await userEvent.type(input, 'New message')
    await act(async () => {
      fireEvent.submit(form)
    })

    expect(mockAddDoc).toHaveBeenCalledWith(
      'messages-collection',
      expect.objectContaining({
        text: 'New message',
        userId: mockUser.uid,
        userName: mockUser.displayName
      })
    )
  })

  it('does not send empty messages', async () => {
    const { addDoc: mockAddDoc } = jest.requireMock('@firebase/firestore')
    render(<ChatWindow />)
    
    const form = screen.getByRole('button', { name: 'Send' }).closest('form')!
    await act(async () => {
      fireEvent.submit(form)
    })

    expect(mockAddDoc).not.toHaveBeenCalled()
  })

  it('shows error notification when sending message fails', async () => {
    const { addDoc: mockAddDoc } = jest.requireMock('@firebase/firestore')
    mockAddDoc.mockRejectedValueOnce(new Error('Failed to send'))
    render(<ChatWindow />)
    
    const input = screen.getByPlaceholderText('Type a message...')
    const form = screen.getByRole('button', { name: 'Send' }).closest('form')!

    await userEvent.type(input, 'New message')
    await act(async () => {
      fireEvent.submit(form)
    })

    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith('Failed to send message', 'error')
    })
  })

  it('displays messages with correct styling based on sender', async () => {
    render(<ChatWindow />)
    
    await waitFor(() => {
      const messages = screen.getAllByText(/Hello|Hi there/)
      const sentMessage = messages[0].closest('.message')
      const receivedMessage = messages[1].closest('.message')
      
      expect(sentMessage).toHaveClass('sent')
      expect(receivedMessage).toHaveClass('received')
    })
  })

  it('clears input after sending message', async () => {
    render(<ChatWindow />)
    
    const input = screen.getByPlaceholderText('Type a message...')
    const form = screen.getByRole('button', { name: 'Send' }).closest('form')!

    await userEvent.type(input, 'New message')
    await act(async () => {
      fireEvent.submit(form)
    })

    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })
}) 