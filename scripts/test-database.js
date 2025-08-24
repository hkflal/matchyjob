/**
 * Test Database Setup
 * Run this after executing all SQL scripts to verify everything is working
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testDatabase() {
  console.log('🧪 Testing HK Job Pro database setup...')

  try {
    // Test 1: Check if tables exist
    console.log('\n1. 📋 Checking if tables exist...')
    
    const tables = ['profiles', 'companies', 'jobs', 'applications', 'saved_jobs', 'job_views']
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`)
      } else {
        console.log(`   ✅ ${table}: Table exists`)
      }
    }

    // Test 2: Check storage buckets
    console.log('\n2. 📁 Checking storage buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.log(`   ❌ Storage error: ${bucketsError.message}`)
    } else {
      const expectedBuckets = ['resumes', 'company-logos', 'avatars']
      expectedBuckets.forEach(bucketName => {
        const exists = buckets.find(b => b.name === bucketName)
        if (exists) {
          console.log(`   ✅ ${bucketName}: Bucket exists (public: ${exists.public})`)
        } else {
          console.log(`   ❌ ${bucketName}: Bucket missing`)
        }
      })
    }

    // Test 3: Test authentication and profile creation
    console.log('\n3. 🔐 Testing authentication and profile creation...')
    
    const testEmail = `test-${Date.now()}@hkjobpro.com`
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
      console.log(`   ❌ Auth creation failed: ${authError.message}`)
    } else {
      console.log(`   ✅ User created: ${authData.user.id}`)
      
      // Check if profile was auto-created by trigger
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for trigger
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()
      
      if (profileError) {
        console.log(`   ❌ Profile auto-creation failed: ${profileError.message}`)
      } else {
        console.log(`   ✅ Profile auto-created: ${profileData.full_name} (${profileData.role})`)
      }
      
      // Clean up test user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id)
      if (!deleteError) {
        console.log(`   🧹 Test user cleaned up`)
      }
    }

    console.log('\n🎉 Database test completed!')
    console.log('\n📱 Your application is ready! Run: npm run dev')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testDatabase().then(() => {
  process.exit(0)
}).catch((error) => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})