# HK Job Pro - Step-by-Step Supabase Setup

## Issue Identified
The complete SQL script didn't execute properly in Supabase. Let's execute it step by step.

## Step 1: Create Custom Types
Execute this in Supabase SQL Editor:

```sql
-- Step 1: Create Custom Types
CREATE TYPE user_role AS ENUM ('job_seeker', 'employer', 'admin');
CREATE TYPE remote_type AS ENUM ('onsite', 'remote', 'hybrid');
CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'internship');
CREATE TYPE experience_level AS ENUM ('entry', 'mid', 'senior', 'executive');
CREATE TYPE job_status AS ENUM ('draft', 'active', 'closed', 'archived');
CREATE TYPE application_status AS ENUM ('pending', 'reviewing', 'shortlisted', 'rejected', 'hired');
```

**Expected Result**: "Success. No rows returned"

## Step 2: Create Tables
Execute this in Supabase SQL Editor:

```sql
-- Step 2: Create Tables

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  phone TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  role user_role NOT NULL DEFAULT 'job_seeker',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  size TEXT,
  location TEXT,
  founded_year INTEGER,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  responsibilities TEXT[],
  benefits TEXT[],
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  location TEXT,
  remote_type remote_type NOT NULL DEFAULT 'onsite',
  job_type job_type NOT NULL DEFAULT 'full_time',
  experience_level experience_level NOT NULL DEFAULT 'mid',
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'HKD',
  status job_status DEFAULT 'draft',
  posted_by UUID REFERENCES profiles(id),
  application_deadline DATE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  resume_url TEXT,
  cover_letter TEXT,
  status application_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, applicant_id)
);

-- Saved jobs table
CREATE TABLE saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- Job views tracking
CREATE TABLE job_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id),
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Expected Result**: "Success. No rows returned"

## Step 3: Create Functions
Execute this in Supabase SQL Editor:

```sql
-- Step 3: Create Functions and Triggers

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', COALESCE(NEW.raw_user_meta_data->>'role', 'job_seeker')::user_role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment job views
CREATE OR REPLACE FUNCTION public.increment_job_views(job_uuid UUID, viewer_uuid UUID DEFAULT NULL, viewer_ip INET DEFAULT NULL)
RETURNS void AS $$
BEGIN
  -- Insert view record
  INSERT INTO job_views (job_id, viewer_id, ip_address)
  VALUES (job_uuid, viewer_uuid, viewer_ip);
  
  -- Update views count
  UPDATE jobs 
  SET views_count = views_count + 1 
  WHERE id = job_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Expected Result**: "Success. No rows returned"

## Step 4: Enable RLS and Create Policies
Execute this in Supabase SQL Editor:

```sql
-- Step 4: Enable Row Level Security and Create Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Companies policies
CREATE POLICY "Anyone can view verified companies" ON companies FOR SELECT USING (verified = true);
CREATE POLICY "Employers can view their companies" ON companies FOR SELECT USING (
  auth.uid() = owner_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Employers can create companies" ON companies FOR INSERT WITH CHECK (
  auth.uid() = owner_id AND 
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('employer', 'admin'))
);
CREATE POLICY "Employers can update their companies" ON companies FOR UPDATE USING (
  auth.uid() = owner_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Jobs policies
CREATE POLICY "Anyone can view active jobs" ON jobs FOR SELECT USING (status = 'active');
CREATE POLICY "Employers can view their jobs" ON jobs FOR SELECT USING (
  auth.uid() = posted_by OR
  EXISTS (SELECT 1 FROM companies WHERE companies.id = jobs.company_id AND companies.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Employers can create jobs" ON jobs FOR INSERT WITH CHECK (
  auth.uid() = posted_by AND
  EXISTS (SELECT 1 FROM companies WHERE companies.id = company_id AND companies.owner_id = auth.uid()) AND
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('employer', 'admin'))
);
CREATE POLICY "Employers can update their jobs" ON jobs FOR UPDATE USING (
  auth.uid() = posted_by OR
  EXISTS (SELECT 1 FROM companies WHERE companies.id = jobs.company_id AND companies.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Applications policies
CREATE POLICY "Applicants can view their applications" ON applications FOR SELECT USING (auth.uid() = applicant_id);
CREATE POLICY "Employers can view applications to their jobs" ON applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.posted_by = auth.uid()) OR
  EXISTS (SELECT 1 FROM jobs JOIN companies ON jobs.company_id = companies.id WHERE jobs.id = applications.job_id AND companies.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Job seekers can create applications" ON applications FOR INSERT WITH CHECK (
  auth.uid() = applicant_id AND
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('job_seeker', 'admin'))
);
CREATE POLICY "Applicants can update their applications" ON applications FOR UPDATE USING (auth.uid() = applicant_id);
CREATE POLICY "Employers can update application status" ON applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.posted_by = auth.uid()) OR
  EXISTS (SELECT 1 FROM jobs JOIN companies ON jobs.company_id = companies.id WHERE jobs.id = applications.job_id AND companies.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Saved jobs policies
CREATE POLICY "Users can view their saved jobs" ON saved_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create saved jobs" ON saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their saved jobs" ON saved_jobs FOR DELETE USING (auth.uid() = user_id);

-- Job views policies
CREATE POLICY "Anyone can create job views" ON job_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own views" ON job_views FOR SELECT USING (auth.uid() = viewer_id);
CREATE POLICY "Employers can view their job views" ON job_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_views.job_id AND jobs.posted_by = auth.uid()) OR
  EXISTS (SELECT 1 FROM jobs JOIN companies ON jobs.company_id = companies.id WHERE jobs.id = job_views.job_id AND companies.owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
```

