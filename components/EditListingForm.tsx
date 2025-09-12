"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, Loader2, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { getListing, updateListing, type FoodListing } from "@/services/firestore"
import { uploadMultipleImages } from "@/services/storage"
import { toast } from "sonner"
import { Navbar } from "@/components/Navbar"

interface EditListingFormProps {
  listingId: string
}

export function EditListingForm({ listingId }: EditListingFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchingListing, setFetchingListing] = useState(true)
  const [listing, setListing] = useState<FoodListing | null>(null)
  const [newImages, setNewImages] = useState<File[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "1",
    category: "",
    location: "",
    pickupDetails: "",
    status: "available" as const,
  })

  const categories = [
    { value: "meal", label: "Meal" },
    { value: "dessert", label: "Dessert" },
    { value: "snack", label: "Snack" },
    { value: "beverage", label: "Beverage" },
    { value: "baked goods", label: "Baked Goods" },
    { value: "healthy", label: "Healthy" },
    { value: "vegan", label: "Vegan" },
    { value: "gluten-free", label: "Gluten-Free" },
  ]

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await getListing(listingId)
        if (!data) {
          toast.error("Listing not found")
          router.push("/")
          return
        }

        if (user && data.producerId !== user.uid) {
          toast.error("You can only edit your own listings")
          router.push("/")
          return
        }

        setListing(data)
        setFormData({
          title: data.title,
          description: data.description,
          price: data.price.toString(),
          quantity: data.quantity.toString(),
          category: data.category,
          location: data.location || "",
          pickupDetails: data.pickupDetails,
          status: data.status,
        })
      } catch (error) {
        console.error("Error fetching listing:", error)
        toast.error("Failed to load listing")
        router.push("/")
      } finally {
        setFetchingListing(false)
      }
    }

    if (listingId) {
      fetchListing()
    }
  }, [listingId, user, router])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalImages = (listing?.imageUrls?.length || 0) + newImages.length + files.length

    if (totalImages > 5) {
      toast.error("Maximum 5 images allowed")
      return
    }
    setNewImages((prev) => [...prev, ...files])
  }

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    if (!listing) return

    const updatedImageUrls = listing.imageUrls.filter((_, i) => i !== index)
    setListing({ ...listing, imageUrls: updatedImageUrls })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !listing) {
      toast.error("Please sign in to edit listing")
      return
    }

    if (!formData.title || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      // Upload new images
      let newImageUrls: string[] = []
      if (newImages.length > 0) {
        newImageUrls = await uploadMultipleImages(newImages, `listings/${user.uid}`)
      }

      // Combine existing and new image URLs
      const allImageUrls = [...(listing.imageUrls || []), ...newImageUrls]

      // Update listing
      await updateListing(listingId, {
        title: formData.title,
        description: formData.description,
        price: Number.parseFloat(formData.price) || 0,
        quantity: Number.parseInt(formData.quantity) || 1,
        category: formData.category,
        location: formData.location || null,
        pickupDetails: formData.pickupDetails,
        imageUrls: allImageUrls,
        status: formData.status,
      })

      toast.success("Listing updated successfully!")
      router.push(`/food/${listingId}`)
    } catch (error) {
      console.error("Error updating listing:", error)
      toast.error("Failed to update listing")
    } finally {
      setLoading(false)
    }
  }

  if (fetchingListing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center p-8">
          <p className="text-gray-500">Listing not found</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Go Back Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Edit Food Listing</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Existing Images */}
              {listing.imageUrls && listing.imageUrls.length > 0 && (
                <div>
                  <Label>Current Photos</Label>
                  <div className="mt-2 flex flex-wrap gap-4">
                    {listing.imageUrls.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl || "/placeholder.svg"}
                          alt={`Current ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeExistingImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              <div>
                <Label>Add New Photos (up to 5 total)</Label>
                <div className="mt-2">
                  <div className="flex flex-wrap gap-4">
                    {newImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image) || "/placeholder.svg"}
                          alt={`New ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeNewImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {(listing.imageUrls?.length || 0) + newImages.length < 5 && (
                      <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-orange-500">
                        <Upload className="h-6 w-6 text-gray-400" />
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Homemade Chocolate Chip Cookies"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your food item, ingredients, etc."
                  rows={4}
                  required
                />
              </div>

              {/* Price and Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "available" | "sold" | "pending") =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Downtown, Near Central Park"
                />
              </div>

              {/* Pickup Details */}
              <div>
                <Label htmlFor="pickupDetails">Pickup Details</Label>
                <Textarea
                  id="pickupDetails"
                  value={formData.pickupDetails}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pickupDetails: e.target.value }))}
                  placeholder="Instructions for pickup, availability, etc."
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Listing"
                  )}
                </Button>

                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
