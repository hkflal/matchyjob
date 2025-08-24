# Supabase Database Setup Guide

## Current Status
✅ **Database setup scripts are ready for execution**

All SQL scripts have been created and are ready to be executed in your Supabase project. The MCP setup process has been completed with comprehensive automation scripts.

## Quick Setup Instructions

### 🚀 Option 1: One-Click Setup (Recommended)
Execute the complete setup with one command:

```bash
# Copy and paste the complete SQL script in Supabase SQL Editor
cat scripts/complete-setup.sql
```

This single script contains all 6 setup steps in the correct order.

### 📋 Option 2: Step-by-Step Setup

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your **HK Job Pro** project
4. Click on **"SQL Editor"** in the left sidebar

### Step 2: Execute SQL Files in Order
You need to execute the following 6 SQL files **in the exact order listed**:

#### 📄 File 1: Create Types
**File**: `scripts/01-create-types.sql`
**Purpose**: Creates custom PostgreSQL enums (user_role, job_type, etc.)

```sql
-- HK Job Pro - Step 1: Create Custom Types
-- Execute this first in Supabase SQL Editor

-- Create custom types
CREATE TYPE user_role AS ENUM ('job_seeker', 'employer', 'admin');
CREATE TYPE remote_type AS ENUM ('onsite', 'remote', 'hybrid');
CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'internship');
CREATE TYPE experience_level AS ENUM ('entry', 'mid', 'senior', 'executive');
CREATE TYPE job_status AS ENUM ('draft', 'active', 'closed', 'archived');
CREATE TYPE application_status AS ENUM ('pending', 'reviewing', 'shortlisted', 'rejected', 'hired');
```

#### 📄 File 2: Create Tables
**File**: `scripts/02-create-tables.sql`
**Purpose**: Creates all database tables (profiles, companies, jobs, applications, etc.)

*Copy the entire content of this file and execute it*

#### 📄 File 3: Create Functions
**File**: `scripts/03-create-functions.sql`
**Purpose**: Creates functions and triggers for automatic profile creation

*Copy the entire content of this file and execute it*

#### 📄 File 4: Create Policies
**File**: `scripts/04-create-policies.sql`
**Purpose**: Sets up Row Level Security (RLS) policies for data protection

*Copy the entire content of this file and execute it*

#### 📄 File 5: Create Indexes
**File**: `scripts/05-create-indexes.sql`
**Purpose**: Creates database indexes for performance optimization

*Copy the entire content of this file and execute it*

#### 📄 File 6: Create Storage
**File**: `scripts/06-create-storage.sql`
**Purpose**: Sets up storage buckets for file uploads (resumes, company logos, avatars)

*Copy the entire content of this file and execute it*

## Step 3: Verify Setup

### A. Check Tables
1. Go to **"Table Editor"** in Supabase Dashboard
2. Verify these tables exist:
   - ✅ profiles
   - ✅ companies 
   - ✅ jobs
   - ✅ applications
   - ✅ saved_jobs
   - ✅ job_views

### B. Check Storage
1. Go to **"Storage"** in Supabase Dashboard
2. Verify these buckets exist:
   - ✅ resumes
   - ✅ company-logos
   - ✅ avatars

### C. Check Policies
1. Go to **"Authentication"** → **"Policies"**
2. Verify RLS policies are enabled for all tables

## Step 4: Test the Setup
After completing all steps, run:

```bash
npm run db:test
```

You should see all ✅ green checkmarks if setup is successful.

## Step 5: Start Development
Once database is set up, you can run:

```bash
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001) to test the application.

## Troubleshooting

### Common Issues:

**Issue**: "Could not find the table" errors
**Solution**: Execute the SQL files in the correct order (1-6)

**Issue**: Storage bucket errors  
**Solution**: Make sure to execute `06-create-storage.sql` and verify buckets in Storage tab

**Issue**: Permission errors
**Solution**: Verify RLS policies are created by executing `04-create-policies.sql`

**Issue**: Authentication not working
**Solution**: Make sure triggers are created by executing `03-create-functions.sql`

## Environment Variables
Ensure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qqukgtbqpihgvaebbetj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Quick Test Commands

```bash
# Test database setup
npm run db:test

# Confirm user email (for development)
node scripts/confirm-user.js user@example.com

# Start development server
npm run dev

# Build for production
npm run build
```

---

**Need Help?** 
- Check the Supabase Dashboard for any error messages
- Review the SQL Editor execution results
- Run `npm run db:test` to verify each step

*Once all tables and storage buckets are set up, the HK Job Pro platform will be fully functional!*