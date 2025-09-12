"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { createListing } from "@/services/firestore"
import { uploadMultipleImages } from "@/services/storage"
import { toast } from "sonner"

export function CreateListingForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "1",
    category: "",
    location: "",
    pickupDetails: "",
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed")
      return
    }
    setImages((prev) => [...prev, ...files])
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Please sign in to create a listing")
      return
    }

    if (!formData.title || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      // Upload images
      let imageUrls: string[] = []
      if (images.length > 0) {
        imageUrls = await uploadMultipleImages(images, `listings/${user.uid}`)
      }

      // Create listing
      await createListing({
        title: formData.title,
        description: formData.description,
        price: Number.parseFloat(formData.price) || 0,
        quantity: Number.parseInt(formData.quantity) || 1,
        category: formData.category,
        location: formData.location || null,
        pickupDetails: formData.pickupDetails,
        imageUrls,
        producerId: user.uid,
        producerName: user.displayName || "",
        producerPhotoURL: user.photoURL || "",
        status: "available",
      })

      toast.success("Listing created successfully!")
      router.push("/")
    } catch (error) {
      console.error("Error creating listing:", error)
      toast.error("Failed to create listing")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p>Please sign in to create a listing</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Food Listing</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
          <div>
            <Label>Photos (up to 5)</Label>
            <div className="mt-2">
              <div className="flex flex-wrap gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image) || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {images.length < 5 && (
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

          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Listing...
              </>
            ) : (
              "Create Listing"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
