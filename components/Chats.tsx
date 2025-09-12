"use client"

import { useEffect, useState } from "react"
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
  MoreVertical,
  AlertCircle 
} from "lucide-react"
import { getUserChats, getChatMessages, sendMessage, markMessagesAsRead, type Chat, type ChatMessage } from "@/services/chats"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export function Chats() {
  const { user } = useAuth()
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }
  }, [user, router])

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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user || sendingMessage) return

    setSendingMessage(true)
    try {
      await sendMessage(
        selectedChat.id,
        user.uid,
        user.displayName || user.email || "Anonymous",
        user.photoURL || null,
        newMessage.trim()
      )
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setSendingMessage(false)
    }
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Chat List Sidebar */}
        <div className={`${selectedChat ? 'hidden md:block' : 'block'} w-full md:w-80 bg-white border-r border-gray-200 flex flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold mb-3">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Chat List */}
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
                {filteredChats.map((chat) => {
                  const otherParticipant = getOtherParticipant(chat)
                  const unreadCount = chat.unreadCount[user.uid] || 0
                  
                  return (
                    <Card
                      key={chat.id}
                      className={`mb-2 cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedChat?.id === chat.id ? 'bg-orange-50 border-orange-200' : ''
                      }`}
                      onClick={() => setSelectedChat(chat)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={otherParticipant?.photo || ""} />
                            <AvatarFallback>
                              {otherParticipant?.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900 truncate">
                                {otherParticipant?.name || "Unknown User"}
                              </h3>
                              <div className="flex items-center space-x-2">
                                {unreadCount > 0 && (
                                  <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                  {formatMessageTime(chat.lastMessageTime)}
                                </span>
                              </div>
                            </div>
                            
                            {chat.listingTitle && (
                              <p className="text-xs text-orange-600 font-medium truncate">
                                Re: {chat.listingTitle}
                              </p>
                            )}
                            
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {chat.lastMessage || "No messages yet"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setSelectedChat(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getOtherParticipant(selectedChat)?.photo || ""} />
                    <AvatarFallback>
                      {getOtherParticipant(selectedChat)?.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h2 className="font-semibold">
                      {getOtherParticipant(selectedChat)?.name || "Unknown User"}
                    </h2>
                    {selectedChat.listingTitle && (
                      <p className="text-sm text-orange-600">
                        Re: {selectedChat.listingTitle}
                      </p>
                    )}
                  </div>
                </div>
                
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwnMessage = message.senderId === user.uid
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : 'order-2'}`}>
                          {!isOwnMessage && (
                            <div className="flex items-center space-x-2 mb-1">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={message.senderPhoto || ""} />
                                <AvatarFallback className="text-xs">
                                  {message.senderName?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-500">{message.senderName}</span>
                            </div>
                          )}
                          
                          <div
                            className={`rounded-lg px-3 py-2 ${
                              isOwnMessage
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isOwnMessage ? 'text-orange-100' : 'text-gray-500'
                            }`}>
                              {formatMessageTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sendingMessage}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim() || sendingMessage}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* No Chat Selected */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
