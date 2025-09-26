'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useLoading } from '@/contexts/LoadingContext'
import type { UseAsyncOptions, UseAsyncReturn } from '@/types/loading'

export const useAsync = <T = any>(
  asyncFn: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncReturn<T> => {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const { withLoading } = useLoading()
  const isMountedRef = useRef(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const execute = useCallback(async (...args: any[]): Promise<T | undefined> => {
    // Cancel previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    
    try {
      if (!isMountedRef.current) return
      setIsLoading(true)
      setError(null)
      
      const result = await withLoading(
        () => asyncFn(...args),
        options.loadingText,
        options.loadingId
      )
      
      if (!isMountedRef.current) return
      
      setData(result)
      options.onSuccess?.(result)
      return result
    } catch (err) {
      if (!isMountedRef.current) return
      
      const error = err instanceof Error ? err : new Error('An error occurred')
      setError(error)
      options.onError?.(error)
      
      // Log error in production
      if (process.env.NODE_ENV === 'production') {
        console.error('useAsync error:', error)
      }
      
      throw error
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [asyncFn, withLoading, options])

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    data,
    error,
    isLoading,
    execute,
    reset
  }
}

// Hook for simple async operations without state management
export const useAsyncOperation = () => {
  const { withLoading } = useLoading()

  const execute = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    loadingText?: string,
    loadingId?: string
  ): Promise<T> => {
    return withLoading(asyncFn, loadingText, loadingId)
  }, [withLoading])

  return { execute }
}
