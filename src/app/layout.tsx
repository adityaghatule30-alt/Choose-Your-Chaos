import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Choose Your Chaos — The Social Party & Dilemma Game',
  description:
    'Test your instincts with unhinged Either / Or questions, hilarious Truth or Dares, merciless Judge Me trials, and live multiplayer rooms with friends.',
  keywords: ['party game', 'either or', 'truth or dare', 'multiplayer party game', 'judge me', 'online game'],
  openGraph: {
    title: 'Choose Your Chaos — The Social Party & Dilemma Game',
    description: 'Unhinged dilemmas, daring truths, and merciless trials with your friends.',
    type: 'website',
    url: 'https://chooseyourchaos.com',
    siteName: 'Choose Your Chaos',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Choose Your Chaos',
    description: 'Unhinged dilemmas, daring truths, and merciless trials.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const publisherId =
    process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ||
    process.env.NEXT_PUBLIC_ADSENSE_PUB_ID

  const adsEnabled =
    process.env.NEXT_PUBLIC_ADS_ENABLED === 'true' &&
    Boolean(publisherId && publisherId.startsWith('ca-pub-'))

  return (
    <html lang="en" className="dark">
      <head>
        {adsEnabled && publisherId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className={`${inter.className} bg-neutral-950 text-neutral-100 min-h-screen flex flex-col antialiased selection:bg-yellow-400 selection:text-neutral-950`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
