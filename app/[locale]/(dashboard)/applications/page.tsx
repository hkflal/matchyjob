'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import { 
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Building2,
  MapPin,
  Filter,
  Search,
  AlertCircle,
  Loader2,
  Eye,
  ExternalLink
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface Application {
  id: string
  status: 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted'
  created_at: string
  updated_at: string
  cover_letter?: string
  notes?: string
  jobs: {
    id: string
    title: string
    location: string
    remote_type: 'onsite' | 'remote' | 'hybrid'
    job_type: 'full_time' | 'part_time' | 'contract' | 'internship'
    companies: {
      id: string
      name: string
      logo_url?: string
      industry?: string
      verified: boolean
    }
  }
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  reviewing: 'bg-blue-100 text-blue-800 border-blue-200',
  interview: 'bg-purple-100 text-purple-800 border-purple-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  accepted: 'bg-green-100 text-green-800 border-green-200',
}

const STATUS_ICONS = {
  pending: Clock,
  reviewing: Eye,
  interview: Calendar,
  rejected: XCircle,
  accepted: CheckCircle,
}

const STATUS_LABELS = {
  pending: 'Application Pending',
  reviewing: 'Under Review',
  interview: 'Interview Stage',
  rejected: 'Not Selected',
  accepted: 'Accepted',
}

export default function ApplicationsPage() {
  const { user, profile } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (user && profile?.role === 'job_seeker') {
      fetchApplications()
    }
  }, [user, profile])

  useEffect(() => {
    filterApplications()
  }, [applications, searchQuery, statusFilter])

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (
            id,
            title,
            location,
            remote_type,
            job_type,
            companies (
              id,
              name,
              logo_url,
              industry,
              verified
            )
          )
        `)
        .eq('applicant_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching applications:', error)
      } else {
        setApplications(data || [])
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = [...applications]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(app => 
        app.jobs.title.toLowerCase().includes(query) ||
        app.jobs.companies.name.toLowerCase().includes(query) ||
        app.jobs.location.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    setFilteredApplications(filtered)
  }

  const getStatusStats = () => {
    const stats = {
      all: applications.length,
      pending: 0,
      reviewing: 0,
      interview: 0,
      rejected: 0,
      accepted: 0,
    }

    applications.forEach(app => {
      stats[app.status]++
    })

    return stats
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

  // Check if user is job seeker
  if (profile?.role !== 'job_seeker') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Only job seekers can view job applications.</p>
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
          <p className="mt-4 text-gray-600">Loading your applications...</p>
        </div>
      </div>
    )
  }

  const stats = getStatusStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="mt-2 text-gray-600">
            Track the status of your job applications
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start exploring jobs and submit your first application.
            </p>
            <Link
              href="/jobs"
              className="mt-6 inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Browse Jobs
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-gray-900">{stats.all}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.reviewing}</div>
                <div className="text-sm text-gray-600">Reviewing</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-purple-600">{stats.interview}</div>
                <div className="text-sm text-gray-600">Interview</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
                <div className="text-sm text-gray-600">Accepted</div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search applications by job title, company, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Filter className="w-5 h-5 mr-2" />
                    Filters
                  </button>
                </div>

                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        >
                          <option value="all">All Statuses</option>
                          <option value="pending">Pending</option>
                          <option value="reviewing">Under Review</option>
                          <option value="interview">Interview</option>
                          <option value="rejected">Rejected</option>
                          <option value="accepted">Accepted</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setStatusFilter('all')
                        }}
                        className="text-primary hover:text-primary-hover text-sm"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Applications List */}
            {filteredApplications.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search criteria or filters.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => {
                  const StatusIcon = STATUS_ICONS[application.status]
                  
                  return (
                    <div
                      key={application.id}
                      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            {application.jobs.companies.logo_url ? (
                              <img
                                src={application.jobs.companies.logo_url}
                                alt={`${application.jobs.companies.name} logo`}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <Link
                                href={`/jobs/${application.jobs.id}`}
                                className="text-lg font-semibold text-gray-900 hover:text-primary"
                              >
                                {application.jobs.title}
                              </Link>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span className="font-medium">{application.jobs.companies.name}</span>
                                {application.jobs.companies.verified && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Verified
                                  </span>
                                )}
                                {application.jobs.companies.industry && (
                                  <>
                                    <span>•</span>
                                    <span>{application.jobs.companies.industry}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {application.jobs.location}
                            </div>
                            <div className="flex items-center">
                              <Briefcase className="w-4 h-4 mr-1" />
                              {getJobTypeLabel(application.jobs.job_type)}
                            </div>
                            <div className="flex items-center">
                              <Building2 className="w-4 h-4 mr-1" />
                              {getRemoteTypeLabel(application.jobs.remote_type)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Applied {formatRelativeTime(application.created_at)}</span>
                            <Link
                              href={`/jobs/${application.jobs.id}`}
                              className="text-primary hover:text-primary-hover flex items-center"
                            >
                              View Job
                              <ExternalLink className="w-4 h-4 ml-1" />
                            </Link>
                          </div>
                        </div>

                        <div className="ml-6 flex flex-col items-end">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[application.status]}`}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {STATUS_LABELS[application.status]}
                          </div>
                          {application.updated_at !== application.created_at && (
                            <span className="mt-2 text-xs text-gray-500">
                              Updated {formatRelativeTime(application.updated_at)}
                            </span>
                          )}
                        </div>
                      </div>

                      {application.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Notes:</strong> {application.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}