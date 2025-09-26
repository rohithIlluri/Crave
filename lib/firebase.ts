"use client"

import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from "firebase/app"
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let cachedApp: FirebaseApp | null = null

export function getFirebaseApp(): FirebaseApp {
  if (cachedApp) return cachedApp

  if (typeof window !== "undefined") {
    const required = [firebaseConfig.apiKey, firebaseConfig.authDomain, firebaseConfig.projectId, firebaseConfig.appId]

    if (required.some((v) => !v)) {
      throw new Error("Firebase env missing. Check .env.local and restart dev server.")
    }

    if (process.env.NODE_ENV !== "production") {
      console.debug("[Firebase] Configuration loaded successfully")
    }
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  cachedApp = app
  return app
}

export function getAuthClient(): Auth {
  return getAuth(getFirebaseApp())
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseApp())
}

export function getStorageClient(): FirebaseStorage {
  return getStorage(getFirebaseApp())
}

export function getGoogleProvider(): GoogleAuthProvider {
  return new GoogleAuthProvider()
}

// Export instances for direct use
export const auth = getAuthClient()
export const db = getDb()
export const storage = getStorageClient()
export const googleProvider = getGoogleProvider()
export default getFirebaseApp()
