"use client"

import { Menu, User, Heart, MessageCircle, LogOut, Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { usePermissions } from "@/hooks/usePermissions"
import { AuthModal } from "./AuthModal"
import { useRouter } from "next/navigation"
import { useSmartNotifications } from "@/hooks/useSmartNotifications"
import { NotificationBanner } from "./NotificationBanner"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const { user, logout } = useAuth()
  const { canAccessAdminPanel } = usePermissions()
  const { notifications, unreadCount, dismissNotification } = useSmartNotifications()
  const router = useRouter()

  const handleAuthClick = (mode: "signin" | "signup") => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-orange-600 cursor-pointer" onClick={() => router.push("/")}>
              FoodShare
            </h1>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => router.push("/")} className="text-gray-600 hover:text-orange-600">
              Browse
            </button>
            <button onClick={() => router.push("/categories")} className="text-gray-600 hover:text-orange-600">
              Categories
            </button>
            {user && (
              <button onClick={() => router.push("/create-listing")} className="text-gray-600 hover:text-orange-600">
                Sell
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => router.push("/chats")} className="relative">
                  <MessageCircle className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-gradient-to-r from-orange-500 to-pink-500"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                        <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/my-listings")}>
                      <Plus className="mr-2 h-4 w-4" />
                      My Listings
                    </DropdownMenuItem>
                    {canAccessAdminPanel && (
                      <DropdownMenuItem onClick={() => router.push("/admin")}>
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => handleAuthClick("signin")}>
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => handleAuthClick("signup")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="flex flex-col space-y-2 p-4">
              <button onClick={() => router.push("/")} className="text-gray-600 hover:text-orange-600 py-2 text-left">
                Browse
              </button>
              <button
                onClick={() => router.push("/categories")}
                className="text-gray-600 hover:text-orange-600 py-2 text-left"
              >
                Categories
              </button>
              {user && (
                <button
                  onClick={() => router.push("/create-listing")}
                  className="text-gray-600 hover:text-orange-600 py-2 text-left"
                >
                  Sell
                </button>
              )}
              <button className="text-gray-600 hover:text-orange-600 py-2 text-left">Favorites</button>
            </div>
          </div>
        )}
      </nav>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
      
      {/* Notification Banner */}
      <NotificationBanner 
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </>
  )
}
