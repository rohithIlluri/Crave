'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { useAsync, useAsyncOperation } from '@/hooks/useAsync'
import { useLoading } from '@/contexts/LoadingContext'
import { createLoadingWrapper } from '@/lib/loading-utils'

export const LoadingSystemDocs: React.FC = () => {
  const { execute: executeWithLoading } = useAsyncOperation()
  const { setLoading } = useLoading()
  const loadingWrapper = createLoadingWrapper()

  // Example async function
  const fetchData = async (delay: number = 2000): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, delay))
    return `Data loaded after ${delay}ms`
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Loading System Documentation</h1>
        <p className="text-muted-foreground">
          A comprehensive loading system for your React app with async function support
        </p>
      </div>

      {/* Basic Usage */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Basic Usage</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">1. useAsyncOperation Hook</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Simple async operations with global loading overlay
            </p>
            <Button 
              onClick={() => executeWithLoading(
                () => fetchData(2000),
                'Loading data...'
              )}
              className="w-full"
            >
              Execute with Loading
            </Button>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">2. useAsync Hook</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Async operations with state management
            </p>
            <Button 
              onClick={() => {
                const { execute } = useAsync(fetchData, {
                  loadingText: 'Fetching data...',
                  onSuccess: (data) => console.log('Success:', data)
                })
                execute(1500)
              }}
              className="w-full"
            >
              Execute with State
            </Button>
          </div>
        </div>
      </section>

      {/* Manual Loading Control */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Manual Loading Control</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Start Loading</h3>
            <Button 
              onClick={() => setLoading(true, 'Manual loading...', 'manual-1')}
              className="w-full"
            >
              Start Loading
            </Button>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Stop Loading</h3>
            <Button 
              onClick={() => setLoading(false)}
              variant="outline"
              className="w-full"
            >
              Stop Loading
            </Button>
          </div>
        </div>
      </section>

      {/* Loading Patterns */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Common Loading Patterns</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">API Call</h3>
            <Button 
              onClick={() => loadingWrapper.patterns.apiCall(
                () => fetchData(2000),
                'users'
              )}
              className="w-full"
            >
              Load Users
            </Button>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Form Submit</h3>
            <Button 
              onClick={() => loadingWrapper.patterns.formSubmit(
                () => fetchData(1500),
                'profile'
              )}
              className="w-full"
            >
              Submit Form
            </Button>
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">File Upload</h3>
            <Button 
              onClick={() => loadingWrapper.patterns.fileUpload(
                () => fetchData(3000),
                'image.jpg'
              )}
              className="w-full"
            >
              Upload File
            </Button>
          </div>
        </div>
      </section>

      {/* Loader Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Loader Variants</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg text-center">
            <Loader variant="spinner" size="lg" text="Spinner" />
          </div>
          <div className="p-4 border rounded-lg text-center">
            <Loader variant="dots" size="lg" text="Dots" />
          </div>
          <div className="p-4 border rounded-lg text-center">
            <Loader variant="pulse" size="lg" text="Pulse" />
          </div>
          <div className="p-4 border rounded-lg text-center">
            <Loader variant="skeleton" size="lg" text="Skeleton" />
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Code Examples</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">1. Basic Usage</h3>
            <pre className="text-sm overflow-x-auto">
{`import { useAsyncOperation } from '@/hooks/useAsync'

const MyComponent = () => {
  const { execute } = useAsyncOperation()
  
  const handleClick = async () => {
    try {
      const result = await execute(
        () => fetchData(),
        'Loading data...'
      )
      console.log(result)
    } catch (error) {
      console.error(error)
    }
  }
  
  return <button onClick={handleClick}>Load Data</button>
}`}
            </pre>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">2. With State Management</h3>
            <pre className="text-sm overflow-x-auto">
{`import { useAsync } from '@/hooks/useAsync'

const MyComponent = () => {
  const { data, error, isLoading, execute } = useAsync(fetchData, {
    loadingText: 'Loading...',
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error)
  })
  
  return (
    <div>
      <button onClick={() => execute()}>
        {isLoading ? 'Loading...' : 'Load Data'}
      </button>
      {data && <div>Data: {data}</div>}
      {error && <div>Error: {error.message}</div>}
    </div>
  )
}`}
            </pre>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">3. Manual Control</h3>
            <pre className="text-sm overflow-x-auto">
{`import { useLoading } from '@/contexts/LoadingContext'

const MyComponent = () => {
  const { setLoading } = useLoading()
  
  const handleAsyncOperation = async () => {
    setLoading(true, 'Processing...', 'my-operation')
    try {
      await someAsyncFunction()
    } finally {
      setLoading(false)
    }
  }
  
  return <button onClick={handleAsyncOperation}>Process</button>
}`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  )
}
