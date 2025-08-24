# Product Requirements Document (PRD)
# HK Job Pro - Job Recruitment Platform

## 1. Executive Summary

### Product Vision
HK Job Pro is a modern, user-centric job recruitment platform that connects job seekers with employers through an intuitive, clean interface. Built with cutting-edge technologies and following modern design principles, the platform streamlines the job search and job posting process.

### Key Objectives
- Simplify job discovery and application process for job seekers
- Provide employers with efficient tools to post jobs 
- Create a seamless, responsive experience across all devices
- Ensure data security and privacy through robust authentication

## 2. Product Overview

### 2.1 Problem Statement
Traditional job boards are often cluttered, difficult to navigate, and lack modern features that users expect. Both job seekers and employers need a more streamlined job searching and posting process.

### 2.2 Solution
A modern web application that provides:
- Clean, intuitive interface for browsing and searching jobs
- Streamlined job posting process for employers
- Real-time updates for newly added jobs
- Secure user authentication and data management
- Mobile-first responsive design

### 2.3 Target Audience

#### Primary Users
1. **Job Seekers**
   - Age: 18-65
   - Tech-savvy professionals and entry-level candidates
   - Looking for career opportunities
   - Value efficiency and user experience

2. **Employers/Recruiters**
   - HR professionals and hiring managers
   - Small to large businesses
   - Need efficient jobs management


## 3. Features & Requirements

### 3.1 Core Features

#### For Job Seekers
- **Browse Jobs**
  - Filter by location, salary, job type, experience level
  - Advanced search with keywords
  - Save searches and set alerts
  - View job details without registration

- **Application Management**
  - One-click apply with saved profile
  - Track application status
  - Receive notifications on application updates
  - Save jobs for later

#### For Employers
- **Job Posting**
  - Create detailed job listings
  - Set application requirements
  - Choose posting duration
  - Preview before publishing

- **Applicant Management**
  - View and filter applications
  - Download resumes
  - Update application status
  - Send messages to candidates

- **Company Profile**
  - Create company page with branding
  - Showcase company culture
  - Display all active job listings
  - Company statistics and insights

- **Ads zone for companies**
  - Create and post ads 
  - Ads management with time expiration and redeem system 
  - allow company users to manage ads 

#### Common Features
- **Authentication**
  - Email/password registration
  - Social login (Google, LinkedIn)
  - Password reset functionality
  - Email verification

- **Dashboard**
  - Personalized home dashboard
  - manage ads / post and credits 
  - Quick actions
  - Statistics and analytics

- **Search & Discovery**
  - Global search bar
  - Auto-suggestions
  - Recent searches
  - Trending jobs/companies

### 3.2 Advanced Features (Phase 2)
- **AI-Powered Matching**
  - Job recommendations based on profile
  - Skill-based matching
  - Salary predictions

- **Video Integration**
  - Video resumes
  - Video job descriptions
  - Virtual interviews scheduling

- **Analytics Dashboard**
  - Application conversion rates
  - View statistics
  - Demographic insights

## 4. Technical Architecture

### 4.1 Technology Stack

#### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Date Handling**: date-fns
- **Icons**: Lucide React

#### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **API**: Next.js API Routes + Supabase Client

#### Development Tools
- **Package Manager**: pnpm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky
- **Testing**: Jest + React Testing Library

### 4.2 Database Schema

