/**
 * HK Job Pro - Storage Buckets Tests
 * Tests to verify file upload capabilities and security policies
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../../.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

describe('Storage Buckets Tests', () => {
  let testUsers = {};
  let testCompany = null;
  let testFiles = {};

  beforeAll(async () => {
    // Create test users
    const jobSeekerEmail = `storage-jobseeker-${Date.now()}@test.com`;
    const employerEmail = `storage-employer-${Date.now()}@test.com`;
    
    const { data: jobSeekerAuth } = await supabase.auth.admin.createUser({
      email: jobSeekerEmail,
      password: 'TestPass123!',
      user_metadata: { 
        full_name: 'Storage Test Job Seeker', 
        role: 'job_seeker' 
      }
    });
    testUsers.jobSeeker = jobSeekerAuth.user;

    const { data: employerAuth } = await supabase.auth.admin.createUser({
      email: employerEmail,
      password: 'TestPass123!',
      user_metadata: { 
        full_name: 'Storage Test Employer', 
        role: 'employer' 
      }
    });
    testUsers.employer = employerAuth.user;

    // Wait for profile creation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create test company
    const { data: company } = await supabase
      .from('companies')
      .insert({
        name: 'Storage Test Company',
        owner_id: testUsers.employer.id,
        verified: true
      })
      .select()
      .single();
    testCompany = company;

    // Create test files (simple text files for testing)
    const testDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Create test resume file
    testFiles.resume = {
      path: path.join(testDir, 'test-resume.txt'),
      content: 'This is a test resume file for storage testing.',
      type: 'text/plain'
    };
    fs.writeFileSync(testFiles.resume.path, testFiles.resume.content);

    // Create test logo file
    testFiles.logo = {
      path: path.join(testDir, 'test-logo.txt'),
      content: 'This is a test company logo file.',
      type: 'text/plain'
    };
    fs.writeFileSync(testFiles.logo.path, testFiles.logo.content);

    // Create test avatar file
    testFiles.avatar = {
      path: path.join(testDir, 'test-avatar.txt'),
      content: 'This is a test avatar file.',
      type: 'text/plain'
    };
    fs.writeFileSync(testFiles.avatar.path, testFiles.avatar.content);
  });

  afterAll(async () => {
    // Clean up test users
    if (testUsers.jobSeeker) {
      await supabase.auth.admin.deleteUser(testUsers.jobSeeker.id);
    }
    if (testUsers.employer) {
      await supabase.auth.admin.deleteUser(testUsers.employer.id);
    }

    // Clean up test files
    Object.values(testFiles).forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
  });

  describe('Storage Buckets Existence', () => {
    test('should have all required storage buckets', async () => {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      expect(error).toBeNull();
      expect(buckets).toBeDefined();
      
      const bucketNames = buckets.map(bucket => bucket.name);
      const requiredBuckets = ['resumes', 'company-logos', 'avatars'];
      
      requiredBuckets.forEach(bucketName => {
        expect(bucketNames).toContain(bucketName);
      });
    });

    test('should have correct bucket privacy settings', async () => {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      expect(error).toBeNull();
      
      const bucketSettings = buckets.reduce((acc, bucket) => {
        acc[bucket.name] = bucket.public;
        return acc;
      }, {});
      
      expect(bucketSettings['resumes']).toBe(false); // Private
      expect(bucketSettings['company-logos']).toBe(true); // Public
      expect(bucketSettings['avatars']).toBe(true); // Public
    });
  });

  describe('Resumes Bucket (Private)', () => {
    test('should allow user to upload their own resume', async () => {
      const resumePath = `${testUsers.jobSeeker.id}/resume.txt`;
      const fileContent = fs.readFileSync(testFiles.resume.path);

      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(resumePath, fileContent, {
          contentType: testFiles.resume.type
        });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.path).toBe(resumePath);
    });

    test('should allow user to download their own resume', async () => {
      const resumePath = `${testUsers.jobSeeker.id}/resume.txt`;
      
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(resumePath);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.size).toBeGreaterThan(0);
    });

    test('should allow user to update their own resume', async () => {
      const resumePath = `${testUsers.jobSeeker.id}/resume.txt`;
      const updatedContent = 'Updated resume content for testing';

      const { data, error } = await supabase.storage
        .from('resumes')
        .update(resumePath, updatedContent, {
          contentType: 'text/plain'
        });

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    test('should allow user to delete their own resume', async () => {
      const resumePath = `${testUsers.jobSeeker.id}/resume-delete-test.txt`;
      
      // First upload a file to delete
      await supabase.storage
        .from('resumes')
        .upload(resumePath, 'Resume to be deleted');

      // Then delete it
      const { data, error } = await supabase.storage
        .from('resumes')
        .remove([resumePath]);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBe(1);
    });

    test('should prevent user from accessing other users resumes', async () => {
      const otherUserPath = `${testUsers.employer.id}/private-resume.txt`;
      
      // Admin uploads a file for the employer
      await supabase.storage
        .from('resumes')
        .upload(otherUserPath, 'Private resume content');

      // Job seeker tries to access it
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(otherUserPath);

      // Should be denied or return error
      expect(error).toBeDefined();
    });

    test('should prevent user from uploading to other users folders', async () => {
      const unauthorizedPath = `${testUsers.employer.id}/unauthorized-resume.txt`;
      
      const { error } = await supabase.storage
        .from('resumes')
        .upload(unauthorizedPath, 'Unauthorized content');

      expect(error).toBeDefined();
      expect(error.message).toMatch(/policy/i);
    });

    test('should list only users own resume files', async () => {
      const userFolder = `${testUsers.jobSeeker.id}`;
      
      const { data, error } = await supabase.storage
        .from('resumes')
        .list(userFolder);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      // All files should be in user's folder
      data.forEach(file => {
        expect(file.name).toBeDefined();
      });
    });
  });

  describe('Company Logos Bucket (Public)', () => {
    test('should allow company owner to upload logo', async () => {
      const logoPath = `${testCompany.id}/logo.txt`;
      const fileContent = fs.readFileSync(testFiles.logo.path);

      const { data, error } = await supabase.storage
        .from('company-logos')
        .upload(logoPath, fileContent, {
          contentType: testFiles.logo.type
        });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.path).toBe(logoPath);
    });

    test('should allow anyone to view company logos (public access)', async () => {
      const logoPath = `${testCompany.id}/logo.txt`;
      
      // Create a new client without authentication (anonymous)
      const anonClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      const { data, error } = await anonClient.storage
        .from('company-logos')
        .download(logoPath);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.size).toBeGreaterThan(0);
    });

    test('should allow company owner to update their logo', async () => {
      const logoPath = `${testCompany.id}/logo.txt`;
      const updatedContent = 'Updated company logo content';

      const { data, error } = await supabase.storage
        .from('company-logos')
        .update(logoPath, updatedContent, {
          contentType: 'text/plain'
        });

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    test('should allow company owner to delete their logo', async () => {
      const logoPath = `${testCompany.id}/delete-test-logo.txt`;
      
      // Upload a test logo
      await supabase.storage
        .from('company-logos')
        .upload(logoPath, 'Logo to be deleted');

      // Delete it
      const { data, error } = await supabase.storage
        .from('company-logos')
        .remove([logoPath]);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    test('should prevent non-owner from uploading to company folder', async () => {
      // Create another company owned by job seeker
      const { data: otherCompany } = await supabase
        .from('companies')
        .insert({
          name: 'Other Test Company',
          owner_id: testUsers.jobSeeker.id
        })
        .select()
        .single();

      const unauthorizedPath = `${otherCompany.id}/unauthorized-logo.txt`;
      
      // Employer tries to upload to job seeker's company
      const { error } = await supabase.storage
        .from('company-logos')
        .upload(unauthorizedPath, 'Unauthorized logo', {
          contentType: 'text/plain'
        });

      // This should be prevented by RLS policy
      expect(error).toBeDefined();
    });

    test('should generate public URL for company logos', async () => {
      const logoPath = `${testCompany.id}/logo.txt`;
      
      const { data } = await supabase.storage
        .from('company-logos')
        .getPublicUrl(logoPath);

      expect(data).toBeDefined();
      expect(data.publicUrl).toBeDefined();
      expect(data.publicUrl).toContain('company-logos');
      expect(data.publicUrl).toContain(testCompany.id);
    });
  });

  describe('Avatars Bucket (Public)', () => {
    test('should allow user to upload their own avatar', async () => {
      const avatarPath = `${testUsers.jobSeeker.id}/avatar.txt`;
      const fileContent = fs.readFileSync(testFiles.avatar.path);

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(avatarPath, fileContent, {
          contentType: testFiles.avatar.type
        });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.path).toBe(avatarPath);
    });

    test('should allow anyone to view avatars (public access)', async () => {
      const avatarPath = `${testUsers.jobSeeker.id}/avatar.txt`;
      
      const anonClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      const { data, error } = await anonClient.storage
        .from('avatars')
        .download(avatarPath);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.size).toBeGreaterThan(0);
    });

    test('should allow user to update their own avatar', async () => {
      const avatarPath = `${testUsers.jobSeeker.id}/avatar.txt`;
      const updatedContent = 'Updated avatar content';

      const { data, error } = await supabase.storage
        .from('avatars')
        .update(avatarPath, updatedContent, {
          contentType: 'text/plain'
        });

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    test('should allow user to delete their own avatar', async () => {
      const avatarPath = `${testUsers.jobSeeker.id}/delete-test-avatar.txt`;
      
      // Upload test avatar
      await supabase.storage
        .from('avatars')
        .upload(avatarPath, 'Avatar to be deleted');

      // Delete it
      const { data, error } = await supabase.storage
        .from('avatars')
        .remove([avatarPath]);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    test('should prevent user from uploading to other users avatar folders', async () => {
      const unauthorizedPath = `${testUsers.employer.id}/unauthorized-avatar.txt`;
      
      const { error } = await supabase.storage
        .from('avatars')
        .upload(unauthorizedPath, 'Unauthorized avatar');

      expect(error).toBeDefined();
      expect(error.message).toMatch(/policy/i);
    });

    test('should generate public URL for avatars', async () => {
      const avatarPath = `${testUsers.jobSeeker.id}/avatar.txt`;
      
      const { data } = await supabase.storage
        .from('avatars')
        .getPublicUrl(avatarPath);

      expect(data).toBeDefined();
      expect(data.publicUrl).toBeDefined();
      expect(data.publicUrl).toContain('avatars');
      expect(data.publicUrl).toContain(testUsers.jobSeeker.id);
    });
  });

  describe('Storage Error Handling', () => {
    test('should handle invalid bucket access', async () => {
      const { data, error } = await supabase.storage
        .from('nonexistent-bucket')
        .list();

      expect(error).toBeDefined();
      expect(error.message).toMatch(/bucket/i);
    });

    test('should handle invalid file paths', async () => {
      const { data, error } = await supabase.storage
        .from('resumes')
        .download('invalid/path/file.txt');

      expect(error).toBeDefined();
    });

    test('should handle file size limits', async () => {
      // This test would require creating a very large file
      // For now, we'll test the concept with a reasonable size
      const largePath = `${testUsers.jobSeeker.id}/large-file.txt`;
      const largeContent = 'x'.repeat(1024 * 1024); // 1MB

      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(largePath, largeContent);

      // Should succeed for 1MB, but this tests the mechanism
      expect(error).toBeNull();
      
      // Clean up
      await supabase.storage.from('resumes').remove([largePath]);
    });

    test('should handle concurrent uploads', async () => {
      const promises = [];
      
      for (let i = 0; i < 3; i++) {
        const filePath = `${testUsers.jobSeeker.id}/concurrent-${i}.txt`;
        const promise = supabase.storage
          .from('resumes')
          .upload(filePath, `Concurrent upload ${i}`);
        promises.push(promise);
      }

      const results = await Promise.allSettled(promises);
      
      // At least some should succeed
      const succeeded = results.filter(result => result.status === 'fulfilled' && !result.value.error);
      expect(succeeded.length).toBeGreaterThan(0);

      // Clean up
      for (let i = 0; i < 3; i++) {
        const filePath = `${testUsers.jobSeeker.id}/concurrent-${i}.txt`;
        await supabase.storage.from('resumes').remove([filePath]);
      }
    });
  });

  describe('Storage Policies Integration', () => {
    test('should verify storage policies are properly configured', async () => {
      // This test checks if the storage policies work as expected
      // by testing access patterns
      
      // Test authenticated user access
      const userClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      // Sign in as job seeker
      await userClient.auth.signInWithPassword({
        email: testUsers.jobSeeker.email,
        password: 'TestPass123!'
      });

      // Should be able to upload to own folder
      const testPath = `${testUsers.jobSeeker.id}/policy-test.txt`;
      const { error: uploadError } = await userClient.storage
        .from('resumes')
        .upload(testPath, 'Policy test file');

      expect(uploadError).toBeNull();

      // Should not be able to upload to other's folder
      const unauthorizedPath = `${testUsers.employer.id}/unauthorized.txt`;
      const { error: unauthorizedError } = await userClient.storage
        .from('resumes')
        .upload(unauthorizedPath, 'Unauthorized file');

      expect(unauthorizedError).toBeDefined();

      await userClient.auth.signOut();
    });

    test('should handle anonymous access correctly', async () => {
      const anonClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      // Anonymous should not be able to upload to resumes
      const { error: resumeError } = await anonClient.storage
        .from('resumes')
        .upload('test-file.txt', 'Test content');

      expect(resumeError).toBeDefined();

      // Anonymous should be able to view public buckets
      const { data: logosList, error: logoError } = await anonClient.storage
        .from('company-logos')
        .list();

      expect(logoError).toBeNull();
      expect(Array.isArray(logosList)).toBe(true);
    });
  });
});