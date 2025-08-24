# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HK Job Pro is a modern job recruitment platform built with Next.js 14 that connects job seekers with employers. The platform features bilingual support, real-time updates, and a clean, intuitive interface focused on user experience.

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Date Handling**: date-fns
- **Icons**: Lucide React

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **API**: Next.js API Routes + Supabase Client

### Development Tools
- **Package Manager**: pnpm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Git Hooks**: Husky
- **Testing**: Jest + React Testing Library

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm type-check

# Linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run single test file
pnpm test -- filename.test.tsx
```

## Architecture & File Structure

```
hk-job-pro/
├── app/
│   ├── (auth)/          # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (dashboard)/     # Protected dashboard routes
│   │   ├── dashboard/
│   │   ├── jobs/
│   │   ├── applications/
│   │   ├── profile/
│   │   └── settings/
│   ├── (public)/        # Public routes
│   │   ├── page.tsx
│   │   ├── jobs/
│   │   ├── companies/
│   │   └── about/
│   ├── api/             # API routes
│   │   ├── auth/
│   │   ├── jobs/
│   │   ├── applications/
│   │   └── companies/
│   └── layout.tsx
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── forms/           # Form components
│   ├── layouts/         # Layout components
│   ├── job/             # Job-related components
│   ├── profile/         # Profile components
│   └── shared/          # Shared/common components
├── lib/
│   ├── supabase/        # Supabase configuration and utilities
│   ├── utils/           # General utilities
│   ├── hooks/           # Custom React hooks
│   └── validators/      # Zod schemas and validation
├── types/
│   └── index.ts         # TypeScript type definitions
└── config/
    └── site.ts          # Site configuration
```

## Database Schema

The application uses Supabase with the following core entities:
- **profiles**: User profiles (extends auth.users)
- **companies**: Company information and branding
- **jobs**: Job listings with full details
- **applications**: Job applications and status tracking
- **saved_jobs**: User's saved jobs
- **job_views**: Job view tracking for analytics

Key relationships:
- Users can have one profile (job_seeker, employer, or admin role)
- Employers can own multiple companies
- Companies can have multiple jobs
- Users can apply to multiple jobs
- Applications track status and communication

## Authentication & Authorization

- JWT-based authentication via Supabase Auth
- Role-based access control (job_seeker, employer, admin)
- Row Level Security (RLS) policies:
  - Users can only edit their own profiles
  - Employers can only manage their company's jobs
  - Applications visible to applicant and employer only
  - Public read access for active jobs

## Design System

### Color Palette
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

/* Semantic Colors */
--success: #10B981
--warning: #F59E0B
--error: #EF4444
```

### Component Patterns
- Clean white cards with subtle shadows (rounded-lg)
- Floating labels or top-aligned form labels
- Fixed header with transparent background
- Mobile-first responsive design
- Touch-friendly tap targets (min 44x44px)

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility with proper ARIA labels
- Color contrast ratios (4.5:1 for normal text)
- Focus indicators for all interactive elements

## API Structure

```typescript
/api/
  /auth/
    - login, register, logout, reset-password
  /jobs/
    - GET /jobs (list with filters)
    - GET /jobs/[id]
    - POST /jobs (create)
    - PUT /jobs/[id]
    - DELETE /jobs/[id]
  /applications/
    - GET /applications (user's applications)
    - POST /applications
    - PUT /applications/[id]
  /companies/
    - GET /companies
    - GET /companies/[id]
    - POST /companies
    - PUT /companies/[id]
  /profile/
    - GET /profile
    - PUT /profile
    - POST /profile/resume
```

## State Management

- **Zustand**: Global state management for user session, preferences
- **React Hook Form**: Form state and validation
- **Supabase Realtime**: Real-time updates for applications, notifications
- **React Query** (optional): Server state caching and synchronization

## Security Considerations

- HTTPS enforcement
- Data encryption at rest and in transit
- Rate limiting on API endpoints
- Input validation with Zod schemas
- PII data masking in logs
- GDPR compliance features (data export, account deletion)

## Testing Strategy

- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Critical user journeys (job search, application flow)
- Target: 80% code coverage

## Performance Requirements

- Lighthouse score target: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

## Development Practices

### Code Style
- Use TypeScript strict mode
- Define interfaces for all props and data structures
- Follow Next.js App Router patterns
- Use proper error boundaries
- Implement loading states and skeleton screens

### Form Validation
- Use Zod for schema validation
- Implement both client-side and server-side validation
- Provide clear error messages
- Handle form submission states

### File Uploads
- Store resumes in `/resumes/{user_id}/`
- Store company logos in `/company-logos/{company_id}/`
- Store avatars in `/avatars/{user_id}/`
- Implement proper file type and size validation

### Real-time Features
- Application status updates
- New job notifications
- Message notifications
- Live view count updates

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Deployment

- **Hosting**: Vercel (recommended for Next.js)
- **Database**: Supabase Cloud
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics, Sentry for error tracking
- **Performance**: Vercel Edge Network for global CDN

## Key User Flows

### Job Seeker Journey
1. Browse jobs (no auth required)
2. Register/Login → Profile setup → Resume upload
3. Search & filter jobs → Save jobs → Set alerts
4. Apply to jobs → Track application status
5. Receive notifications and messages

### Employer Journey
1. Register → Company verification → Profile setup
2. Create company profile with branding
3. Post jobs with detailed requirements
4. Review applications → Update status → Communicate
5. View analytics and performance metrics

## Future Enhancements (Phase 2)

- AI-powered job matching and recommendations
- Video resumes and job descriptions
- Advanced analytics dashboard
- Mobile app development
- API for third-party integrations