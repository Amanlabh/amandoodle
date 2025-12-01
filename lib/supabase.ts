import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nuwkxsreqhfvvcxcopsm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51d2t4c3JlcWhmdnZjeGNvcHNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzMwNDMsImV4cCI6MjA4MDE0OTA0M30._jjVuEpzVhiMwVxnI_cZq6mrYsOC-7VjnDzfJo4IF1s'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Simple email authentication function
export const signInWithEmail = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  })
  return { data, error }
}

// Get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
