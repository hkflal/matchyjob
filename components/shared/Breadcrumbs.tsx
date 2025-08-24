'use client'

import { usePathname, useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Home } from 'lucide-react'

export function Breadcrumbs() {
  const pathname = usePathname()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations()

  // Split pathname and remove empty strings
  const pathSegments = pathname.split('/').filter(Boolean)
  
  // Remove locale from segments
  const segments = pathSegments.slice(1)

  // Don't show breadcrumbs on home page
  if (segments.length === 0) {
    return null
  }

  // Create breadcrumb items
  const breadcrumbItems = []

  // Add home
  breadcrumbItems.push({
    label: t('navigation.home'),
    href: `/${locale}`,
    isLast: false
  })

  // Add each segment
  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1
    const href = `/${locale}/${segments.slice(0, index + 1).join('/')}`
    
    let label = segment
    
    // Map segments to readable labels using translations
    switch (segment) {
      case 'jobs':
        label = t('navigation.findJobs')
        break
      case 'companies':
        label = t('navigation.companies')
        break
      case 'about':
        label = t('navigation.about')
        break
      case 'dashboard':
        label = t('navigation.dashboard')
        break
      case 'profile':
        label = t('navigation.profile')
        break
      case 'settings':
        label = t('navigation.settings')
        break
      case 'applications':
        label = t('navigation.applications')
        break
      case 'login':
        label = t('navigation.login')
        break
      case 'register':
        label = t('navigation.register')
        break
      case 'new':
        label = t('common.new')
        break
      default:
        // For dynamic segments like [id], show a placeholder
        if (segment.match(/^\d+$/)) {
          label = t('common.details')
        } else {
          // Capitalize first letter for unknown segments
          label = segment.charAt(0).toUpperCase() + segment.slice(1)
        }
    }

    breadcrumbItems.push({
      label,
      href,
      isLast
    })
  })

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="container py-3">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <div key={index} className="flex items-center">
                <BreadcrumbItem>
                  {item.isLast ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href} className="flex items-center space-x-1">
                        {index === 0 && <Home className="w-4 h-4" />}
                        <span>{item.label}</span>
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!item.isLast && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  )
}