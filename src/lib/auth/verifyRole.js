import { createClient } from '@/lib/supabase/server'

/**
 * Used in server actions/pages where security matters.
 * getUser() = verified by Supabase Auth server (not cookie-faked)
 * Role from DB = cannot be tampered by user
 */
export async function getVerifiedUser() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { user: null, profile: null, supabase }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role')
    .eq('id', user.id)
    .single()

  return { user, profile, supabase }
}

export async function requireAdmin() {
  const { user, profile, supabase } = await getVerifiedUser()
  if (!user || !profile) return null
  if (profile.role !== 'admin' && profile.role !== 'super_admin') return null
  return { user, profile, supabase }
}

export async function requireSuperAdmin() {
  const { user, profile, supabase } = await getVerifiedUser()
  if (!user || !profile) return null
  if (profile.role !== 'super_admin') return null
  return { user, profile, supabase }
}