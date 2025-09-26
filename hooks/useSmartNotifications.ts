"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getUserUnreadCount } from "@/services/chats"
import { useNotifications, type NotificationData } from "@/components/NotificationBanner"

export function useSmartNotifications() {
  const { user } = useAuth()
  const { notifications, addNotification, dismissNotification, clearAll } = useNotifications()
  const [unreadCount, setUnreadCount] = useState(0)

  // Listen for unread message count changes
  useEffect(() => {
    if (!user) return

    const unsubscribe = getUserUnreadCount(user.uid, (count) => {
      const previousCount = unreadCount
      setUnreadCount(count)
      
      // Show notification for new messages
      if (count > previousCount && previousCount > 0) {
        addNotification({
          type: 'message',
          title: 'New Message',
          description: `You have ${count - previousCount} new message${count - previousCount > 1 ? 's' : ''}`,
          timestamp: new Date(),
          actions: [
            {
              label: 'View',
              action: () => window.location.href = '/chats',
              variant: 'default'
            },
            {
              label: 'Later',
              action: () => {},
              variant: 'ghost'
            }
          ]
        })
      }
    })

    return unsubscribe
  }, [user, unreadCount, addNotification])

  // Smart notification helpers
  const notifyListingInterest = (listingTitle: string, interestedUser: string, avatar?: string) => {
    addNotification({
      type: 'message',
      title: 'Someone is interested!',
      description: `${interestedUser} is interested in your ${listingTitle}`,
      avatar,
      username: interestedUser,
      timestamp: new Date(),
      actions: [
        {
          label: 'Reply',
          action: () => window.location.href = '/chats',
          variant: 'default'
        }
      ]
    })
  }

  const notifyPickupReminder = (listingTitle: string, buyerName: string) => {
    addNotification({
      type: 'info',
      title: 'Pickup Reminder',
      description: `${buyerName} is scheduled to pick up ${listingTitle} today`,
      timestamp: new Date(),
      actions: [
        {
          label: 'Message',
          action: () => window.location.href = '/chats',
          variant: 'default'
        }
      ]
    })
  }

  const notifyListingExpiry = (listingTitle: string) => {
    addNotification({
      type: 'warning',
      title: 'Listing Expiring',
      description: `Your listing "${listingTitle}" expires in 2 hours`,
      timestamp: new Date(),
      actions: [
        {
          label: 'Extend',
          action: () => {},
          variant: 'default'
        },
        {
          label: 'Edit',
          action: () => {},
          variant: 'outline'
        }
      ]
    })
  }

  return {
    notifications,
    unreadCount,
    dismissNotification,
    clearAll,
    notifyListingInterest,
    notifyPickupReminder,
    notifyListingExpiry,
  }
}
