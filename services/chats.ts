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
  limit,
  startAfter,
  DocumentSnapshot,
} from "firebase/firestore"
import { getFirestore } from "firebase/firestore"
import { getFirebaseApp } from "@/lib/firebase"

export interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  senderName: string
  senderPhoto?: string
  content: string
  timestamp: Timestamp
  read: boolean
}

export interface Chat {
  id: string
  participants: string[] // Array of user IDs
  participantNames: string[] // Array of user display names
  participantPhotos: (string | null)[] // Array of user photos
  lastMessage: string
  lastMessageTime: Timestamp
  lastMessageSender: string
  unreadCount: { [userId: string]: number }
  createdAt: Timestamp
  listingId?: string // Optional: if chat is about a specific listing
  listingTitle?: string
}

export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
}

const db = getFirestore(getFirebaseApp())

// Create a new chat between two users
export async function createChat(
  currentUserId: string,
  currentUserName: string,
  currentUserPhoto: string | null,
  otherUserId: string,
  otherUserName: string,
  otherUserPhoto: string | null,
  listingId?: string,
  listingTitle?: string
): Promise<string> {
  try {
    // Check if chat already exists between these users
    const existingChat = await findExistingChat(currentUserId, otherUserId)
    if (existingChat) {
      return existingChat.id
    }

    // Create new chat
    const chatData: Omit<Chat, "id"> = {
      participants: [currentUserId, otherUserId],
      participantNames: [currentUserName, otherUserName],
      participantPhotos: [currentUserPhoto, otherUserPhoto],
      lastMessage: "",
      lastMessageTime: serverTimestamp() as Timestamp,
      lastMessageSender: "",
      unreadCount: {
        [currentUserId]: 0,
        [otherUserId]: 0,
      },
      createdAt: serverTimestamp() as Timestamp,
      listingId,
      listingTitle,
    }

    const docRef = await addDoc(collection(db, "chats"), chatData)
    return docRef.id
  } catch (error) {
    console.error("Error creating chat:", error)
    throw error
  }
}

// Find existing chat between two users
export async function findExistingChat(userId1: string, userId2: string): Promise<Chat | null> {
  try {
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId1)
    )
    
    const querySnapshot = await getDocs(q)
    
    for (const doc of querySnapshot.docs) {
      const chatData = doc.data() as Omit<Chat, "id">
      if (chatData.participants.includes(userId2)) {
        return { id: doc.id, ...chatData }
      }
    }
    
    return null
  } catch (error) {
    console.error("Error finding existing chat:", error)
    return null
  }
}

// Get all chats for a user
export function getUserChats(userId: string, callback: (chats: Chat[]) => void) {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageTime", "desc")
  )

  return onSnapshot(q, (snapshot) => {
    const chats: Chat[] = []
    snapshot.forEach((doc) => {
      chats.push({ id: doc.id, ...doc.data() } as Chat)
    })
    callback(chats)
  })
}

// Send a message in a chat
export async function sendMessage(
  chatId: string,
  senderId: string,
  senderName: string,
  senderPhoto: string | null,
  content: string
): Promise<void> {
  try {
    // Add message to messages subcollection
    await addDoc(collection(db, "chats", chatId, "messages"), {
      chatId,
      senderId,
      senderName,
      senderPhoto,
      content,
      timestamp: serverTimestamp(),
      read: false,
    })

    // Update chat's last message info
    const chatRef = doc(db, "chats", chatId)
    await updateDoc(chatRef, {
      lastMessage: content,
      lastMessageTime: serverTimestamp(),
      lastMessageSender: senderId,
      [`unreadCount.${senderId}`]: 0, // Reset sender's unread count
    })

    // Increment unread count for other participants
    const chatDoc = await getDocs(query(collection(db, "chats"), where("__name__", "==", chatId)))
    if (!chatDoc.empty) {
      const chatData = chatDoc.docs[0].data() as Chat
      const updates: any = {}
      
      chatData.participants.forEach((participantId) => {
        if (participantId !== senderId) {
          updates[`unreadCount.${participantId}`] = (chatData.unreadCount[participantId] || 0) + 1
        }
      })
      
      if (Object.keys(updates).length > 0) {
        await updateDoc(chatRef, updates)
      }
    }
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}

// Get messages for a chat
export function getChatMessages(chatId: string, callback: (messages: ChatMessage[]) => void) {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("timestamp", "asc")
  )

  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = []
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as ChatMessage)
    })
    callback(messages)
  })
}

// Mark messages as read
export async function markMessagesAsRead(chatId: string, userId: string): Promise<void> {
  try {
    // Reset unread count for this user
    const chatRef = doc(db, "chats", chatId)
    await updateDoc(chatRef, {
      [`unreadCount.${userId}`]: 0,
    })

    // Mark all messages in this chat as read (optional - for individual message read status)
    const messagesQuery = query(
      collection(db, "chats", chatId, "messages"),
      where("senderId", "!=", userId),
      where("read", "==", false)
    )
    
    const messagesSnapshot = await getDocs(messagesQuery)
    const updatePromises = messagesSnapshot.docs.map((messageDoc) =>
      updateDoc(doc(db, "chats", chatId, "messages", messageDoc.id), { read: true })
    )
    
    await Promise.all(updatePromises)
  } catch (error) {
    console.error("Error marking messages as read:", error)
    throw error
  }
}

// Get total unread count for a user across all chats
export function getUserUnreadCount(userId: string, callback: (count: number) => void) {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", userId)
  )

  return onSnapshot(q, (snapshot) => {
    let totalUnread = 0
    snapshot.forEach((doc) => {
      const chatData = doc.data() as Chat
      totalUnread += chatData.unreadCount[userId] || 0
    })
    callback(totalUnread)
  })
}
