'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/use-auth'
import { 
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Globe,
  Home,
  Zap,
  Building2,
  Briefcase,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Share2
} from 'lucide-react'
import { formatCurrency, formatRelativeTime, capitalize } from '@/lib/utils'

interface Job {
  id: string
  title: string
  description: string
  requirements: string[]
  responsibilities: string[]
  benefits?: string[]
  location: string
  remote_type: 'onsite' | 'remote' | 'hybrid'
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship'
  experience_level: 'entry' | 'mid' | 'senior' | 'executive'
  salary_min?: number
  salary_max?: number
  salary_currency: string
  views_count: number
  application_deadline?: string
  created_at: string
  companies: {
    id: string
    name: string
    logo_url?: string
    description?: string
    industry?: string
    website?: string
    verified: boolean
    location?: string
  }
}

interface Application {
  id: string
  status: 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted'
  created_at: string
}

const JOB_TYPE_ICONS = {
  full_time: Clock,
  part_time: Clock,
  contract: Briefcase,
  internship: Globe,
}

const REMOTE_TYPE_ICONS = {
  onsite: Building2,
  remote: Home,
  hybrid: Zap,
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile, isAuthenticated } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchJob()
      if (user) {
        checkExistingApplication()
      }
    }
  }, [params.id, user])

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            description,
            industry,
            website,
            verified,
            location
          )
        `)
        .eq('id', params.id)
        .eq('status', 'active')
        .single()

      if (error) {
        console.error('Error fetching job:', error)
        setError('Job not found')
      } else {
        setJob(data)
        // Increment view count
        await supabase
          .from('jobs')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', params.id)
      }
    } catch (error) {
      console.error('Error fetching job:', error)
      setError('Failed to load job')
    } finally {
      setLoading(false)
    }
  }

  const checkExistingApplication = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('id, status, created_at')
        .eq('job_id', params.id)
        .eq('applicant_id', user?.id)
        .single()

      if (data) {
        setApplication(data)
      }
    } catch (error) {
      // No existing application found
    }
  }

  const handleApply = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/jobs/${params.id}`)
      return
    }

    if (profile?.role !== 'job_seeker') {
      alert('Only job seekers can apply for jobs.')
      return
    }

    setApplying(true)

    try {
      const { data, error } = await supabase
        .from('applications')
        .insert([{
          job_id: params.id,
          applicant_id: user?.id,
          status: 'pending'
        }])
        .select('id, status, created_at')
        .single()

      if (error) {
        throw error
      }

      setApplication(data)
      alert('Application submitted successfully!')
    } catch (error) {
      console.error('Error applying for job:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  const getJobTypeLabel = (type: string) => {
    const labels = {
      full_time: 'Full-time',
      part_time: 'Part-time',
      contract: 'Contract',
      internship: 'Internship',
    }
    return labels[type as keyof typeof labels] || type
  }

  const getRemoteTypeLabel = (type: string) => {
    const labels = {
      onsite: 'On-site',
      remote: 'Remote',
      hybrid: 'Hybrid',
    }
    return labels[type as keyof typeof labels] || type
  }

  const getExperienceLevelLabel = (level: string) => {
    const labels = {
      entry: 'Entry Level',
      mid: 'Mid Level',
      senior: 'Senior Level',
      executive: 'Executive',
    }
    return labels[level as keyof typeof labels] || level
  }

  const getApplicationStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewing: 'bg-blue-100 text-blue-800',
      interview: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800',
      accepted: 'bg-green-100 text-green-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getApplicationStatusLabel = (status: string) => {
    const labels = {
      pending: 'Application Pending',
      reviewing: 'Under Review',
      interview: 'Interview Stage',
      rejected: 'Not Selected',
      accepted: 'Accepted',
    }
    return labels[status as keyof typeof labels] || status
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Job Not Found</h2>
          <p className="mt-2 text-gray-600">The job you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link
            href="/jobs"
            className="mt-4 inline-flex items-center text-primary hover:text-primary-hover"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Link>
        </div>
      </div>
    )
  }

  const JobTypeIcon = JOB_TYPE_ICONS[job.job_type]
  const RemoteTypeIcon = REMOTE_TYPE_ICONS[job.remote_type]
  const isApplicationDeadlinePassed = job.application_deadline && new Date(job.application_deadline) < new Date()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <Link
              href="/jobs"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Link>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  {job.companies.logo_url ? (
                    <img
                      src={job.companies.logo_url}
                      alt={`${job.companies.name} logo`}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                    <div className="flex items-center space-x-2 text-lg text-gray-600 mt-1">
                      <span className="font-medium">{job.companies.name}</span>
                      {job.companies.verified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      )}
                      {job.companies.industry && (
                        <>
                          <span>•</span>
                          <span>{job.companies.industry}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Job Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <RemoteTypeIcon className="w-4 h-4 mr-1" />
                    {getRemoteTypeLabel(job.remote_type)}
                  </div>
                  <div className="flex items-center">
                    <JobTypeIcon className="w-4 h-4 mr-1" />
                    {getJobTypeLabel(job.job_type)}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-1" />
                    {getExperienceLevelLabel(job.experience_level)}
                  </div>
                  {(job.salary_min || job.salary_max) && (
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {job.salary_min && job.salary_max
                        ? `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
                        : job.salary_min
                        ? `From ${formatCurrency(job.salary_min)}`
                        : `Up to ${formatCurrency(job.salary_max!)}`
                      }
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                  <span>Posted {formatRelativeTime(job.created_at)}</span>
                  <span>•</span>
                  <span>{job.views_count || 0} views</span>
                  {job.application_deadline && (
                    <>
                      <span>•</span>
                      <span className={`flex items-center ${isApplicationDeadlinePassed ? 'text-red-500' : ''}`}>
                        <Calendar className="w-4 h-4 mr-1" />
                        Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={() => navigator.share ? navigator.share({ 
                  title: job.title, 
                  url: window.location.href 
                }) : navigator.clipboard.writeText(window.location.href)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <ul className="list-disc list-inside space-y-2">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="text-gray-700">{requirement}</li>
                ))}
              </ul>
            </div>

            {/* Responsibilities */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2">
                {job.responsibilities.map((responsibility, index) => (
                  <li key={index} className="text-gray-700">{responsibility}</li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
                <ul className="list-disc list-inside space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="text-gray-700">{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Company Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About {job.companies.name}</h2>
              {job.companies.description ? (
                <p className="text-gray-700 mb-4">{job.companies.description}</p>
              ) : (
                <p className="text-gray-500 mb-4">No company description available.</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {job.companies.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.companies.location}
                  </div>
                )}
                {job.companies.industry && (
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-1" />
                    {job.companies.industry}
                  </div>
                )}
                {job.companies.website && (
                  <a
                    href={job.companies.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-primary hover:text-primary-hover"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Status/Button */}
            <div className="bg-white rounded-lg shadow p-6">
              {application ? (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-900">Application Submitted</span>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getApplicationStatusColor(application.status)}`}>
                    {getApplicationStatusLabel(application.status)}
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Applied on {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>
              ) : isApplicationDeadlinePassed ? (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-red-900">Application Closed</span>
                  </div>
                  <p className="text-sm text-red-600">
                    The application deadline has passed.
                  </p>
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {applying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                        Applying...
                      </>
                    ) : (
                      'Apply for this job'
                    )}
                  </button>
                  {!isAuthenticated && (
                    <p className="text-sm text-gray-600 mt-3 text-center">
                      <Link href="/login" className="text-primary hover:text-primary-hover">
                        Sign in
                      </Link>{' '}
                      to apply for this job
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Job Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Job Type</span>
                  <span className="font-medium">{getJobTypeLabel(job.job_type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Work Type</span>
                  <span className="font-medium">{getRemoteTypeLabel(job.remote_type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-medium">{getExperienceLevelLabel(job.experience_level)}</span>
                </div>
                {(job.salary_min || job.salary_max) && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Salary</span>
                    <span className="font-medium">
                      {job.salary_min && job.salary_max
                        ? `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
                        : job.salary_min
                        ? `From ${formatCurrency(job.salary_min)}`
                        : `Up to ${formatCurrency(job.salary_max!)}`
                      }
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium">{job.location}</span>
                </div>
              </div>
            </div>

            {/* Similar Jobs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Jobs</h3>
              <p className="text-sm text-gray-600">
                More job recommendations coming soon!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}