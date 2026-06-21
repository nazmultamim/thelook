'use client';

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { resolveRoleFromSession, ROLES } from "@/lib/auth/getRole";

// Re-exported so existing `import { ROLES } from '@/context/AuthProvider'`
// calls keep working — but the values now live in exactly one place.
export { ROLES };

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children, initialSession = null }) {
  const [supabase] = useState(() => createClient());
  const [session, setSessionState] = useState(initialSession);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);

  // Update session + role together, falling back to profiles.role when the
  // JWT claim is not present in the browser session.
  const applySession = useCallback(async (nextSession) => {
    setSessionState(nextSession);
    setLoading(true);

    if (!nextSession) {
      setRole(null);
      setLoading(false);
      return;
    }

    const resolvedRole = await resolveRoleFromSession(supabase, nextSession);
    setRole(resolvedRole);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    // onAuthStateChange fires an INITIAL_SESSION event immediately on
    // subscribe, with the current session already loaded — that IS your
    // initial load. Calling getSession()/refreshSession() separately on
    // top of this was resolving the role twice on every mount.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      void applySession(nextSession);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase, applySession]);

  // Call this right after a super_admin changes a role, so the affected
  // user's own session picks up the new claim immediately instead of
  // waiting for natural token expiry.
  const refreshRole = useCallback(async () => {
    await supabase.auth.refreshSession();
    const { data } = await supabase.auth.getSession();
    await applySession(data.session ?? null);
  }, [supabase, applySession]);

  // Hydrates the browser client with a session obtained outside of it —
  // e.g. right after the signIn server action returns. This updates the
  // SDK's internal session, persists it to cookies, AND fires
  // onAuthStateChange, which already calls applySession for us — so we
  // don't call applySession a second time here.
  const setSession = useCallback(async (newSession) => {
    if (!newSession?.access_token || !newSession?.refresh_token) {
      await supabase.auth.signOut();
      return;
    }
    await supabase.auth.setSession({
      access_token: newSession.access_token,
      refresh_token: newSession.refresh_token,
    });
  }, [supabase]);

  // ── Derived role booleans ─────────────────────────────────────────────────
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isAdmin = role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
  const isCustomer = role === ROLES.CUSTOMER;
  const isLoggedIn = !!session;

  const value = {
    // Raw
    session,
    supabase,
    loading,
    role,

    // Booleans
    isLoggedIn,
    isSuperAdmin,
    isAdmin,
    isCustomer,

    // User shorthand
    user: session?.user ?? null,

    // Hydrate the client from a server-action session, or pass null after signOut
    setSession,
    refreshRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Full auth context */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** Just the current user object */
export function useUser() {
  return useAuth().user;
}

/** Current role string: 'super_admin' | 'admin' | 'user' | null */
export function useRole() {
  return useAuth().role;
}

/** Boolean helpers */
export function useIsAdmin() {
  return useAuth().isAdmin;       // true for admin + super_admin
}

export function useIsSuperAdmin() {
  return useAuth().isSuperAdmin;  // true only for super_admin
}

export function useIsLoggedIn() {
  return useAuth().isLoggedIn;
}