```sql
-- Users table (managed by Supabase Auth)
-- auth.users

-- Profiles table
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
  role TEXT CHECK (role IN ('job_seeker', 'employer', 'admin')),
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
  remote_type TEXT CHECK (remote_type IN ('onsite', 'remote', 'hybrid')),
  job_type TEXT CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship')),
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')),
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'HKD',
  status TEXT CHECK (status IN ('draft', 'active', 'closed', 'archived')),
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
  status TEXT CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'rejected', 'hired')),
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

### 4.3 API Structure

```typescript
// API Routes Structure
/api/
  /auth/
    - login
    - register
    - logout
    - reset-password
  /jobs/
    - GET /jobs (list with filters)
    - GET /jobs/:id
    - POST /jobs (create)
    - PUT /jobs/:id
    - DELETE /jobs/:id
  /applications/
    - GET /applications (user's applications)
    - POST /applications
    - PUT /applications/:id
    - DELETE /applications/:id
  /companies/
    - GET /companies
    - GET /companies/:id
    - POST /companies
    - PUT /companies/:id
  /profile/
    - GET /profile
    - PUT /profile
    - POST /profile/resume
```

## 5. Design System & UI/UX Principles

### 5.1 Design Principles

#### Visual Hierarchy
- **Primary Focus**: Content-first approach with clear visual hierarchy
- **Whitespace**: Generous use of whitespace for breathing room
- **Typography**: Clear, readable fonts with proper sizing
  - Headings: Inter or System UI
  - Body: Inter or System UI
  - Monospace: JetBrains Mono (for technical content)

#### Color Palette
```css
/* Primary Colors */
--primary: #0066FF (Modern Blue)
--primary-hover: #0052CC

/* Neutral Colors */
--background: #FFFFFF
--surface: #F8FAFC
--border: #E2E8F0
--text-primary: #0F172A
--text-secondary: #64748B
--text-muted: #94A3B8

/* Semantic Colors */
--success: #10B981
--warning: #F59E0B
--error: #EF4444
--info: #3B82F6

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)
```

### 5.2 Component Design Patterns

#### Cards
- Clean white background with subtle shadows
- Rounded corners (8px)
- Clear content separation
- Hover states with subtle elevation

#### Forms
- Floating labels or top-aligned labels
- Clear error states with inline validation
- Proper spacing between fields
- Progressive disclosure for complex forms

#### Navigation
- Fixed header with transparent background
- Sticky filters sidebar on desktop
- Bottom navigation on mobile
- Breadcrumbs for deep navigation

#### Buttons
- Primary: Filled with primary color
- Secondary: Outlined
- Ghost: Text only with hover background
- Consistent padding and sizing

### 5.3 Responsive Design

#### Breakpoints
```css
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px - 1440px
- Wide: 1440px+
```

#### Mobile-First Approach
- Touch-friendly tap targets (min 44x44px)
- Swipe gestures for navigation
- Optimized images and lazy loading
- Progressive enhancement

### 5.4 Accessibility

#### WCAG 2.1 AA Compliance
- Color contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Keyboard navigation support
- Screen reader compatibility
- ARIA labels and landmarks
- Focus indicators
- Alt text for images

#### Performance
- Lighthouse score target: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

## 6. User Experience Flow

### 6.1 Job Seeker Journey

```
1. Landing Page
   ├── Browse Jobs (No Auth Required)
   ├── Search & Filter
   └── View Job Details

2. Registration/Login
   ├── Email Verification
   └── Profile Setup

3. Profile Creation
   ├── Basic Information
   ├── Resume Upload
   └── Preferences

4. Job Discovery
   ├── Personalized Feed
   ├── Search & Filters
   ├── Save Jobs
   └── Set Alerts

5. Application Process
   ├── One-Click Apply
   ├── Custom Cover Letter
   └── Track Status

6. Post-Application
   ├── Status Updates
   ├── Messages
   └── Interview Scheduling
```

### 6.2 Employer Journey

```
1. Registration
   ├── Company Verification
   └── Profile Setup

2. Company Profile
   ├── Basic Information
   ├── Branding
   └── Team Members

3. Job Posting
   ├── Job Details
   ├── Requirements
   ├── Preview
   └── Publish

4. Application Management
   ├── Review Applications
   ├── Filter & Sort
   ├── Update Status
   └── Communicate

5. Analytics
   ├── View Statistics
   ├── Application Funnel
   └── Performance Metrics
```

## 7. Security & Privacy

### 7.1 Authentication & Authorization
- JWT-based authentication via Supabase Auth
- Role-based access control (RBAC)
- Session management with refresh tokens
- Rate limiting on API endpoints

### 7.2 Data Protection
- HTTPS enforcement
- Data encryption at rest and in transit
- PII data masking in logs
- GDPR compliance
- Regular security audits

### 7.3 Privacy Features
- Granular privacy settings
- Anonymous browsing option
- Data export functionality
- Account deletion with data purge

## 8. MCP Supabase Integration

### 8.1 Configuration
```typescript
// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Row Level Security (RLS) policies
- Users can only edit their own profiles
- Employers can only edit their company's jobs
- Applications visible to applicant and employer only
- Public read access for active jobs
```

### 8.2 Real-time Features
- Application status updates
- New job notifications
- Message notifications
- Live view count updates

### 8.3 Storage Structure
```
/resumes/
  /{user_id}/
    /{filename}
    
