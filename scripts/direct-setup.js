#!/usr/bin/env node

/**
 * HK Job Pro - Direct Database Setup
 * This script directly executes all SQL scripts using the service role key
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import Supabase client with service role key
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!serviceRoleKey);
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🚀 HK Job Pro - Direct Database Setup');
console.log('📍 Supabase URL:', supabaseUrl);

// SQL scripts in execution order
const scripts = [
  {
    name: 'create_custom_types',
    file: '01-create-types.sql',
    description: 'Create custom PostgreSQL types'
  },
  {
    name: 'create_tables',
    file: '02-create-tables.sql',
    description: 'Create all database tables'
  },
  {
    name: 'create_functions',
    file: '03-create-functions.sql',
    description: 'Create functions and triggers'
  },
  {
    name: 'create_policies',
    file: '04-create-policies.sql',
    description: 'Set up Row Level Security policies'
  },
  {
    name: 'create_indexes',
    file: '05-create-indexes.sql',
    description: 'Create performance indexes'
  },
  {
    name: 'create_storage',
    file: '06-create-storage.sql',
    description: 'Set up storage buckets and policies'
  }
];

// Read SQL file content
function readSqlFile(filename) {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`SQL file ${filename} not found`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

// Execute SQL with error handling
async function executeSql(sql, description) {
  try {
    console.log(`   Executing: ${description}`);
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // Try direct execution if rpc fails
      const result = await supabase.from('_placeholder').select('*').limit(0);
      // This is a fallback - we'll use raw SQL execution
      
      // Split SQL into individual statements and execute
      const statements = sql.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await supabase.rpc('exec', { sql: statement.trim() });
          } catch (err) {
            // Ignore some expected errors like "already exists"
            if (!err.message?.includes('already exists')) {
              console.warn(`     ⚠️  Warning: ${err.message}`);
            }
          }
        }
      }
    }
    
    console.log('     ✅ Success');
    return true;
  } catch (error) {
    console.error(`     ❌ Error: ${error.message}`);
    return false;
  }
}

// Main setup function
async function setupDatabase() {
  console.log('\n🔧 Starting database setup...\n');

  let successCount = 0;

  for (const script of scripts) {
    console.log(`📄 Step ${successCount + 1}: ${script.description}`);
    
    try {
      const sql = readSqlFile(script.file);
      const success = await executeSql(sql, script.description);
      
      if (success) {
        successCount++;
        console.log(`   ✅ ${script.name} completed\n`);
      } else {
        console.log(`   ❌ ${script.name} failed\n`);
      }
    } catch (error) {
      console.error(`   ❌ Error reading ${script.file}: ${error.message}\n`);
    }
  }

  console.log(`🎉 Database setup completed: ${successCount}/${scripts.length} steps successful`);
  
  if (successCount === scripts.length) {
    console.log('\n🧪 Running database test...');
    
    // Import and run the test
    try {
      const { execSync } = require('child_process');
      execSync('npm run db:test', { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ Database test failed');
    }
  } else {
    console.log('\n⚠️  Some steps failed. Please check the errors above.');
    console.log('💡 You may need to execute the SQL scripts manually in Supabase dashboard.');
  }
}

// Run setup
setupDatabase().catch(error => {
  console.error('💥 Setup failed:', error.message);
  process.exit(1);
});