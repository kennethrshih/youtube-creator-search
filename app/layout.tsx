import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'YouTube Creator Search',
  description: 'Find YouTube creators for your brand partnerships',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}

