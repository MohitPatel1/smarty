declare module 'components/chat/ChatWindow' {
  import { FC } from 'react'
  const ChatWindow: FC
  export default ChatWindow
}

declare module 'firebase/firestore' {
  import { DocumentData } from 'firebase/firestore'
  export interface QuerySnapshot<T = DocumentData> {
    docs: Array<{
      id: string
      data: () => T
    }>
  }
} 