import type { Metadata } from "next"
import { DM_Sans, Syne } from "next/font/google"
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
  title: "Cine Studio",
  description: "Hollywood in a Browser"
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} dark`}>
      <body>{children}</body>
    </html>
  )
}
