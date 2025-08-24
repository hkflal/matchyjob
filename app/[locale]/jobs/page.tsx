'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { 
  Search, 
  MapPin, 
  Filter,
  Briefcase,
  Building2,
  Clock,
  DollarSign,
  Globe,
  Home,
  Zap,
  X
} from 'lucide-react'
import { formatCurrency, formatRelativeTime, capitalize } from '@/lib/utils'

interface Job {
  id: string
  title: string
  description: string
  location: string
  remote_type: 'onsite' | 'remote' | 'hybrid'
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship'
  experience_level: 'entry' | 'mid' | 'senior' | 'executive'
  salary_min?: number
  salary_max?: number
  salary_currency: string
  views_count: number
  created_at: string
  companies: {
    id: string
    name: string
    logo_url?: string
    industry?: string
    verified: boolean
  }
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

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [remoteTypeFilter, setRemoteTypeFilter] = useState<string>('all')
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('all')
  const [experienceLevelFilter, setExperienceLevelFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [searchQuery, locationFilter, remoteTypeFilter, jobTypeFilter, experienceLevelFilter])

  const fetchJobs = async () => {
    setLoading(true)
    
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            industry,
            verified
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      // Apply search query
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      // Apply location filter
      if (locationFilter.trim()) {
        query = query.ilike('location', `%${locationFilter}%`)
      }

      // Apply remote type filter
      if (remoteTypeFilter !== 'all') {
        query = query.eq('remote_type', remoteTypeFilter)
      }

      // Apply job type filter
      if (jobTypeFilter !== 'all') {
        query = query.eq('job_type', jobTypeFilter)
      }

      // Apply experience level filter
      if (experienceLevelFilter !== 'all') {
        query = query.eq('experience_level', experienceLevelFilter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching jobs:', error)
      } else {
        setJobs(data || [])
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setLocationFilter('')
    setRemoteTypeFilter('all')
    setJobTypeFilter('all')
    setExperienceLevelFilter('all')
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Find Jobs</h1>
                <p className="mt-2 text-gray-600">
                  Discover your next career opportunity in Hong Kong
                </p>
              </div>
              <Link
                href="/"
                className="text-primary hover:text-primary-hover"
              >
                ← Back to Home
              </Link>
            </div>

            {/* Search Bar */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search jobs, keywords, or companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div className="sm:w-64">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:ring-primary focus:border-primary"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Type
                    </label>
                    <select
                      value={remoteTypeFilter}
                      onChange={(e) => setRemoteTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                      <option value="all">All Types</option>
                      <option value="onsite">On-site</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type
                    </label>
                    <select
                      value={jobTypeFilter}
                      onChange={(e) => setJobTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                      <option value="all">All Types</option>
                      <option value="full_time">Full-time</option>
                      <option value="part_time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      value={experienceLevelFilter}
                      onChange={(e) => setExperienceLevelFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                      <option value="all">All Levels</option>
                      <option value="entry">Entry Level</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior Level</option>
                      <option value="executive">Executive</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-primary hover:text-primary-hover text-sm"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
            {(searchQuery || locationFilter || remoteTypeFilter !== 'all' || jobTypeFilter !== 'all' || experienceLevelFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="mt-4 text-primary hover:text-primary-hover"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {jobs.length} job{jobs.length !== 1 ? 's' : ''}
                {searchQuery && ` for "${searchQuery}"`}
                {locationFilter && ` in ${locationFilter}`}
              </p>
            </div>

            <div className="space-y-4">
              {jobs.map((job) => {
                const JobTypeIcon = JOB_TYPE_ICONS[job.job_type]
                const RemoteTypeIcon = REMOTE_TYPE_ICONS[job.remote_type]

                return (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {job.companies?.logo_url ? (
                            <img
                              src={job.companies.logo_url}
                              alt={`${job.companies.name || 'Company'} logo`}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-primary">
                              {job.title}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span className="font-medium">{job.companies?.name || 'Company'}</span>
                              {job.companies?.verified && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Verified
                                </span>
                              )}
                              {job.companies?.industry && (
                                <>
                                  <span>•</span>
                                  <span>{job.companies.industry}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {job.description}
                        </p>

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
                      </div>

                      <div className="text-right text-sm text-gray-500">
                        <div>{formatRelativeTime(job.created_at)}</div>
                        {job.views_count > 0 && (
                          <div className="mt-1">{job.views_count} views</div>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}