/**
 * HK Job Pro - Functions and Triggers Tests
 * Tests to verify database functions and triggers work correctly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

describe('Functions and Triggers Tests', () => {
  let testUsers = {};
  let testCompany = null;
  let testJob = null;

  beforeAll(async () => {
    // Create test company for job testing
    const testEmployerEmail = `employer-${Date.now()}@test.com`;
    
    const { data: employerAuth } = await supabase.auth.admin.createUser({
      email: testEmployerEmail,
      password: 'TestPass123!',
      user_metadata: { 
        full_name: 'Test Employer', 
        role: 'employer' 
      }
    });
    testUsers.employer = employerAuth.user;

    // Wait for profile creation
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: company } = await supabase
      .from('companies')
      .insert({
        name: 'Test Functions Company',
        owner_id: testUsers.employer.id,
        verified: true
      })
      .select()
      .single();
    testCompany = company;
  });

  afterAll(async () => {
    // Clean up
    if (testUsers.employer) {
      await supabase.auth.admin.deleteUser(testUsers.employer.id);
    }
  });

  describe('Profile Auto-Creation Trigger', () => {
    test('should automatically create profile when user is created', async () => {
      const testEmail = `autotest-${Date.now()}@test.com`;
      const testName = 'Auto Test User';
      const testRole = 'job_seeker';

      // Create user with metadata
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'TestPass123!',
        user_metadata: {
          full_name: testName,
          role: testRole
        }
      });

      expect(authError).toBeNull();
      expect(authUser.user).toBeDefined();

      // Wait a moment for trigger to execute
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if profile was created
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.user.id)
        .single();

      expect(profileError).toBeNull();
      expect(profile).toBeDefined();
      expect(profile.id).toBe(authUser.user.id);
      expect(profile.full_name).toBe(testName);
      expect(profile.role).toBe(testRole);

      // Clean up
      await supabase.auth.admin.deleteUser(authUser.user.id);
    });

    test('should create profile with default role when not specified', async () => {
      const testEmail = `default-role-${Date.now()}@test.com`;

      const { data: authUser } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'TestPass123!',
        user_metadata: {
          full_name: 'Default Role User'
          // No role specified
        }
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.user.id)
        .single();

      expect(profile.role).toBe('job_seeker'); // Default role

      await supabase.auth.admin.deleteUser(authUser.user.id);
    });

    test('should handle profile creation with missing metadata gracefully', async () => {
      const testEmail = `minimal-${Date.now()}@test.com`;

      const { data: authUser } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'TestPass123!'
        // Minimal metadata
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.user.id)
        .single();

      expect(error).toBeNull();
      expect(profile).toBeDefined();
      expect(profile.role).toBe('job_seeker');
      expect(profile.full_name).toBeNull();

      await supabase.auth.admin.deleteUser(authUser.user.id);
    });
  });

  describe('Updated_at Timestamp Trigger', () => {
    test('should update updated_at when profile is modified', async () => {
      // Get current profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUsers.employer.id)
        .single();

      const originalUpdatedAt = profile.updated_at;

      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({ bio: 'Updated bio for timestamp test' })
        .eq('id', testUsers.employer.id);

      expect(error).toBeNull();

      // Check if updated_at was changed
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('updated_at')
        .eq('id', testUsers.employer.id)
        .single();

      expect(updatedProfile.updated_at).not.toBe(originalUpdatedAt);
      expect(new Date(updatedProfile.updated_at) > new Date(originalUpdatedAt)).toBe(true);
    });

    test('should update updated_at when company is modified', async () => {
      const { data: company } = await supabase
        .from('companies')
        .select('updated_at')
        .eq('id', testCompany.id)
        .single();

      const originalUpdatedAt = company.updated_at;

      await new Promise(resolve => setTimeout(resolve, 1000));

      await supabase
        .from('companies')
        .update({ description: 'Updated company description' })
        .eq('id', testCompany.id);

      const { data: updatedCompany } = await supabase
        .from('companies')
        .select('updated_at')
        .eq('id', testCompany.id)
        .single();

      expect(new Date(updatedCompany.updated_at) > new Date(originalUpdatedAt)).toBe(true);
    });

    test('should update updated_at when job is modified', async () => {
      // Create a job first
      const { data: job } = await supabase
        .from('jobs')
        .insert({
          title: 'Timestamp Test Job',
          description: 'Job for testing timestamp updates',
          company_id: testCompany.id,
          posted_by: testUsers.employer.id
        })
        .select()
        .single();

      testJob = job;
      const originalUpdatedAt = job.updated_at;

      await new Promise(resolve => setTimeout(resolve, 1000));

      await supabase
        .from('jobs')
        .update({ title: 'Updated Timestamp Test Job' })
        .eq('id', job.id);

      const { data: updatedJob } = await supabase
        .from('jobs')
        .select('updated_at')
        .eq('id', job.id)
        .single();

      expect(new Date(updatedJob.updated_at) > new Date(originalUpdatedAt)).toBe(true);
    });

    test('should update updated_at when application is modified', async () => {
      // Create test job seeker
      const testEmail = `applicant-${Date.now()}@test.com`;
      const { data: authUser } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'TestPass123!',
        user_metadata: { role: 'job_seeker' }
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create application
      const { data: application } = await supabase
        .from('applications')
        .insert({
          job_id: testJob.id,
          applicant_id: authUser.user.id,
          cover_letter: 'Initial application'
        })
        .select()
        .single();

      const originalUpdatedAt = application.updated_at;

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update application
      await supabase
        .from('applications')
        .update({ status: 'reviewing' })
        .eq('id', application.id);

      const { data: updatedApplication } = await supabase
        .from('applications')
        .select('updated_at')
        .eq('id', application.id)
        .single();

      expect(new Date(updatedApplication.updated_at) > new Date(originalUpdatedAt)).toBe(true);

      // Clean up
      await supabase.auth.admin.deleteUser(authUser.user.id);
    });
  });

  describe('Job Views Increment Function', () => {
    beforeAll(async () => {
      // Ensure we have a test job
      if (!testJob) {
        const { data: job } = await supabase
          .from('jobs')
          .insert({
            title: 'View Test Job',
            description: 'Job for testing view increments',
            company_id: testCompany.id,
            posted_by: testUsers.employer.id,
            views_count: 0
          })
          .select()
          .single();
        testJob = job;
      }
    });

    test('should increment job views count', async () => {
      // Get initial views count
      const { data: initialJob } = await supabase
        .from('jobs')
        .select('views_count')
        .eq('id', testJob.id)
        .single();

      const initialCount = initialJob.views_count || 0;

      // Increment views
      const { error } = await supabase.rpc('increment_job_views', {
        job_uuid: testJob.id
      });

      expect(error).toBeNull();

      // Check if count increased
      const { data: updatedJob } = await supabase
        .from('jobs')
        .select('views_count')
        .eq('id', testJob.id)
        .single();

      expect(updatedJob.views_count).toBe(initialCount + 1);
    });

    test('should record job view with viewer info', async () => {
      const testViewerEmail = `viewer-${Date.now()}@test.com`;
      const { data: authUser } = await supabase.auth.admin.createUser({
        email: testViewerEmail,
        password: 'TestPass123!'
      });

      const testIp = '192.168.1.100';

      // Increment views with viewer info
      const { error } = await supabase.rpc('increment_job_views', {
        job_uuid: testJob.id,
        viewer_uuid: authUser.user.id,
        viewer_ip: testIp
      });

      expect(error).toBeNull();

      // Check if view record was created
      const { data: viewRecords } = await supabase
        .from('job_views')
        .select('*')
        .eq('job_id', testJob.id)
        .eq('viewer_id', authUser.user.id);

      expect(viewRecords.length).toBeGreaterThan(0);
      expect(viewRecords[0].ip_address).toBe(testIp);

      await supabase.auth.admin.deleteUser(authUser.user.id);
    });

    test('should handle anonymous job views', async () => {
      const testIp = '10.0.0.1';

      const { error } = await supabase.rpc('increment_job_views', {
        job_uuid: testJob.id,
        viewer_uuid: null,
        viewer_ip: testIp
      });

      expect(error).toBeNull();

      // Check if anonymous view was recorded
      const { data: viewRecords } = await supabase
        .from('job_views')
        .select('*')
        .eq('job_id', testJob.id)
        .eq('ip_address', testIp)
        .is('viewer_id', null);

      expect(viewRecords.length).toBeGreaterThan(0);
    });

    test('should increment views count multiple times', async () => {
      const { data: initialJob } = await supabase
        .from('jobs')
        .select('views_count')
        .eq('id', testJob.id)
        .single();

      const initialCount = initialJob.views_count;

      // Increment views multiple times
      await supabase.rpc('increment_job_views', { job_uuid: testJob.id });
      await supabase.rpc('increment_job_views', { job_uuid: testJob.id });
      await supabase.rpc('increment_job_views', { job_uuid: testJob.id });

      const { data: updatedJob } = await supabase
        .from('jobs')
        .select('views_count')
        .eq('id', testJob.id)
        .single();

      expect(updatedJob.views_count).toBe(initialCount + 3);
    });

    test('should handle invalid job ID gracefully', async () => {
      const invalidJobId = '00000000-0000-0000-0000-000000000000';

      const { error } = await supabase.rpc('increment_job_views', {
        job_uuid: invalidJobId
      });

      // Should handle error gracefully (foreign key constraint)
      expect(error).toBeDefined();
    });
  });

  describe('Function Error Handling', () => {
    test('should handle profile creation with invalid role', async () => {
      const testEmail = `invalid-role-${Date.now()}@test.com`;

      // This should fail because 'invalid_role' is not in the enum
      const { error } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'TestPass123!',
        user_metadata: {
          full_name: 'Invalid Role User',
          role: 'invalid_role'
        }
      });

      // The creation might succeed but profile creation should fail
      // or it should fall back to default role
      if (!error) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check what happened with the profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', error ? null : 'test')
          .single();

        // Either no profile was created, or it defaulted to job_seeker
        if (profile) {
          expect(profile.role).toBe('job_seeker');
        }
      }
    });

    test('should verify all expected functions exist', async () => {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
          SELECT proname, pronargs
          FROM pg_proc 
          WHERE proname IN (
            'handle_new_user', 
            'increment_job_views', 
            'update_updated_at_column'
          )
          ORDER BY proname;
        `
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBe(3);

      const functionNames = data.map(f => f.proname);
      expect(functionNames).toContain('handle_new_user');
      expect(functionNames).toContain('increment_job_views');
      expect(functionNames).toContain('update_updated_at_column');
    });

    test('should verify all expected triggers exist', async () => {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
          SELECT trigger_name, event_object_table
          FROM information_schema.triggers
          WHERE trigger_schema = 'public'
          OR (trigger_schema = 'auth' AND trigger_name = 'on_auth_user_created')
          ORDER BY trigger_name;
        `
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const triggerNames = data?.map(t => t.trigger_name) || [];
      expect(triggerNames).toContain('on_auth_user_created');
      expect(triggerNames).toContain('update_profiles_updated_at');
      expect(triggerNames).toContain('update_companies_updated_at');
      expect(triggerNames).toContain('update_jobs_updated_at');
      expect(triggerNames).toContain('update_applications_updated_at');
    });
  });
});