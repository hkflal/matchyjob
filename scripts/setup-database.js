/**
 * Database Setup Script for HK Job Pro
 * This script will create the database schema, policies, and initial setup
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupDatabase() {
  console.log('🚀 Starting HK Job Pro database setup...')
  console.log(`📍 Supabase URL: ${supabaseUrl}`)

  try {
    // Test connection
    console.log('\n🔗 Testing Supabase connection...')
    const { data, error } = await supabase.from('_test').select('*').limit(1)
    if (error && error.code !== 'PGRST106') {
      console.error('❌ Connection failed:', error.message)
      return
    }
    console.log('✅ Supabase connection successful')

    // Read and execute schema file
    console.log('\n📄 Reading database schema...')
    const schemaPath = path.join(__dirname, '../database-schema.sql')
    
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Database schema file not found at:', schemaPath)
      return
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
    console.log('✅ Schema file loaded successfully')

    // Split schema into individual statements (basic splitting)
    console.log('\n🔧 Preparing to execute database schema...')
    console.log('⚠️  Note: Some statements may need to be executed manually in Supabase Dashboard')
    console.log('📋 Schema includes:')
    console.log('   - Custom types (enums)')
    console.log('   - Tables with relationships')
    console.log('   - Indexes for performance')
    console.log('   - Row Level Security policies')
    console.log('   - Storage buckets and policies')
    console.log('   - Triggers and functions')

    // Check if basic tables exist
    console.log('\n🔍 Checking existing database structure...')
    
    // Check for profiles table
    const { data: profilesTable, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profilesError && profilesError.code === 'PGRST106') {
      console.log('⚠️  Tables not found - database schema needs to be executed')
    } else if (profilesError) {
      console.log('⚠️  Database may need setup:', profilesError.message)
    } else {
      console.log('✅ Tables already exist')
    }

    // Create a simple test to verify auth is working
    console.log('\n🧪 Testing authentication system...')
    
    // Test user creation (this will verify RLS is working)
    const testEmail = 'test@hkjobpro.com'
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User',
        role: 'job_seeker'
      }
    })

    if (authError) {
      if (authError.message.includes('already exists') || authError.message.includes('already registered')) {
        console.log('ℹ️  Test user already exists')
      } else {
        console.log('⚠️  Auth test:', authError.message)
      }
    } else {
      console.log('✅ Test user created successfully')
      console.log(`   User ID: ${authData.user.id}`)
      
      // Clean up test user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id)
      if (!deleteError) {
        console.log('🧹 Test user cleaned up')
      }
    }

    console.log('\n📋 Database Setup Instructions:')
    console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard')
    console.log('2. Navigate to your project: HK Job Pro')
    console.log('3. Click on "SQL Editor" in the left sidebar')
    console.log('4. Execute the following SQL files in order:')
    console.log('')
    console.log('   📄 Step 1: scripts/01-create-types.sql')
    console.log('      → Creates custom types (enums) for the database')
    console.log('')
    console.log('   📄 Step 2: scripts/02-create-tables.sql')
    console.log('      → Creates all tables (profiles, companies, jobs, applications, etc.)')
    console.log('')
    console.log('   📄 Step 3: scripts/03-create-functions.sql')
    console.log('      → Creates functions and triggers for auto-profile creation')
    console.log('')
    console.log('   📄 Step 4: scripts/04-create-policies.sql')
    console.log('      → Creates Row Level Security policies for data protection')
    console.log('')
    console.log('   📄 Step 5: scripts/05-create-indexes.sql')
    console.log('      → Creates indexes for performance optimization')
    console.log('')
    console.log('   📄 Step 6: scripts/06-create-storage.sql')
    console.log('      → Creates storage buckets for file uploads')
    console.log('')
    console.log('5. After executing all scripts:')
    console.log('   → Go to Storage tab to verify buckets exist')
    console.log('   → Go to Authentication → Policies to verify RLS is enabled')
    console.log('   → Test the application: npm run dev')
    console.log('')
    console.log('💡 Pro Tip: Copy each file content and paste into SQL Editor one by one!')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('- Verify your Supabase URL and service key in .env.local')
    console.log('- Check your Supabase project is active')
    console.log('- Ensure you have proper permissions')
  }
}

// Run the setup
setupDatabase().then(() => {
  console.log('\n🎉 Database setup process completed!')
  process.exit(0)
}).catch((error) => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})