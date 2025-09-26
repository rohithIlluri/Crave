'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { useAsync, useAsyncOperation } from '@/hooks/useAsync'
import { useLoading } from '@/contexts/LoadingContext'

// Example async functions
const simulateApiCall = (delay: number = 2000): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Data loaded after ${delay}ms`)
    }, delay)
  })
}

const simulateError = (): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Simulated error occurred'))
    }, 1500)
  })
}

export const LoadingExample: React.FC = () => {
  const { execute: executeWithLoading } = useAsyncOperation()
  const { setLoading } = useLoading()

  // Example 1: Using useAsync hook with state management
  const {
    data: asyncData,
    error: asyncError,
    isLoading: asyncLoading,
    execute: executeAsync,
    reset: resetAsync
  } = useAsync(simulateApiCall, {
    loadingText: 'Loading data...',
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error)
  })

  // Example 2: Using useAsyncOperation for simple operations
  const handleSimpleLoading = async () => {
    try {
      const result = await executeWithLoading(
        () => simulateApiCall(3000),
        'Processing request...'
      )
      alert(result)
    } catch (error) {
      alert('Error: ' + (error as Error).message)
    }
  }

  // Example 3: Manual loading control
  const handleManualLoading = async () => {
    setLoading(true, 'Manual loading...', 'manual-1')
    try {
      await simulateApiCall(2000)
      alert('Manual loading completed!')
    } catch (error) {
      alert('Error: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Example 4: Error handling
  const handleErrorLoading = async () => {
    try {
      await executeWithLoading(
        simulateError,
        'This will fail...'
      )
    } catch (error) {
      alert('Caught error: ' + (error as Error).message)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Loading System Examples</h2>
      
      {/* Example 1: useAsync with state */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">1. useAsync Hook (with state management)</h3>
        <div className="flex gap-2">
          <Button 
            onClick={() => executeAsync(2000)} 
            disabled={asyncLoading}
          >
            {asyncLoading ? 'Loading...' : 'Load Data (2s)'}
          </Button>
          <Button 
            onClick={resetAsync} 
            variant="outline"
          >
            Reset
          </Button>
        </div>
        {asyncData && (
          <div className="p-3 bg-green-100 border border-green-300 rounded">
            <strong>Data:</strong> {asyncData}
          </div>
        )}
        {asyncError && (
          <div className="p-3 bg-red-100 border border-red-300 rounded">
            <strong>Error:</strong> {asyncError.message}
          </div>
        )}
      </div>

      {/* Example 2: Simple async operation */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">2. Simple Async Operation</h3>
        <Button onClick={handleSimpleLoading}>
          Load Data (3s) - Simple
        </Button>
      </div>

      {/* Example 3: Manual loading control */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">3. Manual Loading Control</h3>
        <Button onClick={handleManualLoading}>
          Manual Loading (2s)
        </Button>
      </div>

      {/* Example 4: Error handling */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">4. Error Handling</h3>
        <Button onClick={handleErrorLoading} variant="destructive">
          Simulate Error (1.5s)
        </Button>
      </div>
    </div>
  )
}
