'use client';

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { resolveRoleFromSession } from "@/lib/auth/getRole";

// ── Constants ─────────────────────────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  CUSTOMER: 'customer',
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children, initialSession = null }) {
  const [supabase] = useState(() => createClient());
  const [session, setSession]   = useState(initialSession);
  const [role, setRole]         = useState(null);
  const [loading, setLoading]   = useState(false);

  // Update session + role together, falling back to profiles.role when the
  // JWT claim is not present in the browser session.
  const applySession = useCallback(async (nextSession) => {
    setSession(nextSession);
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

    const init = async () => {
      // refreshSession() ensures token is fresh + triggers hook to re-inject role
      await supabase.auth.refreshSession();
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      await applySession(data.session ?? null);
    };

    init();

    // Listen for sign-in / sign-out / token refresh
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      void applySession(nextSession);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase, applySession]);

  // ── Derived role booleans ─────────────────────────────────────────────────
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isAdmin      = role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
  const isCustomer   = role === ROLES.CUSTOMER;
  const isLoggedIn   = !!session;

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

    // Manual session update (e.g. after signOut)
    setSession: applySession,
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

/** Current role string: 'super_admin' | 'admin' | 'customer' | null */
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
