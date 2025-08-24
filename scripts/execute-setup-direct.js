#!/usr/bin/env node

/**
 * Direct Database Setup Execution
 * Attempts to execute the setup using available Supabase client methods
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🚀 HK Job Pro - Direct Database Setup Execution');
console.log('='.repeat(60));

async function executeSetup() {
  try {
    console.log('📖 Reading complete setup SQL...');
    
    const setupPath = path.join(__dirname, 'complete-setup.sql');
    const setupSQL = fs.readFileSync(setupPath, 'utf8');
    
    console.log(`✅ Read ${setupSQL.split('\n').length} lines of SQL`);
    
    console.log('\n🔧 Attempting to execute SQL setup...');
    
    // Try different methods to execute the SQL
    
    // Method 1: Try using rpc if available
    try {
      console.log('Method 1: Trying RPC execution...');
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: setupSQL
      });
      
      if (!error) {
        console.log('✅ Method 1 successful!');
        return true;
      } else {
        console.log('❌ Method 1 failed:', error.message);
      }
    } catch (err) {
      console.log('❌ Method 1 not available:', err.message);
    }

    // Method 2: Try executing individual table creations
    console.log('\nMethod 2: Trying individual table creation...');
    
    // Create types first
    const createTypesSQL = `
      CREATE TYPE user_role AS ENUM ('job_seeker', 'employer', 'admin');
      CREATE TYPE remote_type AS ENUM ('onsite', 'remote', 'hybrid');
      CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'internship');
      CREATE TYPE experience_level AS ENUM ('entry', 'mid', 'senior', 'executive');
      CREATE TYPE job_status AS ENUM ('draft', 'active', 'closed', 'archived');
      CREATE TYPE application_status AS ENUM ('pending', 'reviewing', 'shortlisted', 'rejected', 'hired');
    `;

    try {
      console.log('Creating custom types...');
      const { error: typesError } = await supabase.rpc('exec_sql', {
        sql_query: createTypesSQL
      });
      
      if (typesError && !typesError.message.includes('already exists')) {
        console.log('❌ Types creation failed:', typesError.message);
      } else {
        console.log('✅ Types created/exist');
      }
    } catch (err) {
      console.log('❌ Cannot execute SQL directly via client');
    }

    console.log('\n💡 MANUAL SETUP REQUIRED');
    console.log('='.repeat(60));
    console.log('The Supabase client cannot execute DDL statements directly.');
    console.log('You need to execute the SQL setup manually:');
    console.log('');
    console.log('1. 🌐 Go to: https://supabase.com/dashboard');
    console.log('2. 📂 Select your HK Job Pro project');
    console.log('3. ⚡ Click: "SQL Editor" in sidebar');
    console.log('4. 📝 Click: "New Query"');
    console.log('5. 📋 Copy contents from: scripts/complete-setup.sql');
    console.log('6. 🏃 Click: "Run" button');
    console.log('');
    console.log('Expected result: "Success. No rows returned" or similar');
    console.log('');
    console.log('After execution, run: npm run db:verify');

  } catch (error) {
    console.error('💥 Setup execution failed:', error.message);
  }
}

executeSetup();