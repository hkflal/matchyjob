'use client'

import { Search, MapPin, Clock, Users, TrendingUp, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

export default function HomePage() {
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t('homepage.heroTitle')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('homepage.heroSubtitle')}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <div className="flex items-center bg-white rounded-xl shadow-lg p-2 border">
                  <div className="flex items-center flex-1 px-4">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                      type="text"
                      placeholder={t('homepage.searchPlaceholder')}
                      className="w-full outline-none text-gray-700"
                    />
                  </div>
                  <div className="flex items-center border-l px-4">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                      type="text"
                      placeholder={t('homepage.locationPlaceholder')}
                      className="w-32 outline-none text-gray-700"
                    />
                  </div>
                  <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-hover transition-colors font-medium">
                    {t('homepage.searchButton')}
                  </button>
                </div>
              </div>
            </div>

            {/* Popular Searches */}
            <div className="flex flex-wrap justify-center gap-3">
              <span className="text-sm text-gray-500">{t('homepage.popularSearches')}:</span>
              {['Software Engineer', 'Marketing Manager', 'Data Analyst', 'UX Designer'].map((term) => (
                <button 
                  key={term}
                  className="text-sm text-primary hover:text-primary-hover bg-blue-50 px-3 py-1 rounded-full transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: t('stats.activeJobs'), value: '2,500+', icon: TrendingUp },
              { label: t('stats.companies'), value: '800+', icon: Users },
              { label: t('stats.successStories'), value: '15K+', icon: CheckCircle },
              { label: t('stats.newJobsDaily'), value: '100+', icon: Clock },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
                <div className="text-gray-600">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: t('features.smartMatching.title'),
                description: t('features.smartMatching.description'),
                icon: '🎯'
              },
              {
                title: t('features.realTimeUpdates.title'),
                description: t('features.realTimeUpdates.description'),
                icon: '⚡'
              },
              {
                title: t('features.companyInsights.title'),
                description: t('features.companyInsights.description'),
                icon: '🏢'
              },
              {
                title: t('features.applicationTracking.title'),
                description: t('features.applicationTracking.description'),
                icon: '📊'
              },
              {
                title: t('features.mobileOptimized.title'),
                description: t('features.mobileOptimized.description'),
                icon: '📱'
              },
              {
                title: t('features.securePrivate.title'),
                description: t('features.securePrivate.description'),
                icon: '🔒'
              },
            ].map(({ title, description, icon }) => (
              <div key={title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('homepage.ctaTitle')}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t('homepage.ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href={`/${locale}/register`}
                className="bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {t('homepage.createAccount')}
              </Link>
              <Link 
                href={`/${locale}/jobs`}
                className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-primary transition-colors font-medium"
              >
                {t('homepage.browseJobs')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">HK</span>
              </div>
              <span className="text-xl font-bold text-white">Job Pro</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href={`/${locale}/privacy`} className="text-gray-400 hover:text-white transition-colors">
                {t('footer.privacyPolicy')}
              </Link>
              <Link href={`/${locale}/terms`} className="text-gray-400 hover:text-white transition-colors">
                {t('footer.termsOfService')}
              </Link>
              <Link href={`/${locale}/contact`} className="text-gray-400 hover:text-white transition-colors">
                {t('footer.contactUs')}
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 HK Job Pro. {t('footer.allRightsReserved')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}