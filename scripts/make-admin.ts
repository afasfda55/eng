import { createClient } from '@supabase/supabase-js'

// Replace these with your Supabase project URL and service_role key (not anon key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY! // This should be the service_role key

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function makeUserAdmin(email: string) {
  try {
    const { data, error } = await supabase
      .from('auth.users')
      .update({ is_admin: true })
      .eq('email', email)
      .select()

    if (error) throw error
    console.log('Successfully made user admin:', data)
  } catch (error) {
    console.error('Error making user admin:', error)
  }
}

// Replace with the email you want to make admin
const emailToMakeAdmin = 'your-email@example.com'
makeUserAdmin(emailToMakeAdmin) 