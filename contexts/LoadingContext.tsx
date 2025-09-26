'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface LoadingState {
  isLoading: boolean
  loadingText?: string
  loadingId?: string
}

interface LoadingContextType {
  loadingState: LoadingState
  setLoading: (isLoading: boolean, text?: string, id?: string) => void
  withLoading: <T>(asyncFn: () => Promise<T>, text?: string, id?: string) => Promise<T>
  clearLoading: (id?: string) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

interface LoadingProviderProps {
  children: ReactNode
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false
  })

  const setLoading = useCallback((isLoading: boolean, text?: string, id?: string) => {
    setLoadingState(prev => ({
      ...prev,
      isLoading,
      loadingText: text,
      loadingId: id
    }))
  }, [])

  const clearLoading = useCallback((id?: string) => {
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
