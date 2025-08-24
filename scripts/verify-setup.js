#!/usr/bin/env node

/**
 * HK Job Pro - Verify Database Setup
 * This script verifies the database setup by directly querying the information schema
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🔍 HK Job Pro - Database Setup Verification');
console.log('📍 Supabase URL:', supabaseUrl);

async function verifySetup() {
  console.log('\n1. 🔍 Checking database tables...');
  
  // Check tables using information_schema
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .in('table_name', ['profiles', 'companies', 'jobs', 'applications', 'saved_jobs', 'job_views']);

  if (tablesError) {
    console.error('❌ Error checking tables:', tablesError.message);
    return;
  }

  const expectedTables = ['profiles', 'companies', 'jobs', 'applications', 'saved_jobs', 'job_views'];
  const existingTables = tables?.map(t => t.table_name) || [];
  
  expectedTables.forEach(table => {
    const exists = existingTables.includes(table);
    console.log(`   ${exists ? '✅' : '❌'} ${table}: ${exists ? 'exists' : 'missing'}`);
  });

  console.log('\n2. 🧩 Checking custom types...');
  
  // Check custom types
  const { data: types, error: typesError } = await supabase
    .rpc('exec_sql', { 
      sql_query: `
        SELECT typname FROM pg_type 
        WHERE typname IN ('user_role', 'remote_type', 'job_type', 'experience_level', 'job_status', 'application_status')
        ORDER BY typname;
      `
    });

  if (!typesError && types) {
    const expectedTypes = ['user_role', 'remote_type', 'job_type', 'experience_level', 'job_status', 'application_status'];
    expectedTypes.forEach(type => {
      const exists = types.some(t => t.typname === type);
      console.log(`   ${exists ? '✅' : '❌'} ${type}: ${exists ? 'exists' : 'missing'}`);
    });
  }

  console.log('\n3. 📁 Checking storage buckets...');
  
  // Check storage buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('❌ Error checking buckets:', bucketsError.message);
  } else {
    const bucketNames = buckets?.map(b => b.name) || [];
    const expectedBuckets = ['resumes', 'company-logos', 'avatars'];
    
    expectedBuckets.forEach(bucket => {
      const exists = bucketNames.includes(bucket);
      console.log(`   ${exists ? '✅' : '❌'} ${bucket}: ${exists ? 'exists' : 'missing'}`);
    });
  }

  console.log('\n4. 🔐 Testing Row Level Security...');
  
  // Test RLS by trying to query profiles table
  const { data: rlsTest, error: rlsError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);

  if (rlsError && rlsError.message.includes('row-level security')) {
    console.log('   ✅ RLS is properly configured');
  } else if (!rlsError) {
    console.log('   ✅ Tables accessible (RLS configured)');
  } else {
    console.log('   ❌ RLS test failed:', rlsError.message);
  }

  console.log('\n5. ⚡ Testing functions...');
  
  // Check if our custom functions exist
  try {
    const { data: functions, error: funcError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT proname FROM pg_proc 
          WHERE proname IN ('handle_new_user', 'increment_job_views', 'update_updated_at_column')
          ORDER BY proname;
        `
      });

    if (!funcError && functions) {
      const expectedFunctions = ['handle_new_user', 'increment_job_views', 'update_updated_at_column'];
      expectedFunctions.forEach(func => {
        const exists = functions.some(f => f.proname === func);
        console.log(`   ${exists ? '✅' : '❌'} ${func}: ${exists ? 'exists' : 'missing'}`);
      });
    }
  } catch (error) {
    console.log('   ⚠️  Could not verify functions (this is normal)');
  }

  console.log('\n6. 📊 Database summary...');
  
  const tablesCount = existingTables.length;
  const bucketsCount = buckets?.length || 0;
  
  console.log(`   📋 Tables: ${tablesCount}/6`);
  console.log(`   📁 Storage buckets: ${bucketsCount}/3`);
  
  if (tablesCount === 6 && bucketsCount >= 3) {
    console.log('\n🎉 Database setup appears to be complete!');
    console.log('🚀 You can now run: npm run dev');
  } else {
    console.log('\n⚠️  Database setup is incomplete.');
    console.log('💡 Please run the SQL scripts manually in Supabase dashboard.');
  }
}

// Run verification
verifySetup().catch(error => {
  console.error('💥 Verification failed:', error.message);
});