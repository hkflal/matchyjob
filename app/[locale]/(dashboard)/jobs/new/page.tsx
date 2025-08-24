'use client'

import { useState, useEffect } from 'react'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users,
  ArrowLeft,
  Loader2,
  Save,
  Eye,
  Send
} from 'lucide-react'
import Link from 'next/link'

// Form validation schema
const jobFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.string().min(10, 'Requirements must be at least 10 characters'),
  responsibilities: z.string().min(10, 'Responsibilities must be at least 10 characters'),
  benefits: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  remoteType: z.enum(['onsite', 'remote', 'hybrid']),
  jobType: z.enum(['full_time', 'part_time', 'contract', 'internship']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  applicationDeadline: z.string().optional(),
}).refine((data) => {
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMax >= data.salaryMin
  }
  return true
}, {
  message: "Maximum salary must be greater than minimum salary",
  path: ["salaryMax"],
})

type JobFormData = z.infer<typeof jobFormSchema>

export default function NewJobPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [companies, setCompanies] = useState<any[]>([])
  const [selectedCompany, setSelectedCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitMode, setSubmitMode] = useState<'draft' | 'publish'>('draft')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      remoteType: 'onsite',
      jobType: 'full_time',
      experienceLevel: 'mid',
    }
  })

  // Fetch user's companies
  React.useEffect(() => {
    if (user && profile?.role === 'employer') {
      fetchCompanies()
    }
  }, [user, profile])

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_id', user?.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching companies:', error)
    } else {
      setCompanies(data || [])
      if (data && data.length > 0) {
        setSelectedCompany(data[0].id)
      }
    }
  }

  const onSubmit = async (data: JobFormData, mode: 'draft' | 'publish') => {
    if (!selectedCompany) {
      alert('Please select a company or create one first')
      return
    }

    setLoading(true)
    setSubmitMode(mode)

    try {
      // Convert string fields to arrays
      const requirements = data.requirements
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0)

      const responsibilities = data.responsibilities
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0)

      const benefits = data.benefits
        ? data.benefits.split('\n').map(b => b.trim()).filter(b => b.length > 0)
        : []

      const jobData = {
        title: data.title,
        description: data.description,
        requirements,
        responsibilities,
        benefits,
        company_id: selectedCompany,
        location: data.location,
        remote_type: data.remoteType,
        job_type: data.jobType,
        experience_level: data.experienceLevel,
        salary_min: data.salaryMin || null,
        salary_max: data.salaryMax || null,
        salary_currency: 'HKD',
        status: mode === 'publish' ? 'active' : 'draft',
        posted_by: user?.id,
        application_deadline: data.applicationDeadline || null,
      }

      const { data: newJob, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single()

      if (error) {
        throw error
      }

      console.log('Job created successfully:', newJob)
      
      if (mode === 'publish') {
        router.push(`/jobs/${newJob.id}?success=published`)
      } else {
        router.push('/dashboard?success=draft_saved')
      }

    } catch (error) {
      console.error('Error creating job:', error)
      alert('Failed to create job. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Check if user is employer
  if (profile?.role !== 'employer') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need to be an employer to post jobs.</p>
          <Link href="/dashboard" className="text-primary hover:text-primary-hover">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Create a Company Profile First</h2>
          <p className="text-gray-600 mb-6">You need to set up a company profile before posting jobs.</p>
          <Link 
            href="/company/new" 
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors"
          >
            Create Company Profile
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
          <p className="mt-2 text-gray-600">
            Create a compelling job listing to attract the best candidates
          </p>
        </div>

        <form onSubmit={handleSubmit((data) => onSubmit(data, submitMode))} className="space-y-8">
          {/* Company Selection */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Company
                </label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                >
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Job Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  {...register('title')}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                  placeholder="e.g., Senior Software Engineer"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  {...register('location')}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                  placeholder="e.g., Central, Hong Kong"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Type
                </label>
                <select
                  {...register('remoteType')}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                >
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
                  {...register('jobType')}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                >
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
                  {...register('experienceLevel')}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Salary */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Salary (Optional)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Salary (HKD)
                </label>
                <input
                  type="number"
                  {...register('salaryMin', { valueAsNumber: true })}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Salary (HKD)
                </label>
                <input
                  type="number"
                  {...register('salaryMax', { valueAsNumber: true })}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                  placeholder="80000"
                />
                {errors.salaryMax && (
                  <p className="mt-1 text-sm text-red-600">{errors.salaryMax.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description')}
                rows={6}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                placeholder="Describe the role, what the candidate will do, and what makes this opportunity exciting..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Requirements & Responsibilities */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements & Responsibilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements *
                </label>
                <textarea
                  {...register('requirements')}
                  rows={6}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                  placeholder="Bachelor's degree in Computer Science&#10;3+ years of React experience&#10;Strong problem-solving skills&#10;..."
                />
                {errors.requirements && (
                  <p className="mt-1 text-sm text-red-600">{errors.requirements.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Enter each requirement on a new line</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsibilities *
                </label>
                <textarea
                  {...register('responsibilities')}
                  rows={6}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                  placeholder="Develop and maintain web applications&#10;Collaborate with design team&#10;Write clean, maintainable code&#10;..."
                />
                {errors.responsibilities && (
                  <p className="mt-1 text-sm text-red-600">{errors.responsibilities.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">Enter each responsibility on a new line</p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Benefits (Optional)
              </label>
              <textarea
                {...register('benefits')}
                rows={4}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                placeholder="Health insurance&#10;Flexible working hours&#10;Professional development budget&#10;..."
              />
              <p className="mt-1 text-sm text-gray-500">Enter each benefit on a new line</p>
            </div>
          </div>

          {/* Application Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Application Settings
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Deadline (Optional)
              </label>
              <input
                type="date"
                {...register('applicationDeadline')}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
              />
              <p className="mt-1 text-sm text-gray-500">Leave empty for no deadline</p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, 'draft'))}
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && submitMode === 'draft' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save as Draft
            </button>

            <button
              type="button"
              onClick={handleSubmit((data) => onSubmit(data, 'publish'))}
              disabled={loading || !isValid}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && submitMode === 'publish' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Publish Job
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}