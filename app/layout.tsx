import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { DM_Sans, Syne } from "next/font/google"
import { DUMMY_CLERK_PUBLISHABLE_KEY, isDummyClerkPublishableKey } from "@/lib/clerk-config"
import "./globals.css"

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap"
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap"
})

export const metadata: Metadata = {
  title: "FilmGen",
  description: "AI film creation studio"
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    DUMMY_CLERK_PUBLISHABLE_KEY
  const shell = (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} dark`}>
      <body>{children}</body>
    </html>
  )

  if (isDummyClerkPublishableKey(publishableKey)) {
    return shell
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {shell}
    </ClerkProvider>
  )
}
