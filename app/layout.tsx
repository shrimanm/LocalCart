import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "./providers"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LocalCart",
  description: "Your one-stop destination for fashion and lifestyle",
  generator: 'v0.dev',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}

        </AuthProvider>
      </body>
    </html>
  )
}
