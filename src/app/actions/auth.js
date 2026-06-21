'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getRoleFromClaims, getRoleFromProfile, ROLES } from '@/lib/auth/getRole'

// ── Sign Up ──────────────────────────────────────────────────────────────────
export async function signUp(formData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: { full_name: formData.fullName, phone: formData.phone }
    }
  })

  if (error) return { error: error.message }

  // phone is captured by the handle_new_user trigger from the metadata above.
  // No follow-up query needed — and one wouldn't reliably work anyway, since
  // there's no session yet if email confirmation is required.
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

  const claimedRole = await getRoleFromClaims(supabase)
  const role = claimedRole ?? (await getRoleFromProfile(supabase, data.user.id)) ?? ROLES.CUSTOMER

  const next = formData.next
  const redirectTo =
    role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN
      ? next || '/admin/dashboard'
      : next || '/'

  // Cookies are already set server-side by signInWithPassword above. We still
  // return the session so the client can call supabase.auth.setSession() and
  // sync the browser client's in-memory state immediately, without waiting
  // for a full page reload.
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

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: caller } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (caller?.role !== ROLES.SUPER_ADMIN) return { error: 'Unauthorized' }

  // Service role is required here ONLY because auth.admin.createUser() has
  // no other entry point — it's not a general-purpose RLS bypass.
  const adminSupabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await adminSupabase.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: { full_name: formData.fullName, phone: formData.phone ?? '' }
  })

  if (error) return { error: error.message }

  if (data.user) {
    // Back to the caller's own session-bound client for this write — the
    // RLS policy now checks the DB directly, so this is safe and correct.
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: ROLES.ADMIN })
      .eq('id', data.user.id)

    if (updateError) return { error: updateError.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

// ── Update User Role (super_admin only) ──────────────────────────────────────
export async function updateUserRole(userId, newRole) {
  const ALLOWED_TARGET_ROLES = [ROLES.CUSTOMER, ROLES.ADMIN]
  if (!ALLOWED_TARGET_ROLES.includes(newRole)) {
    return { error: 'Invalid role — use a dedicated flow to grant super_admin' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: caller } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (caller?.role !== ROLES.SUPER_ADMIN) return { error: 'Unauthorized' }

  const { data: target } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (!target) return { error: 'User not found' }
  if (target.role === ROLES.SUPER_ADMIN) {
    return { error: 'Cannot change a super admin role' }
  }

  const { data: updated, error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)
    .select()

  if (error) return { error: error.message }
  if (!updated || updated.length === 0) {
    return { error: 'Update failed — no matching profile was updated' }
  }

  revalidatePath('/admin/users')
  return { success: true }
}