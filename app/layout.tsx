import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { LoadingProvider } from "@/contexts/LoadingContext"
import { GlobalLoader } from "@/components/GlobalLoader"
import { ErrorBoundary } from "@/components/ErrorBoundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FoodShare - Homemade Food Marketplace",
  description: "Discover and share delicious homemade food in your neighborhood",
  generator: 'v0.app'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <LoadingProvider>
            {children}
            <GlobalLoader />
          </LoadingProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
