import React, { useEffect, useState, useRef } from 'react'
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from '@firebase/firestore'
import { firebaseDB } from 'lib/data/firebase'
import { useUser } from 'hooks/useUser'
import { uploadToCloudinary } from 'lib/data/cloudinary'

interface Message {
  id?: string
  chatId: string
  sender: string
  receiver: string
  text?: string
  timestamp: any
  mediaUrl?: string
  mediaType?: string
  fileName?: string
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
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chats for admin, or just the user's chat for regular users
  useEffect(() => {
    if (!user) return
    if (isAdmin) {
      // Admin: show all chats
      const q = query(collection(firebaseDB, 'chats'))
      const unsub = onSnapshot(q, (snapshot) => {
        // Create a Map to store unique chats by user email
        const uniqueChatsMap = new Map<string, Chat>()
        
        snapshot.docs.forEach(doc => {
          const chat = { id: doc.id, ...doc.data() } as Chat
          const otherUserEmail = chat.user1 === ADMIN_EMAIL ? chat.user2 : chat.user1
          
          // Only store the most recent chat for each user
          if (!uniqueChatsMap.has(otherUserEmail)) {
            uniqueChatsMap.set(otherUserEmail, chat)
          }
        })
        
        // Convert Map values back to array
        setChats(Array.from(uniqueChatsMap.values()))
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && !file) || !user || !selectedChat) return
    
    let mediaUrl = undefined
    let mediaType = undefined
    let fileName = undefined

    if (file) {
      setUploading(true)
      setUploadProgress(0)
      try {
        mediaUrl = await uploadToCloudinary(file)
        mediaType = file.type
        fileName = file.name
        setUploadProgress(100)
      } catch (err) {
        alert('Failed to upload file. Please try again.')
        setUploading(false)
        setUploadProgress(0)
        return
      }
      setUploading(false)
      setFile(null)
      setUploadProgress(0)
    }

    await addDoc(collection(firebaseDB, 'chats', selectedChat.id, 'messages'), {
      chatId: selectedChat.id,
      sender: user.email,
      receiver: isAdmin ? (selectedChat.user1 === ADMIN_EMAIL ? selectedChat.user2 : selectedChat.user1) : ADMIN_EMAIL,
      text: input || '',
      timestamp: serverTimestamp(),
      mediaUrl,
      mediaType,
      fileName,
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

  if (!user) return <div className="signin-prompt">Please sign in to chat.</div>

  return (
    <div className="chat-container">
      {isAdmin && (
        <div className="chat-sidebar">
          <h3>All Chats</h3>
          <div className="chat-list">
            {chats.map(chat => (
              <div
                key={chat.id}
                className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                onClick={() => handleSelectChat(chat)}
              >
                {chat.user1 === ADMIN_EMAIL ? chat.user2 : chat.user1}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="chat-main">
        <div className="chat-header">
          <h3>Chat with {isAdmin && selectedChat ? (selectedChat.user1 === ADMIN_EMAIL ? selectedChat.user2 : selectedChat.user1) : 'Mohit'}</h3>
        </div>
        {selectedChat ? (
          <>
            <div className="messages-container">
              {messages.map(msg => (
                <div key={msg.id} className={`message ${msg.sender === user.email ? 'sent' : 'received'}`}>
                  <div className="message-content">
                    {msg.text && <div className="message-text">{msg.text}</div>}
                    {msg.mediaUrl && (
                      <div className="message-media">
                        {msg.mediaType?.startsWith('image') ? (
                          <img 
                            src={msg.mediaUrl} 
                            alt={msg.fileName || 'media'} 
                            onClick={() => window.open(msg.mediaUrl, '_blank')}
                          />
                        ) : (
                          <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="file-link">
                            📎 {msg.fileName || 'Download file'}
                          </a>
                        )}
                      </div>
                    )}
                    <div className="message-time">
                      {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="chat-input">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={uploading}
                className="text-input"
              />
              <label className="file-input-label">
                📎
                <input
                  type="file"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="file-input"
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,application/x-zip-compressed,application/octet-stream"
                />
              </label>
              {file && (
                <div className="selected-file">
                  Selected: {file.name}
                </div>
              )}
              <button type="submit" disabled={uploading} className="send-button">
                {uploading ? `Uploading ${uploadProgress}%` : 'Send'}
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat">No chat selected.</div>
        )}
      </div>

      <style jsx>{`
        .chat-container {
          display: flex;
          max-width: 1200px;
          margin: 2em auto;
          height: 80vh;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .chat-sidebar {
          width: 250px;
          border-right: 1px solid #eee;
          padding: 1em;
        }

        .chat-list {
          overflow-y: auto;
        }

        .chat-item {
          padding: 0.8em;
          margin: 0.5em 0;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .chat-item:hover {
          background-color: #f5f5f5;
        }

        .chat-item.active {
          background-color: #e3f2fd;
          color: #1976d2;
        }

        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .chat-header {
          padding: 1em;
          border-bottom: 1px solid #eee;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1em;
          display: flex;
          flex-direction: column;
          gap: 1em;
        }

        .message {
          display: flex;
          margin-bottom: 0.5em;
        }

        .message.sent {
          justify-content: flex-end;
        }

        .message-content {
          max-width: 70%;
          padding: 0.8em 1em;
          border-radius: 12px;
          position: relative;
        }

        .sent .message-content {
          background-color: #e3f2fd;
          border-bottom-right-radius: 4px;
        }

        .received .message-content {
          background-color: #f5f5f5;
          border-bottom-left-radius: 4px;
        }

        .message-text {
          margin-bottom: 0.4em;
          word-wrap: break-word;
        }

        .message-media img {
          max-width: 200px;
          max-height: 200px;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .message-media img:hover {
          transform: scale(1.05);
        }

        .file-link {
          color: #1976d2;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5em;
        }

        .file-link:hover {
          text-decoration: underline;
        }

        .message-time {
          font-size: 0.75em;
          color: #666;
          margin-top: 0.4em;
        }

        .chat-input {
          display: flex;
          gap: 0.5em;
          padding: 1em;
          border-top: 1px solid #eee;
          align-items: center;
        }

        .text-input {
          flex: 1;
          padding: 0.8em;
          border: 1px solid #ddd;
          border-radius: 24px;
          outline: none;
          transition: border-color 0.2s;
        }

        .text-input:focus {
          border-color: #1976d2;
        }

        .file-input-label {
          padding: 0.8em;
          cursor: pointer;
          border-radius: 50%;
          transition: background-color 0.2s;
          font-size: 1.2em;
        }

        .file-input-label:hover {
          background-color: #f5f5f5;
        }

        .file-input {
          display: none;
        }

        .selected-file {
          font-size: 0.8em;
          color: #666;
        }

        .send-button {
          padding: 0.8em 1.5em;
          background-color: #1976d2;
          color: white;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .send-button:hover:not(:disabled) {
          background-color: #1565c0;
        }

        .send-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .no-chat {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #666;
        }

        .signin-prompt {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 80vh;
          font-size: 1.2em;
          color: #666;
        }

        @media (max-width: 768px) {
          .chat-container {
            margin: 0;
            height: 100vh;
            border-radius: 0;
          }

          .chat-sidebar {
            display: ${isAdmin ? 'block' : 'none'};
            width: 100%;
            position: fixed;
            top: 0;
            left: 0;
            height: 100%;
            background: white;
            z-index: 10;
          }

          .chat-main {
            width: 100%;
          }

          .message-content {
            max-width: 85%;
          }
        }
      `}</style>
    </div>
  )
}

export default ChatWithMohit
