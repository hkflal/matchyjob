/**
 * HK Job Pro - Row Level Security (RLS) Policies Tests
 * Tests to verify data access is properly restricted by user roles
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env.local' });

// Create different Supabase clients for different user types
const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

describe('RLS Policies Tests', () => {
  let testUsers = {};
  let testCompany = null;
  let testJob = null;

  beforeAll(async () => {
    // Create test users with different roles
    const jobSeekerEmail = `jobseeker-${Date.now()}@test.com`;
    const employerEmail = `employer-${Date.now()}@test.com`;
    
    // Create job seeker
    const { data: jobSeekerAuth } = await adminClient.auth.admin.createUser({
      email: jobSeekerEmail,
      password: 'TestPass123!',
      user_metadata: { 
        full_name: 'Test Job Seeker', 
        role: 'job_seeker' 
      }
    });
    testUsers.jobSeeker = jobSeekerAuth.user;

    // Create employer  
    const { data: employerAuth } = await adminClient.auth.admin.createUser({
      email: employerEmail,
      password: 'TestPass123!',
      user_metadata: { 
        full_name: 'Test Employer', 
        role: 'employer' 
      }
    });
    testUsers.employer = employerAuth.user;

    // Wait for profile creation trigger
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create test company
    const { data: company } = await adminClient
      .from('companies')
      .insert({
        name: 'Test RLS Company',
        owner_id: testUsers.employer.id,
        verified: true
      })
      .select()
      .single();
    testCompany = company;

    // Create test job
    const { data: job } = await adminClient
      .from('jobs')
      .insert({
        title: 'Test RLS Job',
        description: 'Test job for RLS testing',
        company_id: testCompany.id,
        posted_by: testUsers.employer.id,
        status: 'active'
      })
      .select()
      .single();
    testJob = job;
  });

  afterAll(async () => {
    // Clean up test data
    if (testUsers.jobSeeker) {
      await adminClient.auth.admin.deleteUser(testUsers.jobSeeker.id);
    }
    if (testUsers.employer) {
      await adminClient.auth.admin.deleteUser(testUsers.employer.id);
    }
  });

  describe('Anonymous User Access', () => {
    test('should allow anonymous users to view active jobs', async () => {
      const { data, error } = await anonClient
        .from('jobs')
        .select('*')
        .eq('status', 'active');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    test('should prevent anonymous users from viewing draft jobs', async () => {
      // First create a draft job
      await adminClient
        .from('jobs')
        .insert({
          title: 'Draft Job',
          description: 'Draft job description',
          company_id: testCompany.id,
          posted_by: testUsers.employer.id,
          status: 'draft'
        });

      const { data } = await anonClient
        .from('jobs')
        .select('*')
        .eq('status', 'draft');

      // Should return empty array (no access to draft jobs)
      expect(data).toEqual([]);
    });

    test('should prevent anonymous users from accessing profiles', async () => {
      const { data, error } = await anonClient
        .from('profiles')
        .select('*');

      // This might return empty data or an error depending on RLS policy
      expect(data).toEqual([]);
    });

    test('should prevent anonymous users from accessing applications', async () => {
      const { data } = await anonClient
        .from('applications')
        .select('*');

      expect(data).toEqual([]);
    });
  });

  describe('Job Seeker Access Control', () => {
    let jobSeekerClient;

    beforeAll(async () => {
      jobSeekerClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      // Sign in as job seeker
      await jobSeekerClient.auth.signInWithPassword({
        email: testUsers.jobSeeker.email,
        password: 'TestPass123!'
      });
    });

    afterAll(async () => {
      await jobSeekerClient.auth.signOut();
    });

    test('should allow job seeker to view their own profile', async () => {
      const { data, error } = await jobSeekerClient
        .from('profiles')
        .select('*')
        .eq('id', testUsers.jobSeeker.id)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBe(testUsers.jobSeeker.id);
    });

    test('should allow job seeker to update their own profile', async () => {
      const { error } = await jobSeekerClient
        .from('profiles')
        .update({ bio: 'Updated bio for RLS test' })
        .eq('id', testUsers.jobSeeker.id);

      expect(error).toBeNull();
    });

    test('should prevent job seeker from updating other profiles', async () => {
      const { error } = await jobSeekerClient
        .from('profiles')
        .update({ bio: 'Unauthorized update' })
        .eq('id', testUsers.employer.id);

      expect(error).toBeDefined();
      expect(error.code).toBe('42501'); // Insufficient privilege error
    });

    test('should allow job seeker to create applications', async () => {
      const { data, error } = await jobSeekerClient
        .from('applications')
        .insert({
          job_id: testJob.id,
          applicant_id: testUsers.jobSeeker.id,
          cover_letter: 'Test application for RLS'
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.applicant_id).toBe(testUsers.jobSeeker.id);
    });

    test('should allow job seeker to view their own applications', async () => {
      const { data, error } = await jobSeekerClient
        .from('applications')
        .select('*')
        .eq('applicant_id', testUsers.jobSeeker.id);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    test('should prevent job seeker from viewing other applications', async () => {
      const { data } = await jobSeekerClient
        .from('applications')
        .select('*')
        .neq('applicant_id', testUsers.jobSeeker.id);

      expect(data).toEqual([]);
    });

    test('should prevent job seeker from creating companies', async () => {
      const { error } = await jobSeekerClient
        .from('companies')
        .insert({
          name: 'Unauthorized Company',
          owner_id: testUsers.jobSeeker.id
        });

      expect(error).toBeDefined();
    });
  });

  describe('Employer Access Control', () => {
    let employerClient;

    beforeAll(async () => {
      employerClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      await employerClient.auth.signInWithPassword({
        email: testUsers.employer.email,
        password: 'TestPass123!'
      });
    });

    afterAll(async () => {
      await employerClient.auth.signOut();
    });

    test('should allow employer to view their own companies', async () => {
      const { data, error } = await employerClient
        .from('companies')
        .select('*')
        .eq('owner_id', testUsers.employer.id);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    test('should allow employer to update their own companies', async () => {
      const { error } = await employerClient
        .from('companies')
        .update({ description: 'Updated company description' })
        .eq('id', testCompany.id);

      expect(error).toBeNull();
    });

    test('should prevent employer from viewing unverified companies of others', async () => {
      // Create another company owned by a different user
      const { data: otherCompany } = await adminClient
        .from('companies')
        .insert({
          name: 'Other Company',
          owner_id: testUsers.jobSeeker.id, // Different owner
          verified: false
        })
        .select()
        .single();

      const { data } = await employerClient
        .from('companies')
        .select('*')
        .eq('id', otherCompany.id);

      expect(data).toEqual([]);
    });

    test('should allow employer to create jobs for their company', async () => {
      const { data, error } = await employerClient
        .from('jobs')
        .insert({
          title: 'New Test Job',
          description: 'Job created by employer',
          company_id: testCompany.id,
          posted_by: testUsers.employer.id
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.posted_by).toBe(testUsers.employer.id);
    });

    test('should allow employer to view applications to their jobs', async () => {
      const { data, error } = await employerClient
        .from('applications')
        .select('*')
        .eq('job_id', testJob.id);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    test('should allow employer to update application status', async () => {
      // First get an application
      const { data: applications } = await employerClient
        .from('applications')
        .select('*')
        .eq('job_id', testJob.id)
        .limit(1);

      if (applications && applications.length > 0) {
        const { error } = await employerClient
          .from('applications')
          .update({ status: 'reviewing' })
          .eq('id', applications[0].id);

        expect(error).toBeNull();
      }
    });

    test('should prevent employer from creating jobs for other companies', async () => {
      // Try to create job for a company they don't own
      const { data: otherCompany } = await adminClient
        .from('companies')
        .insert({
          name: 'Another Company',
          owner_id: testUsers.jobSeeker.id,
          verified: true
        })
        .select()
        .single();

      const { error } = await employerClient
        .from('jobs')
        .insert({
          title: 'Unauthorized Job',
          description: 'Job for company not owned',
          company_id: otherCompany.id,
          posted_by: testUsers.employer.id
        });

      expect(error).toBeDefined();
    });
  });

  describe('Admin Access (Service Role)', () => {
    test('should allow admin to view all profiles', async () => {
      const { data, error } = await adminClient
        .from('profiles')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    test('should allow admin to update any profile', async () => {
      const { error } = await adminClient
        .from('profiles')
        .update({ bio: 'Admin updated bio' })
        .eq('id', testUsers.jobSeeker.id);

      expect(error).toBeNull();
    });

    test('should allow admin to view all companies', async () => {
      const { data, error } = await adminClient
        .from('companies')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    test('should allow admin to view all applications', async () => {
      const { data, error } = await adminClient
        .from('applications')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    test('should allow admin to view all jobs (including drafts)', async () => {
      const { data, error } = await adminClient
        .from('jobs')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      // Should include both active and draft jobs
      const statuses = data?.map(job => job.status) || [];
      expect(statuses).toContain('active');
    });
  });

  describe('Cross-User Data Isolation', () => {
    test('should prevent users from accessing saved_jobs of others', async () => {
      // Create saved job for job seeker
      await adminClient
        .from('saved_jobs')
        .insert({
          user_id: testUsers.jobSeeker.id,
          job_id: testJob.id
        });

      const employerClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      await employerClient.auth.signInWithPassword({
        email: testUsers.employer.email,
        password: 'TestPass123!'
      });

      const { data } = await employerClient
        .from('saved_jobs')
        .select('*')
        .eq('user_id', testUsers.jobSeeker.id);

      expect(data).toEqual([]);
      
      await employerClient.auth.signOut();
    });

    test('should prevent cross-contamination of job_views', async () => {
      // Create job view for one user
      await adminClient.rpc('increment_job_views', {
        job_uuid: testJob.id,
        viewer_uuid: testUsers.jobSeeker.id
      });

      const employerClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      await employerClient.auth.signInWithPassword({
        email: testUsers.employer.email,
        password: 'TestPass123!'
      });

      // Employer should only see views for their jobs, not individual user views
      const { data } = await employerClient
        .from('job_views')
        .select('*')
        .eq('viewer_id', testUsers.jobSeeker.id);

      // Policy should restrict this access
      expect(data).toEqual([]);

      await employerClient.auth.signOut();
    });
  });
});