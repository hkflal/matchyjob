/**
 * HK Job Pro - Database Schema Tests
 * Tests to verify all database objects exist and are properly configured
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

describe('Database Schema Tests', () => {
  describe('Custom Types', () => {
    test('should have all required custom types', async () => {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
          SELECT typname FROM pg_type 
          WHERE typname IN (
            'user_role', 'remote_type', 'job_type', 
            'experience_level', 'job_status', 'application_status'
          )
          ORDER BY typname;
        `
      });

      expect(error).toBeNull();
      
      const expectedTypes = [
        'application_status',
        'experience_level', 
        'job_status',
        'job_type',
        'remote_type',
        'user_role'
      ];
      
      const actualTypes = data?.map(row => row.typname) || [];
      expect(actualTypes).toEqual(expectedTypes);
    });

    test('should have correct enum values for user_role', async () => {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
          SELECT unnest(enum_range(NULL::user_role))::text as role_value
          ORDER BY role_value;
        `
      });

      expect(error).toBeNull();
      
      const expectedRoles = ['admin', 'employer', 'job_seeker'];
      const actualRoles = data?.map(row => row.role_value) || [];
      expect(actualRoles).toEqual(expectedRoles);
    });

    test('should have correct enum values for job_type', async () => {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
          SELECT unnest(enum_range(NULL::job_type))::text as type_value
          ORDER BY type_value;
        `
      });

      expect(error).toBeNull();
      
      const expectedTypes = ['contract', 'full_time', 'internship', 'part_time'];
      const actualTypes = data?.map(row => row.type_value) || [];
      expect(actualTypes).toEqual(expectedTypes);
    });
  });

  describe('Database Tables', () => {
    test('should have all required tables', async () => {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          AND table_name IN (
            'profiles', 'companies', 'jobs', 
            'applications', 'saved_jobs', 'job_views'
          )
          ORDER BY table_name;
        `
      });

      expect(error).toBeNull();
      
      const expectedTables = [
        'applications',
        'companies',
        'job_views', 
        'jobs',
        'profiles',
        'saved_jobs'
      ];
      
      const actualTables = data?.map(row => row.table_name) || [];
      expect(actualTables).toEqual(expectedTables);
    });

    test('should have correct columns in profiles table', async () => {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'profiles'
          ORDER BY ordinal_position;
        `
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      const columnNames = data?.map(col => col.column_name) || [];
      const requiredColumns = [
        'id', 'username', 'full_name', 'avatar_url', 'bio',
        'location', 'phone', 'linkedin_url', 'website_url',
        'role', 'created_at', 'updated_at'
      ];
      
      requiredColumns.forEach(column => {
        expect(columnNames).toContain(column);
      });
    });

    test('should have correct columns in jobs table', async () => {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'jobs'
          ORDER BY ordinal_position;
        `
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      const columnNames = data?.map(col => col.column_name) || [];
      const requiredColumns = [
        'id', 'title', 'description', 'requirements', 'responsibilities',
        'benefits', 'company_id', 'location', 'remote_type', 'job_type',
        'experience_level', 'salary_min', 'salary_max', 'salary_currency',
        'status', 'posted_by', 'application_deadline', 'views_count',
        'created_at', 'updated_at'
      ];
      
      requiredColumns.forEach(column => {
        expect(columnNames).toContain(column);
      });
    });
  });

  describe('Foreign Key Constraints', () => {
    test('should have foreign key from profiles to auth.users', async () => {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
          SELECT 
            tc.constraint_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
          FROM information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name = 'profiles'
          AND kcu.column_name = 'id';
        `
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
      expect(data?.[0]?.foreign_table_name).toBe('users');
      expect(data?.[0]?.foreign_column_name).toBe('id');
    });

    test('should have foreign key from jobs to companies', async () => {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
          SELECT 
            tc.constraint_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
          FROM information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name = 'jobs'
          AND kcu.column_name = 'company_id';
        `
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
      expect(data?.[0]?.foreign_table_name).toBe('companies');
    });
  });

  describe('Unique Constraints', () => {
    test('should have unique constraint on profiles.username', async () => {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
          SELECT constraint_name, column_name
          FROM information_schema.key_column_usage
          WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'username'
          AND constraint_name LIKE '%username%';
        `
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.length).toBeGreaterThan(0);
    });

    test('should have unique constraint on applications (job_id, applicant_id)', async () => {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
          SELECT tc.constraint_name, kcu.column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
          WHERE tc.table_schema = 'public'
          AND tc.table_name = 'applications'
          AND tc.constraint_type = 'UNIQUE'
          ORDER BY kcu.ordinal_position;
        `
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      const columns = data?.map(row => row.column_name) || [];
      expect(columns).toContain('job_id');
      expect(columns).toContain('applicant_id');
    });
  });

  describe('Default Values', () => {
    test('should have correct default values', async () => {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
          SELECT table_name, column_name, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND column_default IS NOT NULL
          AND table_name IN ('profiles', 'jobs', 'companies')
          ORDER BY table_name, column_name;
        `
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      // Check specific default values
      const defaults = data?.reduce((acc, row) => {
        const key = `${row.table_name}.${row.column_name}`;
        acc[key] = row.column_default;
        return acc;
      }, {}) || {};
      
      expect(defaults['profiles.role']).toContain('job_seeker');
      expect(defaults['jobs.remote_type']).toContain('onsite');
      expect(defaults['jobs.job_type']).toContain('full_time');
      expect(defaults['jobs.experience_level']).toContain('mid');
    });
  });

  describe('Row Level Security', () => {
    test('should have RLS enabled on all tables', async () => {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
          SELECT schemaname, tablename, rowsecurity
          FROM pg_tables 
          WHERE schemaname = 'public'
          AND tablename IN (
            'profiles', 'companies', 'jobs', 
            'applications', 'saved_jobs', 'job_views'
          )
          ORDER BY tablename;
        `
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      // All tables should have RLS enabled (rowsecurity = true)
      data?.forEach(table => {
        expect(table.rowsecurity).toBe(true);
      });
    });

    test('should have RLS policies created for each table', async () => {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: `
          SELECT schemaname, tablename, policyname
          FROM pg_policies 
          WHERE schemaname = 'public'
          AND tablename IN (
            'profiles', 'companies', 'jobs', 
            'applications', 'saved_jobs', 'job_views'
          )
          ORDER BY tablename, policyname;
        `
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      
      // Should have policies for each table
      const tableNames = [...new Set(data?.map(p => p.tablename) || [])];
      const expectedTables = ['profiles', 'companies', 'jobs', 'applications', 'saved_jobs', 'job_views'];
      
      expectedTables.forEach(table => {
        expect(tableNames).toContain(table);
      });
    });
  });
});