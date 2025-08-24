-- HK Job Pro - Step 1: Create Custom Types
-- Execute this first in Supabase SQL Editor

-- Create custom types
CREATE TYPE user_role AS ENUM ('job_seeker', 'employer', 'admin');
CREATE TYPE remote_type AS ENUM ('onsite', 'remote', 'hybrid');
CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'internship');
CREATE TYPE experience_level AS ENUM ('entry', 'mid', 'senior', 'executive');
CREATE TYPE job_status AS ENUM ('draft', 'active', 'closed', 'archived');
CREATE TYPE application_status AS ENUM ('pending', 'reviewing', 'shortlisted', 'rejected', 'hired');