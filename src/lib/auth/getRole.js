export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  CUSTOMER: 'user', // matches the DB enum value — DB says 'user', not 'customer'
}

/**
 * Reads user_role from the verified JWT claims via getClaims().
 * Zero DB call once the access-token hook is confirmed working.
 */
export async function getRoleFromClaims(supabase) {
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) return null
  return data.claims.user_role ?? null
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
  if (!session) return null

  const claimedRole = await getRoleFromClaims(supabase)
  if (claimedRole) return claimedRole

  const userId = session?.user?.id
  const dbRole = await getRoleFromProfile(supabase, userId)
  return dbRole ?? ROLES.CUSTOMER
}

export function isSuper(role) { return role === ROLES.SUPER_ADMIN }
export function isAdmin(role) { return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN }
export function isCustomer(role) { return role === ROLES.CUSTOMER }