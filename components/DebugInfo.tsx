"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function DebugInfo() {
  // Basic connection status without exposing sensitive data
  const isConfigured = !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  )

  return (
    <Card className="max-w-md mx-auto mb-6">
      <CardHeader>
        <CardTitle>Configuration Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Firebase Configuration:</span>
            <Badge variant={isConfigured ? "default" : "destructive"}>
              {isConfigured ? "✅ Ready" : "❌ Incomplete"}
            </Badge>
          </div>
          {!isConfigured && (
            <p className="text-xs text-gray-500 mt-2">
              Some environment variables are missing. Check your .env.local file.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
