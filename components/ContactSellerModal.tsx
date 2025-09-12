"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Mail, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import type { FoodListing } from "@/services/firestore"

interface ContactSellerModalProps {
  isOpen: boolean
  onClose: () => void
  listing: FoodListing
  buyerName?: string
  buyerEmail?: string
}

export function ContactSellerModal({
  isOpen,
  onClose,
  listing,
  buyerName = "",
  buyerEmail = "",
}: ContactSellerModalProps) {
  const [message, setMessage] = useState("")
  const [name, setName] = useState(buyerName)
  const [email, setEmail] = useState(buyerEmail)
  const [copied, setCopied] = useState(false)

  const handleSendEmail = () => {
    const subject = `Interested in: ${listing.title}`
    const body = `Hi ${listing.producerName},

${message || `I'm interested in your ${listing.title}. Is it still available?`}

Best regards,
${name || "A potential buyer"}

---
Listing Details:
- Item: ${listing.title}
- Price: ${listing.price === 0 ? "Free" : `$${listing.price}`}
- Quantity: ${listing.quantity}
- Location: ${listing.location || "Not specified"}
`

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink, "_blank")
    toast.success("Opening email client...")
    onClose()
  }

  const handleCopyDetails = async () => {
    const details = `${listing.title}
Price: ${listing.price === 0 ? "Free" : `$${listing.price}`}
Seller: ${listing.producerName}
Location: ${listing.location || "Not specified"}
Description: ${listing.description}`

    try {
      await navigator.clipboard.writeText(details)
      setCopied(true)
      toast.success("Listing details copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy details")
    }
  }

  const handleWhatsApp = () => {
    const text = `Hi! I'm interested in your ${listing.title} listed for ${listing.price === 0 ? "free" : `$${listing.price}`}. Is it still available?`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, "_blank")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Seller</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Seller Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={listing.producerPhotoURL || ""} />
              <AvatarFallback>{listing.producerName?.charAt(0) || "S"}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{listing.producerName || "Seller"}</h4>
              <p className="text-sm text-gray-600">{listing.title}</p>
              <p className="text-sm font-medium text-orange-600">
                {listing.price === 0 ? "Free" : `$${listing.price}`}
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
            </div>

            <div>
              <Label htmlFor="email">Your Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message..."
                rows={3}
              />
            </div>
          </div>

          {/* Contact Options */}
          <div className="space-y-2">
            <Button onClick={handleSendEmail} className="w-full bg-orange-600 hover:bg-orange-700">
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleWhatsApp} className="w-full bg-transparent">
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>

              <Button variant="outline" onClick={handleCopyDetails} className="w-full bg-transparent">
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Details
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Pickup Details */}
          {listing.pickupDetails && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-1">Pickup Information</h5>
              <p className="text-sm text-blue-800">{listing.pickupDetails}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
