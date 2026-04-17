import { redirect } from 'next/navigation'
import { createClient } from './supabase-server'

export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function requireRole(role: 'superadmin' | 'dealer_admin') {
  const session = await getSession()
  if (!session) redirect('/login')
  const userRole = session.user.app_metadata?.role
  if (userRole !== role) redirect('/login')
  return session
}

export async function getMyDealerId(): Promise<string | null> {
  const session = await getSession()
  if (!session) return null
  return session.user.app_metadata?.dealer_id ?? null
}
