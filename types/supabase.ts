export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          phone: string | null
          linkedin_url: string | null
          website_url: string | null
          role: 'job_seeker' | 'employer' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          phone?: string | null
          linkedin_url?: string | null
          website_url?: string | null
          role: 'job_seeker' | 'employer' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          phone?: string | null
          linkedin_url?: string | null
          website_url?: string | null
          role?: 'job_seeker' | 'employer' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          website: string | null
          industry: string | null
          size: string | null
          location: string | null
          founded_year: number | null
          owner_id: string
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          industry?: string | null
          size?: string | null
          location?: string | null
          founded_year?: number | null
          owner_id: string
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          industry?: string | null
          size?: string | null
          location?: string | null
          founded_year?: number | null
          owner_id?: string
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          title: string
          description: string
          requirements: string[] | null
          responsibilities: string[] | null
          benefits: string[] | null
          company_id: string
          location: string | null
          remote_type: 'onsite' | 'remote' | 'hybrid'
          job_type: 'full_time' | 'part_time' | 'contract' | 'internship'
          experience_level: 'entry' | 'mid' | 'senior' | 'executive'
          salary_min: number | null
          salary_max: number | null
          salary_currency: string
          status: 'draft' | 'active' | 'closed' | 'archived'
          posted_by: string
          application_deadline: string | null
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          requirements?: string[] | null
          responsibilities?: string[] | null
          benefits?: string[] | null
          company_id: string
          location?: string | null
          remote_type: 'onsite' | 'remote' | 'hybrid'
          job_type: 'full_time' | 'part_time' | 'contract' | 'internship'
          experience_level: 'entry' | 'mid' | 'senior' | 'executive'
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string
          status?: 'draft' | 'active' | 'closed' | 'archived'
          posted_by: string
          application_deadline?: string | null
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          requirements?: string[] | null
          responsibilities?: string[] | null
          benefits?: string[] | null
          company_id?: string
          location?: string | null
          remote_type?: 'onsite' | 'remote' | 'hybrid'
          job_type?: 'full_time' | 'part_time' | 'contract' | 'internship'
          experience_level?: 'entry' | 'mid' | 'senior' | 'executive'
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string
          status?: 'draft' | 'active' | 'closed' | 'archived'
          posted_by?: string
          application_deadline?: string | null
          views_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          job_id: string
          applicant_id: string
          resume_url: string | null
          cover_letter: string | null
          status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          applicant_id: string
          resume_url?: string | null
          cover_letter?: string | null
          status?: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          applicant_id?: string
          resume_url?: string | null
          cover_letter?: string | null
          status?: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      saved_jobs: {
        Row: {
          id: string
          user_id: string
          job_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          job_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          job_id?: string
          created_at?: string
        }
      }
      job_views: {
        Row: {
          id: string
          job_id: string
          viewer_id: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          viewer_id?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          viewer_id?: string | null
          ip_address?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}