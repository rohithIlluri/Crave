"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Navbar } from "@/components/Navbar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  MessageCircle, 
  Search, 
  ArrowLeft, 
  Send, 
  Mic,
  Image as ImageIcon,
  Smile,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  Zap,
  X
} from "lucide-react"
import { getUserChats, getChatMessages, sendMessage, markMessagesAsRead, type Chat, type ChatMessage } from "@/services/chats"
import { 
  sendEnhancedMessage,
  setTypingIndicator,
  clearTypingIndicator,
  getTypingIndicators,
  QUICK_REPLIES,
  type TypingIndicator
} from "@/services/enhanced-chats"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function EnhancedChats() {
  const { user } = useAuth()
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([])
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }
  }, [user, router])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Load user's chats
  useEffect(() => {
    if (!user) return

    const unsubscribe = getUserChats(user.uid, (userChats) => {
      setChats(userChats)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  // Load messages for selected chat
  useEffect(() => {
    if (!selectedChat) return

    const unsubscribe = getChatMessages(selectedChat.id, (chatMessages) => {
      setMessages(chatMessages)
      // Mark messages as read when viewing chat
      if (user && selectedChat.unreadCount[user.uid] > 0) {
        markMessagesAsRead(selectedChat.id, user.uid)
      }
    })

    return unsubscribe
  }, [selectedChat, user])

  // Handle typing indicators
  useEffect(() => {
    if (!selectedChat) return

    const unsubscribe = getTypingIndicators(selectedChat.id, (indicators) => {
      setTypingUsers(indicators.filter(i => i.userId !== user?.uid))
    })

    return unsubscribe
  }, [selectedChat, user])

  // Handle typing detection
  useEffect(() => {
    if (!selectedChat || !user) return

    if (newMessage.length > 0 && !isTyping) {
      setIsTyping(true)
      setTypingIndicator(selectedChat.id, user.uid, user.displayName || "User")
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false)
        clearTypingIndicator(selectedChat.id, user.uid)
      }
    }, 2000)

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [newMessage, selectedChat, user, isTyping])

  const handleSendMessage = async (content: string = newMessage.trim(), messageType: 'text' | 'quick_reply' = 'text') => {
    if (!content || !selectedChat || !user || sendingMessage) return

    setSendingMessage(true)
    try {
      await sendEnhancedMessage(
        selectedChat.id,
        user.uid,
        user.displayName || user.email || "Anonymous",
        user.photoURL || null,
        content,
        messageType
      )
      setNewMessage("")
      setShowQuickReplies(false)
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply, 'quick_reply')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getOtherParticipant = (chat: Chat) => {
    if (!user) return null
    const otherIndex = chat.participants.findIndex(id => id !== user.uid)
    return otherIndex !== -1 ? {
      id: chat.participants[otherIndex],
      name: chat.participantNames[otherIndex],
      photo: chat.participantPhotos[otherIndex]
    } : null
  }

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return formatDistanceToNow(date, { addSuffix: true })
  }

  const getMessageStatus = (message: ChatMessage) => {
    if (message.senderId !== user?.uid) return null
    
    // This would be enhanced with real delivery status from Firebase
    if (message.read) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />
    }
    return <Check className="h-3 w-3 text-gray-400" />
  }

  const isProducer = (chat: Chat) => {
    // Logic to determine if current user is the producer in this conversation
    return chat.listingTitle && messages.some(m => 
      m.senderId === user?.uid && m.content.includes("available")
    )
  }

  const getQuickReplies = () => {
    if (!selectedChat || !user) return []
    
    const userType = isProducer(selectedChat) ? 'producer' : 'consumer'
    
    // Smart suggestions based on conversation context
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.senderId === user.uid) {
      return QUICK_REPLIES[userType].interested
    }
    
    if (lastMessage.content.toLowerCase().includes('pick') || lastMessage.content.toLowerCase().includes('when')) {
      return QUICK_REPLIES[userType].pickup
    }
    
    if (lastMessage.content.toLowerCase().includes('price') || lastMessage.content.toLowerCase().includes('cost')) {
      return userType === 'producer' ? QUICK_REPLIES.producer.price : QUICK_REPLIES.consumer.interested
    }
    
    return QUICK_REPLIES[userType].availability
  }

  const filteredChats = chats.filter(chat => {
    const otherParticipant = getOtherParticipant(chat)
    return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
           chat.listingTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <Navbar />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Enhanced Chat List Sidebar */}
        <div className={`${selectedChat ? 'hidden md:block' : 'block'} w-full md:w-80 bg-white/80 backdrop-blur border-r border-gray-200 flex flex-col`}>
          {/* Header with search */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Messages
              </h1>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                {chats.filter(chat => chat.unreadCount[user?.uid || ''] > 0).length} new
              </Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
          </div>

          {/* Enhanced Chat List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No conversations yet</h3>
                <p className="text-gray-500 mb-4">
                  Start chatting by contacting sellers on their food listings!
                </p>
                <Button onClick={() => router.push("/")} variant="outline">
                  Browse Listings
                </Button>
              </div>
            ) : (
              <div className="p-2">
                {filteredChats.map((chat, index) => {
                  const otherParticipant = getOtherParticipant(chat)
                  const unreadCount = chat.unreadCount[user.uid] || 0
                  
                  return (
                    <div
                      key={chat.id}
                      className="animate-in slide-in-from-left-2"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Card
                        className={cn(
                          "mb-2 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
                          selectedChat?.id === chat.id 
                            ? 'bg-gradient-to-r from-orange-50 to-pink-50 border-orange-200 shadow-md' 
                            : 'hover:bg-gray-50',
                          unreadCount > 0 && 'ring-2 ring-orange-200'
                        )}
                        onClick={() => setSelectedChat(chat)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                                <AvatarImage src={otherParticipant?.photo || ""} />
                                <AvatarFallback className="bg-gradient-to-r from-orange-400 to-pink-400 text-white">
                                  {otherParticipant?.name?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              {/* Online indicator */}
                              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900 truncate">
                                  {otherParticipant?.name || "Unknown User"}
                                </h3>
                                <div className="flex items-center space-x-2">
                                  {unreadCount > 0 && (
                                    <div className="relative">
                                      <Badge 
                                        variant="destructive" 
                                        className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-gradient-to-r from-orange-500 to-pink-500"
                                      >
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                      </Badge>
                                      <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-25"></div>
                                    </div>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {formatMessageTime(chat.lastMessageTime)}
                                  </span>
                                </div>
                              </div>
                              
                              {chat.listingTitle && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                  <p className="text-xs text-orange-600 font-medium truncate">
                                    {chat.listingTitle}
                                  </p>
                                </div>
                              )}
                              
                              <p className="text-sm text-gray-600 truncate mt-1">
                                {chat.lastMessage || "No messages yet"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Chat Messages Area */}
        <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white/50 backdrop-blur`}>
          {selectedChat ? (
            <>
              {/* Enhanced Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white/80 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="md:hidden"
                      onClick={() => setSelectedChat(null)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                        <AvatarImage src={getOtherParticipant(selectedChat)?.photo || ""} />
                        <AvatarFallback className="bg-gradient-to-r from-orange-400 to-pink-400 text-white">
                          {getOtherParticipant(selectedChat)?.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border border-white rounded-full"></div>
                    </div>
                    
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {getOtherParticipant(selectedChat)?.name || "Unknown User"}
                      </h2>
                      {selectedChat.listingTitle && (
                        <p className="text-sm text-orange-600 font-medium">
                          Re: {selectedChat.listingTitle}
                        </p>
                      )}
                      {typingUsers.length > 0 && (
                        <p className="text-xs text-gray-500 animate-pulse">
                          typing...
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Enhanced Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isOwnMessage = message.senderId === user.uid
                    const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1].senderId !== message.senderId)
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                          {showAvatar && (
                            <div className="flex items-center space-x-2 mb-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={message.senderPhoto || ""} />
                                <AvatarFallback className="text-xs bg-gray-200">
                                  {message.senderName?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-500">{message.senderName}</span>
                            </div>
                          )}
                          
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 hover:scale-[1.02]",
                              isOwnMessage
                                ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                                : 'bg-white border border-gray-200 text-gray-900'
                            )}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className={cn(
                              "flex items-center justify-between mt-2 text-xs",
                              isOwnMessage ? 'text-orange-100' : 'text-gray-500'
                            )}>
                              <span>{formatMessageTime(message.timestamp)}</span>
                              {isOwnMessage && (
                                <div className="flex items-center space-x-1">
                                  {getMessageStatus(message)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                
                {/* Typing indicators */}
                {typingUsers.map((user) => (
                  <div key={user.userId} className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {showQuickReplies && (
                <div className="p-4 border-t border-gray-200 bg-gray-50 animate-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-700">Quick Replies</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQuickReplies(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {getQuickReplies().map((reply, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickReply(reply)}
                        className="w-full text-left justify-start h-auto py-2 px-3 text-xs hover:bg-orange-50 hover:border-orange-200 animate-in slide-in-from-bottom-1"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {reply}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white/80 backdrop-blur">
                <div className="flex items-end space-x-2">
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => setShowQuickReplies(!showQuickReplies)}>
                      <Zap className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sendingMessage}
                      className="pr-12 rounded-full border-gray-300 focus:border-orange-400"
                    />
                    <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={() => handleSendMessage()} 
                    disabled={!newMessage.trim() || sendingMessage}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-full w-12 h-12 p-0 transition-all duration-200 hover:scale-105"
                  >
                    {sendingMessage ? (
                      <Clock className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Enhanced No Chat Selected */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mx-auto flex items-center justify-center">
                    <MessageCircle className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full mx-auto animate-ping opacity-25"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Welcome to your messages!
                </h3>
                <p className="text-gray-500 mb-6">
                  Select a conversation to start chatting with fellow food lovers
                </p>
                <Button 
                  onClick={() => router.push("/")}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                >
                  Find Food to Share
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
