'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Sign Up ──────────────────────────────────────────────────────────────────
export async function signUp(formData) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: { full_name: formData.fullName }
    }
  })

  if (error) return { error: error.message }

  if (data.user) {
    await supabase
      .from('profiles')
      .update({ phone: formData.phone })
      .eq('id', data.user.id)
  }

  return { success: true }
}

// ── Sign In ──────────────────────────────────────────────────────────────────
export async function signIn(formData) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) return { error: error.message }

  // Read role from JWT claim (zero DB if hook works)
  let role = data.session?.user?.user_role

  // Fallback to DB if JWT hook not injecting role
  if (!role) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()
    role = profile?.role ?? 'customer'
  }

  // Decide redirect destination
  const next = formData.next
  let redirectTo = '/'

  if (role === 'super_admin' || role === 'admin') {
    redirectTo = next || '/admin/dashboard'
  } else {
    redirectTo = next || '/'
  }

  // Return session + redirect to client (NO server redirect())
  return {
    success: true,
    session: data.session,
    redirectTo,
  }
}

// ── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  return { success: true }
}

// ── Create Admin (super_admin only) ─────────────────────────────────────────
export async function createAdmin(formData) {
  const { createClient: createSupabase } = await import('@supabase/supabase-js')

  // Verify caller is super_admin securely from DB
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: caller } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (caller?.role !== 'super_admin') return { error: 'Unauthorized' }

  // Use service role to create user (skips email confirmation)
  const adminSupabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await adminSupabase.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: { full_name: formData.fullName }
  })

  if (error) return { error: error.message }

  if (data.user) {
    await supabase
      .from('profiles')
      .update({
        role: 'admin',
        phone: formData.phone ?? ''
      })
      .eq('id', data.user.id)
  }

  revalidatePath('/admin/users')
  return { success: true }
}

// ── Update User Role (super_admin only) ──────────────────────────────────────
export async function updateUserRole(userId, newRole) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: caller } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (caller?.role !== 'super_admin') return { error: 'Unauthorized' }

  // Never allow changing a super_admin
  const { data: target } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (target?.role === 'super_admin') {
    return { error: 'Cannot change super admin role' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}