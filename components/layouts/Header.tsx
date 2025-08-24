'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'

export function Header() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string
  
  // Temporarily disable auth to avoid issues
  const isAuthenticated = false
  const profile = null

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">HK</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Job Pro</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href={`/${locale}/jobs`} className="text-gray-600 hover:text-primary transition-colors">
              {t('navigation.findJobs')}
            </Link>
            <Link href={`/${locale}/companies`} className="text-gray-600 hover:text-primary transition-colors">
              {t('navigation.companies')}
            </Link>
            <Link href={`/${locale}/about`} className="text-gray-600 hover:text-primary transition-colors">
              {t('navigation.about')}
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Link href={`/${locale}/login`} className="text-gray-600 hover:text-primary transition-colors">
              {t('navigation.login')}
            </Link>
            <Link 
              href={`/${locale}/register`} 
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
            >
              {t('navigation.getStarted')}
            </Link>
          </div>
        </div>
      </header>
      
      {/* Breadcrumbs */}
      <Breadcrumbs />
    </>
  )
}