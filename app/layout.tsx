import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { LoadingProvider } from "@/contexts/LoadingContext"
import { GlobalLoader } from "@/components/GlobalLoader"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FoodShare - Homemade Food Marketplace",
  description: "Discover and share delicious homemade food in your neighborhood",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    generator: 'v0.app'
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
        <LoadingProvider>
          {children}
          <GlobalLoader />
        </LoadingProvider>
      </body>
    </html>
  )
}
