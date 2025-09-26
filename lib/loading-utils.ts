import React from 'react'
import { useLoading } from '@/contexts/LoadingContext'

// Utility functions for common loading patterns

export const createLoadingWrapper = () => {
  const { withLoading, setLoading } = useLoading()

  return {
    // Wrap any async function with loading
    wrap: <T>(asyncFn: () => Promise<T>, text?: string, id?: string) => 
      withLoading(asyncFn, text, id),

    // Set loading state manually
    set: (isLoading: boolean, text?: string, id?: string) => 
      setLoading(isLoading, text, id),

    // Common loading patterns
    patterns: {
      // For API calls
      apiCall: <T>(apiFn: () => Promise<T>, endpoint?: string) =>
        withLoading(apiFn, `Loading ${endpoint || 'data'}...`),

      // For form submissions
      formSubmit: <T>(submitFn: () => Promise<T>, formName?: string) =>
        withLoading(submitFn, `Submitting ${formName || 'form'}...`),

      // For file uploads
      fileUpload: <T>(uploadFn: () => Promise<T>, fileName?: string) =>
        withLoading(uploadFn, `Uploading ${fileName || 'file'}...`),

      // For data fetching
      dataFetch: <T>(fetchFn: () => Promise<T>, dataType?: string) =>
        withLoading(fetchFn, `Fetching ${dataType || 'data'}...`),

      // For saving operations
      save: <T>(saveFn: () => Promise<T>, itemType?: string) =>
        withLoading(saveFn, `Saving ${itemType || 'changes'}...`),

      // For deletion operations
      delete: <T>(deleteFn: () => Promise<T>, itemType?: string) =>
        withLoading(deleteFn, `Deleting ${itemType || 'item'}...`)
    }
  }
}

// Higher-order function to wrap components with loading
export const withLoading = <P extends object>(
  Component: React.ComponentType<P>,
  loadingText?: string
) => {
  return (props: P & { isLoading?: boolean }) => {
    const { isLoading, ...restProps } = props
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">{loadingText || 'Loading...'}</p>
          </div>
        </div>
      )
    }

    return <Component {...(restProps as P)} />
  }
}

// Hook for conditional loading
export const useConditionalLoading = (condition: boolean, text?: string) => {
  const { setLoading } = useLoading()

  React.useEffect(() => {
    setLoading(condition, text)
  }, [condition, text, setLoading])
}

// Utility for debounced loading
export const useDebouncedLoading = (delay: number = 300) => {
  const [showLoading, setShowLoading] = React.useState(false)
  const { setLoading } = useLoading()

  const startLoading = React.useCallback((text?: string) => {
    setShowLoading(true)
    setLoading(true, text)
  }, [setLoading])

  const stopLoading = React.useCallback(() => {
    setShowLoading(false)
    setLoading(false)
  }, [setLoading])

  React.useEffect(() => {
    if (showLoading) {
      const timer = setTimeout(() => {
        if (showLoading) {
          setLoading(true)
        }
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [showLoading, delay, setLoading])

  return { startLoading, stopLoading }
}
