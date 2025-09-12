"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Loader2, ArrowLeft } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: "signin" | "signup" | "reset"
}

export function AuthModal({ isOpen, onClose, defaultMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup" | "reset">(defaultMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setDisplayName("")
    setLoading(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === "reset") {
        if (!email) {
          toast.error("Please enter your email address")
          return
        }
        await sendPasswordResetEmail(auth, email)
        toast.success("Password reset email sent! Check your inbox.")
        setMode("signin")
        return
      }

      if (mode === "signup") {
        if (password !== confirmPassword) {
          toast.error("Passwords don't match")
          return
        }
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters")
          return
        }
        if (!displayName.trim()) {
          toast.error("Please enter your full name")
          return
        }
      }

      if (mode === "signin") {
        await signIn(email, password)
        toast.success("Signed in successfully!")
      } else {
        await signUp(email, password, displayName.trim())
        toast.success("Account created successfully!")
      }
      handleClose()
    } catch (error: any) {
      console.error("Auth error:", error)

      // Better error messages
      let errorMessage = "An error occurred. Please try again."

      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address."
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again."
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please choose a stronger password."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      toast.success("Signed in with Google!")
      handleClose()
    } catch (error: any) {
      console.error("Google sign in error:", error)
      toast.error("Failed to sign in with Google. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getTitle = () => {
    switch (mode) {
      case "signin":
        return "Sign In"
      case "signup":
        return "Create Account"
      case "reset":
        return "Reset Password"
      default:
        return "Sign In"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "reset" && (
              <Button variant="ghost" size="sm" onClick={() => setMode("signin")} className="p-0 h-auto">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <Label htmlFor="displayName">Full Name *</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>
          )}

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          {mode !== "reset" && (
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
          )}

          {mode === "signup" && (
            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
          )}

          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "reset" ? "Sending..." : "Processing..."}
              </>
            ) : (
              getTitle()
            )}
          </Button>
        </form>

        {mode !== "reset" && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button variant="outline" onClick={handleGoogleSignIn} disabled={loading} className="w-full bg-transparent">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Continue with Google"}
            </Button>
          </>
        )}

        <div className="text-center text-sm space-y-2">
          {mode === "signin" && (
            <>
              <button
                type="button"
                onClick={() => setMode("reset")}
                className="text-orange-600 hover:underline block w-full"
                disabled={loading}
              >
                Forgot your password?
              </button>
              <div>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-orange-600 hover:underline"
                  disabled={loading}
                >
                  Sign up
                </button>
              </div>
            </>
          )}

          {mode === "signup" && (
            <div>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-orange-600 hover:underline"
                disabled={loading}
              >
                Sign in
              </button>
            </div>
          )}

          {mode === "reset" && (
            <div>
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-orange-600 hover:underline"
                disabled={loading}
              >
                Sign in
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