/company-logos/
  /{company_id}/
    /logo.{ext}
    
/avatars/
  /{user_id}/
    /avatar.{ext}
```

## 9. Modern Design Features

### 9.1 Micro-interactions
- Smooth transitions (200-300ms)
- Loading skeletons
- Optimistic UI updates
- Hover effects
- Success animations

### 9.2 Progressive Enhancement
- Server-side rendering for SEO
- Progressive Web App capabilities
- Offline support for saved jobs
- Background sync for applications

### 9.3 AI Integration (Future)
- Smart job matching
- Resume parsing
- Automated screening
- Chatbot assistance

## 10. Success Metrics

### 10.1 Key Performance Indicators (KPIs)

#### User Engagement
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Average session duration
- Pages per session
- Bounce rate

#### Business Metrics
- Number of job postings
- Application conversion rate
- Time to hire
- User retention rate
- Revenue per user

#### Technical Metrics
- Page load time
- API response time
- Error rate
- Uptime (99.9% target)
- Core Web Vitals

### 10.2 User Satisfaction
- Net Promoter Score (NPS)
- Customer Satisfaction Score (CSAT)
- User feedback ratings
- Support ticket volume

## 11. Implementation Phases

### Phase 1: MVP (Weeks 1-6)
- Basic authentication
- Job posting and browsing
- Simple application process
- Company profiles
- Basic search and filters

### Phase 2: Enhanced Features (Weeks 7-10)
- Advanced search and filters
- Saved jobs and alerts
- Application tracking
- Messaging system
- Analytics dashboard

### Phase 3: Advanced Features (Weeks 11-14)
- AI-powered matching
- Video integration
- Advanced analytics
- Mobile app development
- API for third-party integration

## 12. File Structure

```
hk-job-pro/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── jobs/
│   │   ├── applications/
│   │   ├── profile/
│   │   └── settings/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── jobs/
│   │   ├── companies/
│   │   └── about/
│   ├── api/
│   │   ├── auth/
│   │   ├── jobs/
│   │   ├── applications/
│   │   └── companies/
│   └── layout.tsx
├── components/
│   ├── ui/           # shadcn components
│   ├── forms/
│   ├── layouts/
│   ├── job/
│   ├── profile/
│   └── shared/
├── lib/
│   ├── supabase/
│   ├── utils/
│   ├── hooks/
│   └── validators/
├── styles/
│   └── globals.css
├── types/
│   └── index.ts
├── public/
│   ├── images/
│   └── icons/
└── config/
    └── site.ts
```

## 13. Testing Strategy

### 13.1 Unit Testing
- Component testing with React Testing Library
- API endpoint testing
- Utility function testing
- 80% code coverage target

### 13.2 Integration Testing
- User flow testing
- API integration testing
- Database transaction testing

### 13.3 E2E Testing
- Critical user journeys
- Cross-browser testing
- Mobile responsiveness testing

## 14. Deployment & DevOps

### 14.1 Deployment Strategy
- Vercel for Next.js hosting
- Supabase cloud for database
- GitHub Actions for CI/CD
- Environment-based deployments (dev, staging, production)

### 14.2 Monitoring
- Error tracking with Sentry
- Analytics with Vercel Analytics
- Performance monitoring
- Uptime monitoring

## 15. Conclusion

HK Job Pro represents a modern approach to job recruitment, combining cutting-edge technology with user-centric design. By leveraging Next.js, Supabase, and modern design principles, the platform will deliver a superior experience for both job seekers and employers.

The phased implementation approach ensures quick time-to-market while maintaining quality and allowing for iterative improvements based on user feedback.

---

*Document Version: 1.0*  
*Last Updated: [Current Date]*  
*Author: Product Team*
```

