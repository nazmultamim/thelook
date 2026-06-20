/**
 * Reads user_role from the already-decoded JWT via supabase session.
 * Zero DB call when the claim is present.
 */
export function getRoleFromSession(session) {
  if (!session?.access_token) return null
  return session.user?.user_role ?? session.user?.app_metadata?.user_role ?? null
}

export async function getRoleFromProfile(supabase, userId) {
  if (!supabase || !userId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) return null
  return data?.role ?? null
}

export async function resolveRoleFromSession(supabase, session) {
  const claimedRole = getRoleFromSession(session)
  if (claimedRole) return claimedRole

  const userId = session?.user?.id
  const dbRole = await getRoleFromProfile(supabase, userId)
  return dbRole ?? 'customer'
}

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  CUSTOMER: 'customer',
}

export function isSuper(role) { return role === ROLES.SUPER_ADMIN }
export function isAdmin(role) { return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN }
export function isCustomer(role) { return role === ROLES.CUSTOMER }
