import React from 'react'
import { cn } from '@/lib/utils'
import type { LoaderProps } from '@/types/loading'

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  variant = 'spinner', 
  className,
  text 
}) => {
  const baseClasses = sizeClasses[size]

  if (variant === 'spinner') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
        <div className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-primary',
          baseClasses
        )} />
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        )}
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'bg-primary rounded-full animate-pulse',
                size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
              )}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        )}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
        <div className={cn(
          'bg-primary rounded-full animate-pulse',
          baseClasses
        )} />
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        )}
      </div>
    )
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
        <div className={cn(
          'bg-muted rounded animate-pulse',
          baseClasses
        )} />
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        )}
      </div>
    )
  }

  return null
}

export { Loader }
