'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react'
import type { LoadingState, LoadingContextType } from '@/types/loading'

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

interface LoadingProviderProps {
  children: ReactNode
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false
  })
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const activeOperationsRef = useRef<Set<string>>(new Set())

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const setLoading = useCallback((isLoading: boolean, text?: string, id?: string) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (isLoading && id) {
      activeOperationsRef.current.add(id)
    } else if (!isLoading && id) {
      activeOperationsRef.current.delete(id)
    }

    setLoadingState(prev => ({
      ...prev,
      isLoading,
      loadingText: text,
      loadingId: id
    }))
  }, [])

  const clearLoading = useCallback((id?: string) => {
    if (id) {
      activeOperationsRef.current.delete(id)
    } else {
      activeOperationsRef.current.clear()
    }

    setLoadingState(prev => {
      // If no id provided or if the current loading id matches, clear loading
      if (!id || !prev.loadingId || prev.loadingId === id) {
        return { isLoading: false }
      }
      return prev
    })
  }, [])

  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>, 
    text?: string, 
    id?: string
  ): Promise<T> => {
    const loadingId = id || `loading-${Date.now()}-${Math.random()}`
    
    try {
      setLoading(true, text, loadingId)
      const result = await asyncFn()
      return result
    } catch (error) {
      // Log error in production
      if (process.env.NODE_ENV === 'production') {
        console.error('Loading operation failed:', error)
      }
      throw error
    } finally {
      clearLoading(loadingId)
    }
  }, [setLoading, clearLoading])

  const value: LoadingContextType = {
    loadingState,
    setLoading,
    withLoading,
    clearLoading
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

// Hook for components that need to show loading state
export const useLoadingState = () => {
  const { loadingState } = useLoading()
  return loadingState
}
