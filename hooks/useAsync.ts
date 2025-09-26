'use client'

import { useState, useCallback } from 'react'
import { useLoading } from '@/contexts/LoadingContext'

interface UseAsyncOptions {
  loadingText?: string
  loadingId?: string
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

interface UseAsyncReturn<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  execute: (...args: any[]) => Promise<T | undefined>
  reset: () => void
}

export const useAsync = <T = any>(
  asyncFn: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncReturn<T> => {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const { withLoading } = useLoading()

  const execute = useCallback(async (...args: any[]): Promise<T | undefined> => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await withLoading(
        () => asyncFn(...args),
        options.loadingText,
        options.loadingId
      )
      
      setData(result)
      options.onSuccess?.(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred')
      setError(error)
      options.onError?.(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [asyncFn, withLoading, options])

  const reset = useCallback(() => {
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
