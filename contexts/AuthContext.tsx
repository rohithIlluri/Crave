"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
} from "firebase/auth"
import { auth, googleProvider, db } from "@/lib/firebase"
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore"
import { ExtendedUser, UserRole } from "@/types/auth"
import { DEFAULT_PERMISSIONS, checkPermission } from "@/lib/permissions"

interface AuthContextType {
  user: ExtendedUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: keyof ExtendedUser['permissions']) => boolean
  isAdmin: boolean
  isModerator: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Helper function to get user data from Firestore
  const getUserData = async (firebaseUser: User): Promise<ExtendedUser> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid)
    const userDoc = await getDoc(userDocRef)
    
    if (userDoc.exists()) {
      const userData = userDoc.data()
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: (userData.role as UserRole) || 'user',
        permissions: DEFAULT_PERMISSIONS[(userData.role as UserRole) || 'user'],
        isVerified: firebaseUser.emailVerified,
        createdAt: userData.createdAt?.toDate() || new Date(),
        lastLoginAt: new Date(),
      }
    } else {
      // Create new user document
      const newUserData = {
        role: 'user' as UserRole,
        createdAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
        isVerified: firebaseUser.emailVerified,
      }
      
      await setDoc(userDocRef, newUserData)
      
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: 'user',
        permissions: DEFAULT_PERMISSIONS.user,
        isVerified: firebaseUser.emailVerified,
        createdAt: new Date(),
        lastLoginAt: new Date(),
      }
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getUserData(firebaseUser)
          setUser(userData)
        } catch (error) {
          console.error("Error fetching user data:", error)
          // Fallback to basic user data if Firestore fails
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: 'user',
            permissions: DEFAULT_PERMISSIONS.user,
            isVerified: firebaseUser.emailVerified,
            createdAt: new Date(),
            lastLoginAt: new Date(),
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(user, { displayName })
  }

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider)
  }

  const logout = async () => {
    await signOut(auth)
  }

  // Permission helper functions
  const hasPermission = (permission: keyof ExtendedUser['permissions']): boolean => {
    return user ? checkPermission(user.role, permission) : false
  }

  const isAdmin = user?.role === 'admin'
  const isModerator = user?.role === 'moderator' || user?.role === 'admin'

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    hasPermission,
    isAdmin,
    isModerator,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
