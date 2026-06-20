import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Routes that need zero middleware (public)
const PUBLIC_ROUTES = ['/', '/products', '/category', '/about', '/contact']
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

  // ── 1. Verify identity (Auth server — not DB) ──────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  // ── 2. Auth pages — bounce logged-in users ─────────────────────────────
  if (AUTH_ROUTES.some(r => path === r)) {
    if (isLoggedIn) return NextResponse.redirect(new URL('/', request.url))
    return response
  }

  // ── 3. Account pages — must be logged in ──────────────────────────────
  if (ACCOUNT_ROUTES.some(r => path.startsWith(r))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/sign-in?next=${path}`, request.url))
    }
    return response
  }

  // ── 4. Admin pages — must be logged in + correct role ─────────────────
  if (ADMIN_ROUTES.some(r => path.startsWith(r))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/sign-in?next=${path}`, request.url))
    }

    // Read role from JWT first (zero DB if hook works)
    const jwtRole = user?.user_role

    if (jwtRole === 'admin' || jwtRole === 'super_admin') {
      return response // JWT confirms admin — no DB needed
    }

    // JWT hook not working — fallback to DB (only hits if JWT missing role)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
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
  ]
}