import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from './supabase-server'

type Role = 'superadmin' | 'dealer_admin'

export async function getUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireRole(roles: Role[]): Promise<User> {
  const user = await getUser()
  if (!user) redirect('/login')
  const userRole = user.app_metadata?.role as Role | undefined
  if (!userRole || (userRole !== 'superadmin' && !roles.includes(userRole))) redirect('/login')
  return user
}

export async function getMyDealerId(): Promise<string | null> {
  const user = await getUser()
  if (!user) return null
  return user.app_metadata?.dealer_id ?? null
}
