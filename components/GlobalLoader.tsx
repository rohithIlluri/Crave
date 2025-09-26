'use client'

import React from 'react'
import { useLoadingState } from '@/contexts/LoadingContext'
import { Loader } from '@/components/ui/loader'

export const GlobalLoader: React.FC = () => {
  const { isLoading, loadingText } = useLoadingState()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-card p-8 shadow-lg border">
        <Loader 
          size="lg" 
          variant="spinner" 
          text={loadingText || 'Loading...'} 
        />
      </div>
    </div>
  )
}
