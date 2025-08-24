'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import { Loader2, User, Briefcase, FileText, Settings } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {profile?.full_name || user?.email}!
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {profile?.role === 'job_seeker' ? 'Find your next opportunity' : 'Manage your job postings'}
              </p>
            </div>
            <Link
              href="/profile"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
            >
              <Settings className="inline-block w-4 h-4 mr-2" />
              Settings
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {profile?.role === 'job_seeker' ? (
              <>
                <Link
                  href="/jobs"
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Browse Jobs</h3>
                      <p className="text-sm text-gray-600">Find your next opportunity</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/applications"
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">My Applications</h3>
                      <p className="text-sm text-gray-600">Track your applications</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/profile"
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <User className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Update Profile</h3>
                      <p className="text-sm text-gray-600">Keep your info current</p>
                    </div>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/jobs/new"
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Post a Job</h3>
                      <p className="text-sm text-gray-600">Find the perfect candidate</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/jobs/manage"
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Manage Jobs</h3>
                      <p className="text-sm text-gray-600">View and edit your postings</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/company"
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <User className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Company Profile</h3>
                      <p className="text-sm text-gray-600">Manage company information</p>
                    </div>
                  </div>
                </Link>
              </>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="text-sm text-gray-500">
                <p>No recent activity to display.</p>
                <p className="mt-2">
                  {profile?.role === 'job_seeker'
                    ? 'Start by browsing jobs or updating your profile.'
                    : 'Start by posting your first job or setting up your company profile.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}