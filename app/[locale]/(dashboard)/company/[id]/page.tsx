'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { 
  Building2,
  ArrowLeft,
  MapPin,
  Globe,
  Users,
  Calendar,
  Edit,
  Briefcase,
  Eye,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface Company {
  id: string
  name: string
  description: string
  industry: string
  website?: string
  location: string
  size: string
  founded_year?: number
  logo_url?: string
  verified: boolean
  created_at: string
  owner_id: string
}

interface CompanyStats {
  total_jobs: number
  active_jobs: number
  total_applications: number
  total_views: number
}

export default function CompanyProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id && user) {
      fetchCompany()
      fetchCompanyStats()
    }
  }, [params.id, user])

  const fetchCompany = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Error fetching company:', error)
        setError('Company not found')
      } else {
        // Check if user owns this company
        if (data.owner_id !== user?.id) {
          setError('Access denied')
          return
        }
        setCompany(data)
      }
    } catch (error) {
      console.error('Error fetching company:', error)
      setError('Failed to load company')
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanyStats = async () => {
    try {
      // Fetch job statistics
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id, status, views_count')
        .eq('company_id', params.id)

      if (jobsError) {
        console.error('Error fetching jobs stats:', jobsError)
        return
      }

      // Fetch application statistics
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('id, job_id')
        .in('job_id', jobsData?.map(job => job.id) || [])

      if (applicationsError) {
        console.error('Error fetching applications stats:', applicationsError)
      }

      const totalJobs = jobsData?.length || 0
      const activeJobs = jobsData?.filter(job => job.status === 'active').length || 0
      const totalViews = jobsData?.reduce((sum, job) => sum + (job.views_count || 0), 0) || 0
      const totalApplications = applicationsData?.length || 0

      setStats({
        total_jobs: totalJobs,
        active_jobs: activeJobs,
        total_applications: totalApplications,
        total_views: totalViews
      })
    } catch (error) {
      console.error('Error fetching company stats:', error)
    }
  }

  // Check if user is employer
  if (profile?.role !== 'employer') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need to be an employer to view company profiles.</p>
          <Link href="/dashboard" className="text-primary hover:text-primary-hover">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
          <p className="mt-4 text-gray-600">Loading company profile...</p>
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {error === 'Access denied' ? 'Access Denied' : 'Company Not Found'}
          </h2>
          <p className="mt-2 text-gray-600">
            {error === 'Access denied' 
              ? "You don't have permission to view this company profile."
              : 'The company profile you\'re looking for doesn\'t exist.'
            }
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center text-primary hover:text-primary-hover"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const getCompanySizeLabel = (size: string) => {
    const sizeMap: { [key: string]: string } = {
      '1-10': '1-10 employees',
      '11-50': '11-50 employees',
      '51-200': '51-200 employees',
      '201-500': '201-500 employees',
      '501-1000': '501-1000 employees',
      '1000+': '1000+ employees'
    }
    return sizeMap[size] || size
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={`${company.name} logo`}
                  className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-gray-400" />
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                  {company.verified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Pending Verification
                    </span>
                  )}
                </div>
                <p className="text-lg text-gray-600 mt-1">{company.industry}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {company.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {getCompanySizeLabel(company.size)}
                  </div>
                  {company.founded_year && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Founded {company.founded_year}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Link
                href={`/company/${company.id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About {company.name}</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {company.description}
              </p>
            </div>

            {/* Company Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Industry</label>
                  <p className="text-gray-900">{company.industry}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Company Size</label>
                  <p className="text-gray-900">{getCompanySizeLabel(company.size)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                  <p className="text-gray-900">{company.location}</p>
                </div>
                {company.founded_year && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Founded</label>
                    <p className="text-gray-900">{company.founded_year}</p>
                  </div>
                )}
                {company.website && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Website</label>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover flex items-center"
                    >
                      {company.website}
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Created</label>
                  <p className="text-gray-900">{new Date(company.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Jobs */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Jobs</h2>
                <Link
                  href="/jobs/new"
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Post New Job
                </Link>
              </div>
              {stats && stats.total_jobs === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs posted yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by posting your first job.</p>
                  <Link
                    href="/jobs/new"
                    className="mt-6 inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Post Your First Job
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    Job management features coming soon! You can{' '}
                    <Link href="/jobs/new" className="text-primary hover:text-primary-hover">
                      post new jobs
                    </Link>{' '}
                    in the meantime.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Stats</h3>
              {stats ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Jobs Posted</span>
                    <span className="text-lg font-semibold text-gray-900">{stats.total_jobs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Jobs</span>
                    <span className="text-lg font-semibold text-green-600">{stats.active_jobs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Applications</span>
                    <span className="text-lg font-semibold text-blue-600">{stats.total_applications}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Job Views</span>
                    <span className="text-lg font-semibold text-purple-600">{stats.total_views}</span>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/jobs/new"
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Post New Job
                </Link>
                <Link
                  href={`/company/${company.id}/edit`}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Link>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>

            {/* Verification Status */}
            <div className={`rounded-lg shadow p-6 ${company.verified ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex items-start">
                {company.verified ? (
                  <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-400 mt-0.5" />
                ) : (
                  <AlertCircle className="flex-shrink-0 w-5 h-5 text-yellow-400 mt-0.5" />
                )}
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${company.verified ? 'text-green-800' : 'text-yellow-800'}`}>
                    {company.verified ? 'Verified Company' : 'Verification Pending'}
                  </h3>
                  <p className={`mt-1 text-sm ${company.verified ? 'text-green-700' : 'text-yellow-700'}`}>
                    {company.verified 
                      ? 'Your company has been verified. This badge helps build trust with job seekers.'
                      : 'Your company profile is under review. Verification typically takes 1-3 business days.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}