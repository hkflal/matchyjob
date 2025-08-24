#!/usr/bin/env node

/**
 * HK Job Pro - Debug Database State
 * This script checks what actually exists in the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 HK Job Pro - Database Debug Analysis');
console.log('=' .repeat(50));

async function debugDatabase() {
  try {
    console.log('\n1. 🔗 Testing basic connection...');
    
    // Test basic connection with a simple query
    const { data: versionData, error: versionError } = await supabase
      .rpc('version');
    
    if (versionError) {
      console.log('❌ Connection test failed:', versionError.message);
    } else {
      console.log('✅ Database connection successful');
    }

    console.log('\n2. 📊 Checking information schema...');
    
    // Check what schemas exist
    const { data: schemas, error: schemaError } = await supabase
      .rpc('exec_sql', {
        sql_query: 'SELECT schema_name FROM information_schema.schemata ORDER BY schema_name;'
      });

    if (!schemaError && schemas) {
      console.log('✅ Available schemas:');
      schemas.forEach(schema => console.log(`   - ${schema.schema_name}`));
    } else {
      console.log('❌ Could not list schemas:', schemaError?.message);
    }

    console.log('\n3. 🏷️  Checking custom types...');
    
    // Check if our custom types exist
    const { data: types, error: typesError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT typname, typtype
          FROM pg_type 
          WHERE typname IN ('user_role', 'remote_type', 'job_type', 'experience_level', 'job_status', 'application_status')
          ORDER BY typname;
        `
      });

    if (!typesError && types && types.length > 0) {
      console.log('✅ Custom types found:');
      types.forEach(type => console.log(`   - ${type.typname} (${type.typtype})`));
    } else {
      console.log('❌ No custom types found');
      if (typesError) console.log('   Error:', typesError.message);
    }

    console.log('\n4. 📋 Checking tables in public schema...');
    
    // Check tables in public schema
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT table_name, table_type
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        `
      });

    if (!tablesError && tables && tables.length > 0) {
      console.log('✅ Tables in public schema:');
      tables.forEach(table => console.log(`   - ${table.table_name} (${table.table_type})`));
    } else {
      console.log('❌ No tables found in public schema');
      if (tablesError) console.log('   Error:', tablesError.message);
    }

    console.log('\n5. 🗂️  Checking all tables (any schema)...');
    
    // Check all tables regardless of schema
    const { data: allTables, error: allTablesError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT table_schema, table_name, table_type
          FROM information_schema.tables 
          WHERE table_type = 'BASE TABLE'
          AND table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
          ORDER BY table_schema, table_name;
        `
      });

    if (!allTablesError && allTables && allTables.length > 0) {
      console.log('✅ All tables found:');
      allTables.forEach(table => console.log(`   - ${table.table_schema}.${table.table_name}`));
    } else {
      console.log('❌ No tables found in database');
      if (allTablesError) console.log('   Error:', allTablesError.message);
    }

    console.log('\n6. 🔧 Checking functions...');
    
    // Check functions
    const { data: functions, error: functionsError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT routine_name, routine_type
          FROM information_schema.routines
          WHERE routine_schema = 'public'
          AND routine_name IN ('handle_new_user', 'increment_job_views', 'update_updated_at_column')
          ORDER BY routine_name;
        `
      });

    if (!functionsError && functions && functions.length > 0) {
      console.log('✅ Custom functions found:');
      functions.forEach(func => console.log(`   - ${func.routine_name} (${func.routine_type})`));
    } else {
      console.log('❌ No custom functions found');
      if (functionsError) console.log('   Error:', functionsError.message);
    }

    console.log('\n7. 📁 Checking storage buckets...');
    
    // Check storage buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (!bucketsError && buckets && buckets.length > 0) {
      console.log('✅ Storage buckets found:');
      buckets.forEach(bucket => console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`));
    } else {
      console.log('❌ No storage buckets found');
      if (bucketsError) console.log('   Error:', bucketsError.message);
    }

    console.log('\n8. 🔍 Checking recent SQL execution history...');
    
    // Check if we can see any evidence of our SQL execution
    const { data: extensions, error: extensionsError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT extname, extversion
          FROM pg_extension
          WHERE extname IN ('uuid-ossp', 'pgcrypto')
          ORDER BY extname;
        `
      });

    if (!extensionsError && extensions) {
      console.log('✅ PostgreSQL extensions:');
      extensions.forEach(ext => console.log(`   - ${ext.extname} v${ext.extversion}`));
    }

  } catch (error) {
    console.error('💥 Debug failed:', error.message);
  }
}

// Run debug analysis
debugDatabase().then(() => {
  console.log('\n' + '='.repeat(50));
  console.log('🏁 Database debug analysis complete');
  console.log('\n💡 If no tables were found, the SQL may not have executed properly.');
  console.log('💡 Try executing the SQL in smaller chunks or check for syntax errors.');
}).catch(error => {
  console.error('💥 Fatal error:', error.message);
});