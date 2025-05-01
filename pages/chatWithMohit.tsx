import React, { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from '@firebase/firestore'
import { firebaseDB } from 'lib/data/firebase'
import useUser from 'hooks/useUser'

interface Message {
  id?: string
  chatId: string
  sender: string
  receiver: string
  text: string
  timestamp: any
}

interface Chat {
  id: string
  user1: string
  user2: string
}

const ADMIN_EMAIL = 'mohit.patel1966@gmail.com'

const getChatId = (user1: string, user2: string) => {
  // Always sort to ensure unique chat per pair
  return [user1, user2].sort().join('__')
}

const ChatWithMohit = () => {
  const { user, isAdmin } = useUser()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  // Load chats for admin, or just the user's chat for regular users
  useEffect(() => {
    if (!user) return
    if (isAdmin) {
      // Admin: show all chats
      const q = query(collection(firebaseDB, 'chats'))
      const unsub = onSnapshot(q, (snapshot) => {
        setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat)))
      })
      return () => unsub()
    } else {
      // Regular user: only their chat with admin
      const chatId = getChatId(user.email!, ADMIN_EMAIL)
      const q = query(collection(firebaseDB, 'chats'), where('id', '==', chatId))
      const unsub = onSnapshot(q, (snapshot) => {
        const chatDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat))
        setChats(chatDocs)
        setSelectedChat(chatDocs[0] || null)
      })
      return () => unsub()
    }
  }, [user, isAdmin])

  // Load messages for selected chat
  useEffect(() => {
    if (!selectedChat) return
    const q = query(
      collection(firebaseDB, 'chats', selectedChat.id, 'messages'),
      orderBy('timestamp', 'asc')
    )
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)))
    })
    return () => unsub()
  }, [selectedChat])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !user || !selectedChat) return
    await addDoc(collection(firebaseDB, 'chats', selectedChat.id, 'messages'), {
      chatId: selectedChat.id,
      sender: user.email,
      receiver: isAdmin ? (selectedChat.user1 === ADMIN_EMAIL ? selectedChat.user2 : selectedChat.user1) : ADMIN_EMAIL,
      text: input,
      timestamp: serverTimestamp(),
    })
    setInput('')
  }

  // Admin: select chat to view
  const handleSelectChat = (chat: Chat) => setSelectedChat(chat)

  // If user has no chat, create it
  useEffect(() => {
    if (!user || isAdmin) return
    if (chats.length === 0) {
      const chatId = getChatId(user.email!, ADMIN_EMAIL)
      addDoc(collection(firebaseDB, 'chats'), {
        id: chatId,
        user1: user.email,
        user2: ADMIN_EMAIL,
      })
    }
  }, [user, isAdmin, chats])

  if (!user) return <div>Please sign in to chat.</div>

  return (
    <div style={{ display: 'flex', maxWidth: 800, margin: '2em auto' }}>
      {isAdmin && (
        <div style={{ minWidth: 200, borderRight: '1px solid #eee', paddingRight: 16 }}>
          <h3>All Chats</h3>
          <ul>
            {chats.map(chat => (
              <li key={chat.id} style={{ cursor: 'pointer', fontWeight: selectedChat?.id === chat.id ? 'bold' : 'normal' }} onClick={() => handleSelectChat(chat)}>
                {chat.user1 === ADMIN_EMAIL ? chat.user2 : chat.user1}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div style={{ flex: 1, paddingLeft: isAdmin ? 16 : 0 }}>
        <h3>Chat</h3>
        {selectedChat ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: 400, border: '1px solid #eee', borderRadius: 8, padding: 16, overflowY: 'auto', marginBottom: 8 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ margin: '4px 0', textAlign: msg.sender === user.email ? 'right' : 'left' }}>
                <span style={{ background: msg.sender === user.email ? '#d6ffc8' : '#eee', borderRadius: 8, padding: '4px 8px', display: 'inline-block' }}>
                  <b>{msg.sender === user.email ? 'You' : msg.sender}</b>: {msg.text}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div>No chat selected.</div>
        )}
        {selectedChat && (
          <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
            <input
              type='text'
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder='Type your message...'
              style={{ flex: 1 }}
            />
            <button type='submit'>Send</button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ChatWithMohit
