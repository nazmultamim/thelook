import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const AUTH_ROUTES = ['/sign-in', '/sign-up']
const ADMIN_ROUTES = ['/admin']
const ACCOUNT_ROUTES = ['/account']

export async function proxy(request) {
  let response = NextResponse.next({ request })
  const path = request.nextUrl.pathname

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options))
        },
      },
    }
  )

  // getClaims() verifies the JWT and returns the decoded payload, including
  // the custom user_role claim your access-token hook injects.
  // getUser() does NOT expose custom claims — only the raw user record.
  const { data, error } = await supabase.auth.getClaims()
  const claims = data?.claims
  const isLoggedIn = !!claims && !error

  // ── auth pages — bounce logged-in users ──────────────────────────────
  if (AUTH_ROUTES.some(r => path === r)) {
    if (isLoggedIn) return NextResponse.redirect(new URL('/', request.url))
    return response
  }

  // ── account pages — must be logged in ────────────────────────────────
  if (ACCOUNT_ROUTES.some(r => path.startsWith(r))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/sign-in?next=${path}`, request.url))
    }
    return response
  }

  // ── admin pages — must be logged in + correct role ───────────────────
  if (ADMIN_ROUTES.some(r => path.startsWith(r))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/sign-in?next=${path}`, request.url))
    }

    const jwtRole = claims.user_role

    if (jwtRole === 'admin' || jwtRole === 'super_admin') {
      return response // JWT confirms admin — genuinely zero DB hits now
    }

    // Hook not enabled yet, or claim missing — fall back to a DB read
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', claims.sub)
      .single()

    const dbRole = profile?.role
    if (dbRole === 'admin' || dbRole === 'super_admin') {
      return response
    }

    return NextResponse.redirect(new URL('/?error=unauthorized', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/sign-in',
    '/sign-up',
  ],
}