'use client'

import { Globe } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { locales } from '@/i18n'
import { useState } from 'react'

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const currentLocale = params.locale as string
  const [isOpen, setIsOpen] = useState(false)

  const switchLanguage = (newLocale: string) => {
    // Replace the current locale in the pathname with the new one
    const segments = pathname.split('/')
    segments[1] = newLocale // Replace the locale segment
    const newPath = segments.join('/')
    
    router.push(newPath)
    setIsOpen(false)
  }

  const getLanguageName = (locale: string) => {
    switch (locale) {
      case 'zh-HK':
        return '繁體中文'
      case 'en':
        return 'English'
      default:
        return locale
    }
  }

  const getCurrentLanguageShort = (locale: string) => {
    switch (locale) {
      case 'zh-HK':
        return '中'
      case 'en':
        return 'EN'
      default:
        return locale.toUpperCase()
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors p-2 rounded-lg hover:bg-gray-50"
        aria-label="Switch language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{getCurrentLanguageShort(currentLocale)}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-2">
              {locales.map((locale) => (
                <button
                  key={locale}
                  onClick={() => switchLanguage(locale)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    currentLocale === locale 
                      ? 'bg-blue-50 text-primary font-medium' 
                      : 'text-gray-700'
                  }`}
                >
                  {getLanguageName(locale)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}