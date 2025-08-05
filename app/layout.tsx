import type React from "react"
import type { Metadata } from "next"
import { Inter, DM_Sans, Playfair_Display } from "next/font/google"
import "./globals.css"

// Primary font for most text
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

// Secondary font for subheadings and accents
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

// Tertiary font for special headings
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

// Update the metadata object with correct information for NeuStream
export const metadata: Metadata = {
  title: "NeuStream | Cloud-Powered Multi-Platform Streaming",
  description:
    "Stream to multiple platforms simultaneously without hardware limitations using NeuStream's cloud-powered computational offloading technology.",
  keywords: "streaming, multi-platform streaming, cloud streaming, RTMP, Twitch, YouTube, Facebook",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${dmSans.variable} ${playfair.variable} font-sans`}>{children}</body>
    </html>
  )
}

