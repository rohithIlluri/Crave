import { useLoading } from '@/contexts/LoadingContext'
import type { LoadingWrapper } from '@/types/loading'

// Utility functions for common loading patterns
export const createLoadingWrapper = (): LoadingWrapper => {
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

// Production-optimized loading utilities
export const createLoadingPatterns = () => {
  const { withLoading } = useLoading()
  
  return {
    apiCall: <T>(apiFn: () => Promise<T>, endpoint?: string) =>
      withLoading(apiFn, `Loading ${endpoint || 'data'}...`),
    
    formSubmit: <T>(submitFn: () => Promise<T>, formName?: string) =>
      withLoading(submitFn, `Submitting ${formName || 'form'}...`),
    
    fileUpload: <T>(uploadFn: () => Promise<T>, fileName?: string) =>
      withLoading(uploadFn, `Uploading ${fileName || 'file'}...`),
    
    dataFetch: <T>(fetchFn: () => Promise<T>, dataType?: string) =>
      withLoading(fetchFn, `Fetching ${dataType || 'data'}...`),
    
    save: <T>(saveFn: () => Promise<T>, itemType?: string) =>
      withLoading(saveFn, `Saving ${itemType || 'changes'}...`),
    
    delete: <T>(deleteFn: () => Promise<T>, itemType?: string) =>
      withLoading(deleteFn, `Deleting ${itemType || 'item'}...`)
  }
}
