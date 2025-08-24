import type { Metadata } from 'next'
import { Inter, Noto_Sans_TC } from 'next/font/google'
import '@/styles/globals.css'
import { locales } from '@/i18n'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  variable: '--font-noto-sans-tc',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'HK Job Pro',
    template: '%s | HK Job Pro'
  },
  description: 'Modern job recruitment platform connecting job seekers with employers in Hong Kong',
  keywords: ['jobs', 'hong kong', 'recruitment', 'careers', 'employment'],
  authors: [{ name: 'HK Job Pro Team' }],
  creator: 'HK Job Pro',
  metadataBase: new URL('https://hkjobpro.com'),
  openGraph: {
    type: 'website',
    locale: 'zh_HK',
    url: 'https://hkjobpro.com',
    title: 'HK Job Pro - Modern Job Recruitment Platform',
    description: 'Find your dream job or hire the perfect candidate in Hong Kong',
    siteName: 'HK Job Pro',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HK Job Pro',
    description: 'Modern job recruitment platform for Hong Kong',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-HK" className={`${inter.variable} ${notoSansTC.variable}`}>
      <body className={`${inter.className} ${notoSansTC.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}