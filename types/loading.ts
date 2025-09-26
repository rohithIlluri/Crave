export interface LoadingState {
  isLoading: boolean
  loadingText?: string
  loadingId?: string
}

export interface LoadingContextType {
  loadingState: LoadingState
  setLoading: (isLoading: boolean, text?: string, id?: string) => void
  withLoading: <T>(asyncFn: () => Promise<T>, text?: string, id?: string) => Promise<T>
  clearLoading: (id?: string) => void
}

export interface UseAsyncOptions<T = any> {
  loadingText?: string
  loadingId?: string
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export interface UseAsyncReturn<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  execute: (...args: any[]) => Promise<T | undefined>
  reset: () => void
}

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton'
  className?: string
  text?: string
}

export interface LoadingWrapper {
  wrap: <T>(asyncFn: () => Promise<T>, text?: string, id?: string) => Promise<T>
  set: (isLoading: boolean, text?: string, id?: string) => void
  patterns: {
    apiCall: <T>(apiFn: () => Promise<T>, endpoint?: string) => Promise<T>
    formSubmit: <T>(submitFn: () => Promise<T>, formName?: string) => Promise<T>
    fileUpload: <T>(uploadFn: () => Promise<T>, fileName?: string) => Promise<T>
    dataFetch: <T>(fetchFn: () => Promise<T>, dataType?: string) => Promise<T>
    save: <T>(saveFn: () => Promise<T>, itemType?: string) => Promise<T>
    delete: <T>(deleteFn: () => Promise<T>, itemType?: string) => Promise<T>
  }
}

export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl'
export type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'skeleton'
