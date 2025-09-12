"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, AlertTriangle, ExternalLink } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function FirebaseTest() {
  const [status, setStatus] = useState<"testing" | "success" | "error" | "auth-required" | "index-required">("testing")
  const [message, setMessage] = useState("")
  const { user } = useAuth()

  const testFirebaseConnection = async () => {
    setStatus("testing")
    setMessage("Testing Firebase connection...")

    try {
      // First test: Check if Firebase is initialized
      if (!db) {
        throw new Error("Firebase not initialized")
      }

      // Second test: Try to read from listings collection
      const listingsRef = collection(db, "listings")
      const snapshot = await getDocs(listingsRef)

      setStatus("success")
      setMessage(`✅ Firebase connected successfully! Found ${snapshot.size} listings in database.`)
    } catch (error: any) {
      console.error("Firebase test error:", error)

      if (error.code === "permission-denied") {
        setStatus("auth-required")
        setMessage(
          "🔒 Database access requires authentication or updated security rules. This is normal for a secure setup.",
        )
      } else if (error.code === "failed-precondition" || error.message.includes("index")) {
        setStatus("index-required")
        setMessage("📊 Firestore requires composite indexes for category filtering. Using fallback for now.")
      } else {
        setStatus("error")
        setMessage(`❌ Firebase connection failed: ${error.message}`)
      }
    }
  }

  const createTestListing = async () => {
    if (!user) {
      setMessage("❌ Please sign in first to test creating listings")
      return
    }

    setStatus("testing")
    setMessage("Testing listing creation...")

    try {
      const testListing = {
        title: "Test Food Item",
        description: "This is a test listing created by the Firebase test",
        price: 10,
        quantity: 1,
        category: "meal",
        imageUrls: [],
        producerId: user.uid,
        producerName: user.displayName || "Test User",
        producerPhotoURL: user.photoURL || "",
        location: "Test Location",
        pickupDetails: "Test pickup details",
        status: "available",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      const docRef = await addDoc(collection(db, "listings"), testListing)
      setStatus("success")
      setMessage(`✅ Test listing created successfully! Document ID: ${docRef.id}`)
    } catch (error: any) {
      setStatus("error")
      setMessage(`❌ Failed to create test listing: ${error.message}`)
      console.error("Test listing creation error:", error)
    }
  }

  useEffect(() => {
    testFirebaseConnection()
  }, [])

  return (
    <Card className="max-w-2xl mx-auto mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === "testing" && <Loader2 className="h-5 w-5 animate-spin" />}
          {status === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
          {status === "error" && <XCircle className="h-5 w-5 text-red-600" />}
          {(status === "auth-required" || status === "index-required") && (
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          )}
          Firebase Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{message}</p>

        <div className="flex gap-2">
          <Button onClick={testFirebaseConnection} variant="outline" size="sm">
            Test Connection
          </Button>

          {user && (
            <Button onClick={createTestListing} variant="outline" size="sm">
              Test Create Listing
            </Button>
          )}
        </div>

        {status === "auth-required" && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Firestore Security Rules Needed</h4>
            <p className="text-sm text-yellow-700 mb-3">
              Your Firestore database requires proper security rules. Please add these rules in your Firebase Console:
            </p>
            <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
              {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all listings
    match /listings/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.producerId;
      allow create: if request.auth != null;
    }
    
    // Allow users to manage their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}`}
            </pre>
            <p className="text-xs text-yellow-600 mt-2">
              Go to Firebase Console → Firestore Database → Rules tab → Paste the above rules → Publish
            </p>
          </div>
        )}

        {status === "index-required" && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Firestore Indexes Required</h4>
            <p className="text-sm text-blue-700 mb-3">
              For optimal performance with category filtering, create these composite indexes:
            </p>

            <div className="space-y-3">
              <div className="bg-white p-3 rounded border">
                <p className="text-sm font-medium mb-2">Collection: listings</p>
                <div className="text-xs space-y-1">
                  <div>• category (Ascending)</div>
                  <div>• createdAt (Descending)</div>
                  <div>• __name__ (Ascending)</div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    "https://console.firebase.google.com/v1/r/project/plateshare-dev/firestore/indexes?create_composite=Ck9wcm9qZWN0cy9wbGF0ZXNoYXJlLWRldi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbGlzdGluZ3MvaW5kZXhlcy9fEAEaDAoIY2F0ZWdvcnkQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC",
                    "_blank",
                  )
                }
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Create Index in Firebase Console
              </Button>
            </div>

            <p className="text-xs text-blue-600 mt-3">
              The app works with mock data for now. Creating indexes will enable real-time Firestore data with category
              filtering.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
