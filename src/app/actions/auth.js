'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { getRoleFromClaims, getRoleFromProfile, ROLES } from '@/lib/auth/getRole'

// ── Service role client (bypasses RLS) ───────────────────────────────────────
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// ── Verify caller is super_admin ─────────────────────────────────────────────
// Uses the session-bound client to read the CALLER'S OWN profile.
// "view own profile" RLS always allows this — no JWT claim needed.
async function verifySuperAdmin(supabase) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === ROLES.SUPER_ADMIN ? user : null
}

// ── Sign Up ───────────────────────────────────────────────────────────────────
export async function signUp(formData) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: { full_name: formData.fullName, phone: formData.phone }
    }
  })

  if (error) return { error: error.message }

  if (data.user?.identities?.length === 0) {
    return { error: 'An account with this email already exists.' }
  }

  return { success: true }
}

// ── Sign In ───────────────────────────────────────────────────────────────────
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
      ? next || '/admin/dashboard/overview'
      : next || '/'

  return { success: true, session: data.session, redirectTo }
}

// ── Sign Out ──────────────────────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  return { success: true }
}

// ── Update User Role (super_admin only) ───────────────────────────────────────
export async function updateUserRole(userId, newRole) {
  const ALLOWED = [ROLES.CUSTOMER, ROLES.ADMIN]
  if (!ALLOWED.includes(newRole)) {
    return { error: 'Invalid role' }
  }

  const supabase = await createClient()
  const caller = await verifySuperAdmin(supabase)
  if (!caller) return { error: 'Unauthorized' }

  const service = getServiceClient()

  const { data: target } = await service
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (!target) return { error: 'User not found' }
  if (target.role === ROLES.SUPER_ADMIN) {
    return { error: 'Cannot change a super admin role' }
  }

  const { data: updated, error } = await service
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)
    .select()

  if (error) return { error: error.message }
  if (!updated?.length) return { error: 'Update failed' }

  revalidatePath('/admin/customers')
  return { success: true }
}

// ── Create User (super_admin only) ────────────────────────────────────────────
export async function createAdmin(formData) {
  const supabase = await createClient()
  const caller = await verifySuperAdmin(supabase)
  if (!caller) return { error: 'Unauthorized' }

  const targetRole = formData.role === ROLES.ADMIN ? ROLES.ADMIN : ROLES.CUSTOMER
  const service = getServiceClient()

  const { data, error } = await service.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: { full_name: formData.fullName, phone: formData.phone }
  })

  if (error) return { error: error.message }

  if (data.user) {
    const { error: updateError } = await service
      .from('profiles')
      .update({ role: targetRole })
      .eq('id', data.user.id)

    if (updateError) return { error: updateError.message }
  }

  revalidatePath('/admin/customers')
  return { success: true }
}