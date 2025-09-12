"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function DebugInfo() {
  const envVars = {
    "API Key": process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅ Set" : "❌ Missing",
    "Auth Domain": process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✅ Set" : "❌ Missing",
    "Project ID": process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✅ Set" : "❌ Missing",
    "Storage Bucket": process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "✅ Set" : "❌ Missing",
    "Messaging Sender ID": process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "✅ Set" : "❌ Missing",
    "App ID": process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "✅ Set" : "❌ Missing",
  }

  return (
    <Card className="max-w-md mx-auto mb-6">
      <CardHeader>
        <CardTitle>Environment Variables</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(envVars).map(([key, status]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-sm">{key}:</span>
              <Badge variant={status.includes("✅") ? "default" : "destructive"}>{status}</Badge>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "Not set"}
        </div>
      </CardContent>
    </Card>
  )
}
