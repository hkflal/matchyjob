/**
 * Development Helper: Manually Confirm User Email
 * Use this to confirm user emails during development
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function confirmUser() {
  const email = process.argv[2]
  
  if (!email) {
    console.error('❌ Please provide an email address')
    console.log('Usage: node scripts/confirm-user.js user@example.com')
    process.exit(1)
  }

  try {
    console.log(`🔍 Looking for user: ${email}`)
    
    // Get user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Failed to list users:', listError.message)
      return
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      console.error('❌ User not found')
      return
    }

    if (user.email_confirmed_at) {
      console.log('✅ User email is already confirmed')
      return
    }

    // Manually confirm the user
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true
    })

    if (error) {
      console.error('❌ Failed to confirm user:', error.message)
      return
    }

    console.log('✅ User email confirmed successfully!')
    console.log(`   User ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log('🎉 User can now log in!')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

confirmUser().then(() => {
  process.exit(0)
}).catch((error) => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})