import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"

function resolveMetadataBase(): URL {
  const fallback = "http://localhost:3000"
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (!fromEnv) return new URL(fallback)

  try {
    return new URL(fromEnv)
  } catch {
    return new URL(fallback)
  }
}

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
})

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair"
})

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: "Tales for the Tillerman | Press Kit",
  description: "Berlin-based band blending world music, funk, and soul. Press kit, booking info, and media resources.",
  keywords: ["Tales for the Tillerman", "Berlin band", "world music", "press kit", "booking"],
  authors: [{ name: "Tales for the Tillerman" }],
  openGraph: {
    title: "Tales for the Tillerman | Press Kit",
    description: "Berlin-based band blending world music, funk, and soul.",
    type: "website",
    images: ["/images/band-hero.jpg"],
  },
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased pb-24 md:pb-0">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
