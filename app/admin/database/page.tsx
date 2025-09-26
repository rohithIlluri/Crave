"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Database, Settings, AlertCircle } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function DatabaseToolsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Database Management</h1>
        <p className="text-gray-600">Tools for managing your Firebase database</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Connection Status</span>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
              <div className="flex justify-between">
                <span>Last Sync</span>
                <span className="text-gray-600">Just now</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Database Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Test Connection
              </Button>
              <Button variant="outline" className="w-full">
                View Collections
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Development Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Advanced database management tools will be available in the development environment.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              Seed Database
            </Button>
            <Button variant="outline" disabled>
              Clear Test Data
            </Button>
            <Button variant="outline" disabled>
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
