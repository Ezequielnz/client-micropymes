import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { RecaptchaProvider } from "@/components/recaptcha-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "OperixML - Primer ERP con IA para PyMEs",
  description:
    "La nueva forma de gestionar tu PyME con inteligencia artificial. Un ERP modular, simple y automatizado.",
  generator: "v0.app",
  icons: {
    icon: "/logo 1.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <RecaptchaProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <Analytics />
        </RecaptchaProvider>
      </body>
    </html>
  )
}
