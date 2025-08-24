#!/usr/bin/env node

/**
 * HK Job Pro - Generate TypeScript Types from Database Schema
 * This script generates TypeScript types based on the database schema
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🔄 HK Job Pro - Generating TypeScript Types');

// Generate TypeScript definitions based on our schema
const typeDefinitions = `// HK Job Pro - Database Types
// Generated from Supabase schema

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
          role?: 'job_seeker' | 'employer' | 'admin'
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
          owner_id: string | null
          verified: boolean | null
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
          owner_id?: string | null
          verified?: boolean | null
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
          owner_id?: string | null
          verified?: boolean | null
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
          company_id: string | null
          location: string | null
          remote_type: 'onsite' | 'remote' | 'hybrid'
          job_type: 'full_time' | 'part_time' | 'contract' | 'internship'
          experience_level: 'entry' | 'mid' | 'senior' | 'executive'
          salary_min: number | null
          salary_max: number | null
          salary_currency: string | null
          status: 'draft' | 'active' | 'closed' | 'archived' | null
          posted_by: string | null
          application_deadline: string | null
          views_count: number | null
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
          company_id?: string | null
          location?: string | null
          remote_type?: 'onsite' | 'remote' | 'hybrid'
          job_type?: 'full_time' | 'part_time' | 'contract' | 'internship'
          experience_level?: 'entry' | 'mid' | 'senior' | 'executive'
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string | null
          status?: 'draft' | 'active' | 'closed' | 'archived' | null
          posted_by?: string | null
          application_deadline?: string | null
          views_count?: number | null
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
          company_id?: string | null
          location?: string | null
          remote_type?: 'onsite' | 'remote' | 'hybrid'
          job_type?: 'full_time' | 'part_time' | 'contract' | 'internship'
          experience_level?: 'entry' | 'mid' | 'senior' | 'executive'
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string | null
          status?: 'draft' | 'active' | 'closed' | 'archived' | null
          posted_by?: string | null
          application_deadline?: string | null
          views_count?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          job_id: string | null
          applicant_id: string | null
          resume_url: string | null
          cover_letter: string | null
          status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired' | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id?: string | null
          applicant_id?: string | null
          resume_url?: string | null
          cover_letter?: string | null
          status?: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired' | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string | null
          applicant_id?: string | null
          resume_url?: string | null
          cover_letter?: string | null
          status?: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired' | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      saved_jobs: {
        Row: {
          id: string
          user_id: string | null
          job_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          job_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          job_id?: string | null
          created_at?: string
        }
      }
      job_views: {
        Row: {
          id: string
          job_id: string | null
          viewer_id: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_id?: string | null
          viewer_id?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string | null
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
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      increment_job_views: {
        Args: {
          job_uuid: string
          viewer_uuid?: string
          viewer_ip?: string
        }
        Returns: undefined
      }
      update_updated_at_column: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_role: 'job_seeker' | 'employer' | 'admin'
      remote_type: 'onsite' | 'remote' | 'hybrid'
      job_type: 'full_time' | 'part_time' | 'contract' | 'internship'
      experience_level: 'entry' | 'mid' | 'senior' | 'executive'
      job_status: 'draft' | 'active' | 'closed' | 'archived'
      application_status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Company = Database['public']['Tables']['companies']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type Application = Database['public']['Tables']['applications']['Row'];
export type SavedJob = Database['public']['Tables']['saved_jobs']['Row'];
export type JobView = Database['public']['Tables']['job_views']['Row'];

export type UserRole = Database['public']['Enums']['user_role'];
export type RemoteType = Database['public']['Enums']['remote_type'];
export type JobType = Database['public']['Enums']['job_type'];
export type ExperienceLevel = Database['public']['Enums']['experience_level'];
export type JobStatus = Database['public']['Enums']['job_status'];
export type ApplicationStatus = Database['public']['Enums']['application_status'];

// Extended types with relations
export type JobWithCompany = Job & {
  company: Company | null;
};

export type ApplicationWithJob = Application & {
  job: JobWithCompany | null;
};

export type CompanyWithJobs = Company & {
  jobs: Job[];
};

export type ProfileWithApplications = Profile & {
  applications: ApplicationWithJob[];
};
`;

// Write types to file
const typesPath = path.join(process.cwd(), 'types', 'database.ts');
const typesDir = path.dirname(typesPath);

// Ensure types directory exists
if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir, { recursive: true });
  console.log('📁 Created types directory');
}

// Write the types file
fs.writeFileSync(typesPath, typeDefinitions);
console.log('✅ TypeScript types generated successfully!');
console.log('📍 File location:', typesPath);

// Update the main types/index.ts file
const indexTypesPath = path.join(process.cwd(), 'types', 'index.ts');
const indexContent = `// HK Job Pro - Main Types Export
// This file exports all types used throughout the application

export * from './database';

// Additional application types
export interface User {
  id: string;
  email?: string;
  profile?: Profile;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export interface JobFormData {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  company_id: string;
  location: string;
  remote_type: RemoteType;
  job_type: JobType;
  experience_level: ExperienceLevel;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  application_deadline?: string;
}

export interface ApplicationFormData {
  job_id: string;
  cover_letter?: string;
  resume_url?: string;
}

// Search and filter types
export interface JobFilters {
  search?: string;
  location?: string;
  remote_type?: RemoteType;
  job_type?: JobType;
  experience_level?: ExperienceLevel;
  salary_min?: number;
  salary_max?: number;
  company_id?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  count?: number;
}
`;

fs.writeFileSync(indexTypesPath, indexContent);
console.log('✅ Main types index updated!');
console.log('📍 File location:', indexTypesPath);

console.log('\n🎉 TypeScript types generation completed!');
console.log('💡 You can now import types with: import { Profile, Job, etc } from "@/types"');