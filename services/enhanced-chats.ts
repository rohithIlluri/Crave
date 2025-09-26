"use client"

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  getDocs,
  setDoc,
} from "firebase/firestore"
import { getFirestore } from "firebase/firestore"
import { getFirebaseApp } from "@/lib/firebase"

export interface EnhancedChatMessage {
  id: string
  chatId: string
  senderId: string
  senderName: string
  senderPhoto?: string
  content: string
  timestamp: Timestamp
  read: boolean
  messageType: 'text' | 'image' | 'voice' | 'quick_reply'
  status: 'sending' | 'sent' | 'delivered' | 'read'
  replyTo?: string // ID of message being replied to
  quickReplyType?: 'interested' | 'available' | 'price_negotiation' | 'pickup_time'
}

export interface TypingIndicator {
  userId: string
  userName: string
  chatId: string
  timestamp: Timestamp
}

export interface ChatPreferences {
  userId: string
  enableNotifications: boolean
  enableTypingIndicators: boolean
  autoMarkAsRead: boolean
  quickRepliesEnabled: boolean
}

const db = getFirestore(getFirebaseApp())

// Enhanced message sending with status tracking
export async function sendEnhancedMessage(
  chatId: string,
  senderId: string,
  senderName: string,
  senderPhoto: string | null,
  content: string,
  messageType: 'text' | 'image' | 'voice' | 'quick_reply' = 'text',
  quickReplyType?: string,
  replyTo?: string
): Promise<string> {
  try {
    const messageData = {
      chatId,
      senderId,
      senderName,
      senderPhoto,
      content,
      timestamp: serverTimestamp(),
      read: false,
      messageType,
      status: 'sent',
      quickReplyType,
      replyTo,
    }

    const docRef = await addDoc(collection(db, "chats", chatId, "messages"), messageData)

    // Update chat's last message info
    const chatRef = doc(db, "chats", chatId)
    await updateDoc(chatRef, {
      lastMessage: content,
      lastMessageTime: serverTimestamp(),
      lastMessageSender: senderId,
      [`unreadCount.${senderId}`]: 0,
    })

    // Clear typing indicator
    await clearTypingIndicator(chatId, senderId)

    return docRef.id
  } catch (error) {
    console.error("Error sending enhanced message:", error)
    throw error
  }
}

// Typing indicators
export async function setTypingIndicator(chatId: string, userId: string, userName: string): Promise<void> {
  try {
    await setDoc(doc(db, "chats", chatId, "typing", userId), {
      userId,
      userName,
      chatId,
      timestamp: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error setting typing indicator:", error)
  }
}

export async function clearTypingIndicator(chatId: string, userId: string): Promise<void> {
  try {
    await updateDoc(doc(db, "chats", chatId, "typing", userId), {
      timestamp: null,
    })
  } catch (error) {
    console.error("Error clearing typing indicator:", error)
  }
}

export function getTypingIndicators(chatId: string, callback: (indicators: TypingIndicator[]) => void) {
  const q = query(collection(db, "chats", chatId, "typing"))
  
  return onSnapshot(q, (snapshot) => {
    const indicators: TypingIndicator[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (data.timestamp) {
        indicators.push(data as TypingIndicator)
      }
    })
    callback(indicators)
  })
}

// Quick reply templates
export const QUICK_REPLIES = {
  consumer: {
    interested: [
      "I'm interested! Is this still available?",
      "When can I pick this up?",
      "Can you tell me more about this?",
      "Is the price negotiable?",
    ],
    pickup: [
      "When's the best time to pick up?",
      "Can I pick up today?",
      "Do you offer delivery?",
      "Where exactly is the pickup location?",
    ],
    thanks: [
      "Thank you so much!",
      "Perfect, see you then!",
      "Appreciate it!",
      "Sounds great!",
    ]
  },
  producer: {
    availability: [
      "Yes, it's still available!",
      "Sorry, this has been taken",
      "I have more if you're interested",
      "Let me check and get back to you",
    ],
    pickup: [
      "You can pick up anytime today",
      "How about this evening?",
      "I'm available on weekends",
      "Let me send you the exact address",
    ],
    price: [
      "The price is firm",
      "I can do a small discount for bulk",
      "Make me an offer!",
      "It's free - just come pick it up!",
    ]
  }
}
