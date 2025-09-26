"use client"

import { useState, useEffect } from "react"
import { X, MessageCircle, Bell, Info, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

export interface NotificationData {
  id: string
  type: 'message' | 'system' | 'success' | 'warning' | 'info'
  title: string
  description: string
  avatar?: string
  username?: string
  chatId?: string
  listingId?: string
  timestamp: Date
  actions?: {
    label: string
    action: () => void
    variant?: 'default' | 'outline' | 'ghost'
  }[]
  autoHide?: boolean
  duration?: number
}

interface NotificationBannerProps {
  notifications: NotificationData[]
  onDismiss: (id: string) => void
  maxVisible?: number
}

export function NotificationBanner({ notifications, onDismiss, maxVisible = 3 }: NotificationBannerProps) {
  const router = useRouter()
  const [visibleNotifications, setVisibleNotifications] = useState<NotificationData[]>([])

  useEffect(() => {
    setVisibleNotifications(notifications.slice(0, maxVisible))
  }, [notifications, maxVisible])

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-5 w-5 text-orange-600" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-orange-50 border-orange-200'
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 w-96 max-w-[calc(100vw-2rem)]">
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`
            ${getBgColor(notification.type)}
            border backdrop-blur-sm bg-opacity-95
            rounded-lg p-4 shadow-lg hover:shadow-xl
            transition-all duration-200 cursor-pointer
            transform hover:scale-[1.02] animate-in slide-in-from-right-5
          `}
          style={{ animationDelay: `${index * 100}ms` }}
          onClick={() => {
            if (notification.chatId) {
              router.push('/chats')
              onDismiss(notification.id)
            }
          }}
        >
          <div className="flex items-start justify-between space-x-3">
            <div className="flex items-start space-x-3 flex-1">
              {notification.avatar ? (
                <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                  <AvatarImage src={notification.avatar} />
                  <AvatarFallback>{notification.username?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(notification.type)}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {notification.title}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {new Date(notification.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {notification.description}
                </p>
                
                {notification.actions && (
                  <div className="flex space-x-2 mt-3">
                    {notification.actions.map((action, idx) => (
                      <Button
                        key={idx}
                        size="sm"
                        variant={action.variant || 'default'}
                        onClick={(e) => {
                          e.stopPropagation()
                          action.action()
                          onDismiss(notification.id)
                        }}
                        className="text-xs"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDismiss(notification.id)
              }}
              className="flex-shrink-0 h-6 w-6 p-0 hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    
    setNotifications(prev => [newNotification, ...prev])
    
    // Auto-hide notification
    if (notification.autoHide !== false) {
      setTimeout(() => {
        dismissNotification(id)
      }, notification.duration || 5000)
    }
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAll,
  }
}
