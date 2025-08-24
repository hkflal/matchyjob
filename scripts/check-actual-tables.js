#!/usr/bin/env node

/**
 * Direct Table Check - Query actual tables using raw SQL
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Direct Database Table Check');
console.log('='.repeat(50));

async function checkTables() {
  try {
    console.log('📋 Method 1: Direct table access test...');
    
    const tableTests = [
      'profiles',
      'companies', 
      'jobs',
      'applications',
      'saved_jobs',
      'job_views'
    ];

    for (const tableName of tableTests) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`✅ ${tableName}: exists (${data?.length || 0} rows)`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ${err.message}`);
      }
    }

    console.log('\n🗄️ Method 2: Raw SQL query for tables...');
    
    try {
      const { data, error } = await supabase
        .rpc('sql', {
          query: `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('profiles', 'companies', 'jobs', 'applications', 'saved_jobs', 'job_views')
            ORDER BY table_name;
          `
        });

      if (error) {
        console.log('⚠️ Raw SQL method failed:', error.message);
      } else {
        console.log('Tables found via SQL:', data?.map(t => t.table_name) || []);
      }
    } catch (err) {
      console.log('⚠️ Raw SQL not available');
    }

    console.log('\n📁 Method 3: Storage buckets check...');
    
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.log('❌ Storage error:', error.message);
      } else {
        const bucketNames = buckets?.map(b => b.name) || [];
        console.log(`✅ Storage accessible. Buckets: ${bucketNames.join(', ')}`);
        
        // Check for our expected buckets
        const expectedBuckets = ['resumes', 'company-logos', 'avatars'];
        expectedBuckets.forEach(bucket => {
          const exists = bucketNames.includes(bucket);
          console.log(`   ${exists ? '✅' : '❌'} ${bucket}: ${exists ? 'exists' : 'missing'}`);
        });
      }
    } catch (err) {
      console.log('❌ Storage check failed:', err.message);
    }

    console.log('\n📊 Summary:');
    console.log('This will help determine what actually exists in your database.');

  } catch (error) {
    console.error('💥 Check failed:', error.message);
  }
}

checkTables();