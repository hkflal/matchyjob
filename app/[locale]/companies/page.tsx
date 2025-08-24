'use client'

import { Search, Building2, Users, MapPin, Globe } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const t = useTranslations()
  const params = useParams()
  const locale = params.locale as string

  // Mock companies data - in real app this would come from database
  const companies = [
    {
      id: 1,
      name: 'TechCorp Hong Kong',
      description: 'Leading technology company specializing in fintech solutions',
      logo: '/images/companies/techcorp.png',
      industry: 'Technology',
      size: '500-1000',
      location: 'Central, Hong Kong',
      website: 'https://techcorp.hk',
      openJobs: 12,
      verified: true
    },
    {
      id: 2,
      name: 'Global Finance Ltd',
      description: 'International financial services and investment banking',
      logo: '/images/companies/globalfinance.png',
      industry: 'Finance',
      size: '1000+',
      location: 'Admiralty, Hong Kong',
      website: 'https://globalfinance.com',
      openJobs: 8,
      verified: true
    },
    {
      id: 3,
      name: 'Creative Agency HK',
      description: 'Digital marketing and creative solutions agency',
      logo: '/images/companies/creative.png',
      industry: 'Marketing',
      size: '50-100',
      location: 'Sheung Wan, Hong Kong',
      website: 'https://creative-hk.com',
      openJobs: 5,
      verified: false
    },
    {
      id: 4,
      name: 'Healthcare Innovations',
      description: 'Medical technology and healthcare solutions provider',
      logo: '/images/companies/healthcare.png',
      industry: 'Healthcare',
      size: '200-500',
      location: 'Tsim Sha Tsui, Hong Kong',
      website: 'https://healthtech.hk',
      openJobs: 15,
      verified: true
    }
  ]

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t('companies.heroTitle')}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('companies.heroSubtitle')}
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <div className="flex items-center bg-white rounded-xl shadow-lg p-2 border">
                  <div className="flex items-center flex-1 px-4">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <input
                      type="text"
                      placeholder={t('companies.searchPlaceholder')}
                      className="w-full outline-none text-gray-700"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-hover transition-colors font-medium">
                    {t('companies.searchButton')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">800+</div>
              <div className="text-gray-600">Active Companies</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">50K+</div>
              <div className="text-gray-600">Employees</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">25+</div>
              <div className="text-gray-600">Industries</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">18</div>
              <div className="text-gray-600">Districts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Companies List */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('companies.featuredCompanies')}
            </h2>
            <p className="text-gray-600">
              {filteredCompanies.length} {t('companies.companiesFound')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCompanies.map((company) => (
              <div key={company.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
                        {company.verified && (
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{company.industry}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>{company.size} {t('companies.employees')}</span>
                        <span>•</span>
                        <span>{company.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {company.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium text-primary">{company.openJobs}</span>
                      <span className="text-gray-500"> {t('companies.openPositions')}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/${locale}/companies/${company.id}`}
                        className="text-primary hover:text-primary-hover transition-colors font-medium text-sm"
                      >
                        {t('companies.viewProfile')}
                      </Link>
                      <span className="text-gray-300">•</span>
                      <Link 
                        href={`/${locale}/jobs?company=${company.id}`}
                        className="text-gray-600 hover:text-primary transition-colors text-sm"
                      >
                        {t('companies.viewJobs')}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">{t('companies.noCompaniesFound')}</h3>
              <p className="text-gray-600">{t('companies.adjustSearch')}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('companies.ctaTitle')}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t('companies.ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href={`/${locale}/register?type=employer`}
                className="bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {t('companies.postJobs')}
              </Link>
              <Link 
                href={`/${locale}/about`}
                className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-primary transition-colors font-medium"
              >
                {t('companies.learnMore')}
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