**Expected Result**: "Success. No rows returned"

## Step 5: Create Indexes
Execute this in Supabase SQL Editor:

```sql
-- Step 5: Create Performance Indexes

-- Indexes for performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_companies_owner_id ON companies(owner_id);
CREATE INDEX idx_companies_verified ON companies(verified);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_remote_type ON jobs(remote_type);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX idx_job_views_job_id ON job_views(job_id);
CREATE INDEX idx_job_views_created_at ON job_views(created_at DESC);

-- Full text search indexes
CREATE INDEX idx_jobs_title_fts ON jobs USING gin(to_tsvector('english', title));
CREATE INDEX idx_jobs_description_fts ON jobs USING gin(to_tsvector('english', description));
CREATE INDEX idx_companies_name_fts ON companies USING gin(to_tsvector('english', name));
```

**Expected Result**: "Success. No rows returned"

## Step 6: Create Storage Buckets
Execute this in Supabase SQL Editor:

```sql
-- Step 6: Create Storage Buckets and Policies

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
```

**Expected Result**: "Success. 3 rows affected." or similar

## Step 7: Create Storage Policies
Execute this in Supabase SQL Editor:

```sql
-- Step 7: Storage Policies

-- Storage policies for resumes (private)
CREATE POLICY "Users can upload their own resume" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'resumes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Users can update their own resume" ON storage.objects FOR UPDATE USING (
  bucket_id = 'resumes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Users can delete their own resume" ON storage.objects FOR DELETE USING (
  bucket_id = 'resumes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Users can view their own resume" ON storage.objects FOR SELECT USING (
  bucket_id = 'resumes' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for company logos (public)
CREATE POLICY "Anyone can view company logos" ON storage.objects FOR SELECT USING (bucket_id = 'company-logos');
CREATE POLICY "Company owners can upload logos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'company-logos' AND 
  EXISTS (SELECT 1 FROM companies WHERE companies.id::text = (storage.foldername(name))[1] AND companies.owner_id = auth.uid())
);
CREATE POLICY "Company owners can update logos" ON storage.objects FOR UPDATE USING (
  bucket_id = 'company-logos' AND 
  EXISTS (SELECT 1 FROM companies WHERE companies.id::text = (storage.foldername(name))[1] AND companies.owner_id = auth.uid())
);
CREATE POLICY "Company owners can delete logos" ON storage.objects FOR DELETE USING (
  bucket_id = 'company-logos' AND 
  EXISTS (SELECT 1 FROM companies WHERE companies.id::text = (storage.foldername(name))[1] AND companies.owner_id = auth.uid())
);

-- Storage policies for avatars (public)
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Expected Result**: "Success. No rows returned"

## After Each Step
Run this command to check progress:
```bash
node scripts/debug-database.js
```

## Final Verification
After all steps are complete, run:
```bash
npm run db:test
```

You should see all ✅ green checkmarks if the setup was successful!