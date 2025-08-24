// HK Job Pro - Main Types Export
// This file exports all types used throughout the application

export * from './database';
import type { Profile, UserRole, RemoteType, JobType, ExperienceLevel } from './database';

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
