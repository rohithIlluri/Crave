interface ErrorLog {
  message: string
  stack?: string
  componentStack?: string
  timestamp: string
  userAgent: string
  url: string
  userId?: string
  sessionId?: string
}

class ErrorLogger {
  private sessionId: string
  private userId?: string

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  logError(error: Error, errorInfo?: { componentStack?: string }) {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.userId,
      sessionId: this.sessionId
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog)
      return
    }

    // In production, send to error tracking service
    this.sendToErrorService(errorLog)
  }

  private async sendToErrorService(errorLog: ErrorLog) {
    try {
      // Example implementation - replace with your error tracking service
      // Options: Sentry, LogRocket, Bugsnag, DataDog, etc.
      
      // For now, we'll use a simple fetch to a hypothetical API endpoint
      // In a real app, you'd integrate with your chosen error tracking service
      
      if (typeof window !== 'undefined' && 'fetch' in window) {
        await fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorLog)
        })
      }
    } catch (loggingError) {
      // Fallback: log to console if error service fails
      console.error('Failed to send error to tracking service:', loggingError)
      console.error('Original error:', errorLog)
    }
  }

  // Method to log custom events
  logEvent(eventName: string, properties?: Record<string, any>) {
    const eventLog = {
      event: eventName,
      properties,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      url: window.location.href
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Event logged:', eventLog)
      return
    }

    // Send to analytics service
    this.sendToAnalyticsService(eventLog)
  }

  private async sendToAnalyticsService(eventLog: any) {
    try {
      // Example implementation - replace with your analytics service
      // Options: Google Analytics, Mixpanel, Amplitude, etc.
      
      if (typeof window !== 'undefined' && 'fetch' in window) {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventLog)
        })
      }
    } catch (error) {
      console.error('Failed to send event to analytics service:', error)
    }
  }
}

// Create singleton instance
export const errorLogger = new ErrorLogger()

// Export for use in components
export const useErrorLogger = () => {
  return {
    logError: (error: Error, errorInfo?: { componentStack?: string }) => 
      errorLogger.logError(error, errorInfo),
    logEvent: (eventName: string, properties?: Record<string, any>) => 
      errorLogger.logEvent(eventName, properties),
    setUserId: (userId: string) => errorLogger.setUserId(userId)
  }
}
