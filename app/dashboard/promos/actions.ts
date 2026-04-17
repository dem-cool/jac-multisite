'use server'

import { createClient } from '@/lib/supabase-server'
import { getMyDealerId } from '@/lib/auth'
import { toSlug } from '@/lib/slug'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function build(path: string, params: Record<string, string>) {
  const q = new URLSearchParams(params)
  redirect(`${path}?${q.toString()}`)
}

export async function createPromo(formData: FormData) {
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')

  const title = ((formData.get('title') as string | null) ?? '').trim()
  const rawSlug = ((formData.get('slug') as string | null) ?? '').trim()
  const body = (formData.get('body') as string | null) ?? ''
  const heroUrl = ((formData.get('hero_url') as string | null) ?? '').trim()
  const active = formData.get('active') === 'on' || formData.get('active') === 'true'
  const slug = rawSlug ? toSlug(rawSlug) : toSlug(title)

  const values = { title, slug: rawSlug, hero_url: heroUrl, active: active ? 'true' : 'false' }
  if (!title || !slug) return build('/dashboard/promos/new', { error: 'Tytuł i slug wymagane', ...values })

  const supabase = await createClient()
  const { error } = await supabase.from('promos').insert({
    dealer_id: dealerId,
    title,
    slug,
    body,
    hero_url: heroUrl || null,
    active,
  })
  if (error) return build('/dashboard/promos/new', { error: error.message, ...values })

  revalidatePath('/dashboard/promos')
  redirect('/dashboard/promos')
}

export async function updatePromo(id: string, formData: FormData) {
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')

  const title = ((formData.get('title') as string | null) ?? '').trim()
  const rawSlug = ((formData.get('slug') as string | null) ?? '').trim()
  const body = (formData.get('body') as string | null) ?? ''
  const heroUrl = ((formData.get('hero_url') as string | null) ?? '').trim()
  const active = formData.get('active') === 'on' || formData.get('active') === 'true'
  const slug = rawSlug ? toSlug(rawSlug) : toSlug(title)
  const editUrl = `/dashboard/promos/${id}/edit`

  if (!title || !slug) return build(editUrl, { error: 'Tytuł i slug wymagane' })

  const supabase = await createClient()
  const { error } = await supabase
    .from('promos')
    .update({ title, slug, body, hero_url: heroUrl || null, active })
    .eq('id', id)

  if (error) return build(editUrl, { error: error.message })

  revalidatePath('/dashboard/promos')
  redirect('/dashboard/promos')
}

export async function deletePromo(id: string) {
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')

  const supabase = await createClient()
  const { error } = await supabase.from('promos').delete().eq('id', id)
  if (error) return build(`/dashboard/promos/${id}/edit`, { error: error.message })

  revalidatePath('/dashboard/promos')
  redirect('/dashboard/promos')
}
