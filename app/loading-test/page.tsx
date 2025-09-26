'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { useAsyncOperation } from '@/hooks/useAsync'
import { getFeed } from '@/services/firestore'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function LoadingTestPage() {
  const { execute: executeWithLoading } = useAsyncOperation()
  const [result, setResult] = React.useState<any>(null)
  const [error, setError] = React.useState<string | null>(null)

  const testFirestoreConnection = async () => {
    try {
      setError(null)
      const data = await executeWithLoading(
        () => getFeed({ limitCount: 5 }),
        'Testing Firestore connection...'
      )
      setResult(data)
    } catch (err: any) {
      setError(err.message)
      console.error('Test error:', err)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Loading System Test</h1>
        <p className="text-muted-foreground">
          Test the loading system with Firestore connection
        </p>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={testFirestoreConnection}
          className="w-full"
        >
          Test Firestore Connection
        </Button>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Error:</strong> {error}
              <br />
              <span className="text-sm">
                This is likely caused by an ad blocker blocking Firestore connections.
                Try disabling your ad blocker or refreshing the page.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Success!</strong> Connected to Firestore successfully.
              <br />
              <span className="text-sm">
                Found {result.listings.length} listings. 
                {result.listings.some((l: any) => l.id?.startsWith('mock-')) 
                  ? ' (Using mock data)' 
                  : ' (Using real data)'}
              </span>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">What this test does:</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Tests Firestore connection with loading overlay</li>
          <li>• Shows specific error messages for blocked connections</li>
          <li>• Demonstrates the new loading system in action</li>
          <li>• Falls back to mock data if connection fails</li>
        </ul>
      </div>
    </div>
  )
}
