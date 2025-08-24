#!/usr/bin/env node

/**
 * Simple Supabase Connection Test
 * Tests basic table access without using rpc functions
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🧪 Simple Supabase Connection Test');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('-'.repeat(50));

async function simpleTest() {
  try {
    // Test 1: Try to select from profiles table
    console.log('1. Testing profiles table access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError.message);
    } else {
      console.log('✅ Profiles table accessible');
    }

    // Test 2: Try to select from companies table
    console.log('2. Testing companies table access...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('count')
      .limit(1);
    
    if (companiesError) {
      console.log('❌ Companies table error:', companiesError.message);
    } else {
      console.log('✅ Companies table accessible');
    }

    // Test 3: Try to select from jobs table
    console.log('3. Testing jobs table access...');
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('count')
      .limit(1);
    
    if (jobsError) {
      console.log('❌ Jobs table error:', jobsError.message);
    } else {
      console.log('✅ Jobs table accessible');
    }

    // Test 4: Storage buckets
    console.log('4. Testing storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Storage error:', bucketsError.message);
    } else {
      console.log('✅ Storage accessible');
      console.log('Buckets found:', buckets?.map(b => b.name).join(', '));
    }

    // Test 5: Try a simple auth operation
    console.log('5. Testing auth functionality...');
    const { data: session } = await supabase.auth.getSession();
    console.log('✅ Auth system accessible (session:', session.session ? 'active' : 'none', ')');

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
  }
}

simpleTest();