import React, { useState, useEffect, useRef } from 'react'
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, DocumentData, QuerySnapshot } from '@firebase/firestore'
import { firebaseDB } from 'lib/data/firebase'
import useUser from 'hooks/useUser'
import showNotification from 'lib/showNotification'

interface Message {
  id: string
  text: string
  userId: string
  userName: string
  timestamp: Date
}

const ChatWindow: React.FC = () => {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return

    const messagesRef = collection(firebaseDB, 'messages')
    const q = query(messagesRef, orderBy('timestamp', 'asc'))

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      })) as Message[]
      setMessages(newMessages)
    })

    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newMessage.trim()) return

    try {
      const messagesRef = collection(firebaseDB, 'messages')
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        userId: user.uid,
        userName: user.displayName || user.email,
        timestamp: serverTimestamp()
      })
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      showNotification('Failed to send message', 'error')
    }
  }

  if (!user) {
    return <div>Please sign in to use the chat</div>
  }

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((message: Message) => (
          <div
            key={message.id}
            className={`message ${message.userId === user.uid ? 'sent' : 'received'}`}
          >
            <div className="message-content">
              <div className="message-sender">{message.userName}</div>
              <div className="message-text">{message.text}</div>
              <div className="message-time">
                {message.timestamp?.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>

      <style jsx>{`
        .chat-window {
          display: flex;
          flex-direction: column;
          height: 500px;
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
        }

        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f5f5f5;
        }

        .message {
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
        }

        .message.sent {
          align-items: flex-end;
        }

        .message.received {
          align-items: flex-start;
        }

        .message-content {
          max-width: 70%;
          padding: 10px 15px;
          border-radius: 15px;
          background: white;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .message.sent .message-content {
          background: #007bff;
          color: white;
        }

        .message-sender {
          font-size: 0.8em;
          margin-bottom: 5px;
          color: #666;
        }

        .message.sent .message-sender {
          color: rgba(255,255,255,0.8);
        }

        .message-time {
          font-size: 0.7em;
          margin-top: 5px;
          color: #999;
        }

        .message.sent .message-time {
          color: rgba(255,255,255,0.8);
        }

        .message-form {
          display: flex;
          padding: 10px;
          background: white;
          border-top: 1px solid #eee;
        }

        .message-input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-right: 10px;
        }

        .send-button {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .send-button:hover {
          background: #0056b3;
        }
      `}</style>
    </div>
  )
}

export default ChatWindow 