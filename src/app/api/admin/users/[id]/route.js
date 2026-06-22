import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

async function requireSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'super_admin' ? user : null
}

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// PATCH { action: "ban" | "unban" }
export async function PATCH(req, { params }) {
  const caller = await requireSuperAdmin()
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  
  const { action } = await req.json()
  if (!['ban', 'unban'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const ban_duration = action === 'ban' ? '876000h' : 'none'
  const { error } = await adminClient().auth.admin.updateUserById(id, { ban_duration })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function DELETE(req, { params }) {
  const caller = await requireSuperAdmin()
  if (!caller) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { error } = await adminClient().auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}