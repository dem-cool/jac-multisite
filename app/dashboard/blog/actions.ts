'use server'

import { createClient } from '@/lib/supabase-server'
import { getMyDealerId } from '@/lib/auth'
import { toSlug } from '@/lib/slug'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function buildRedirect(path: string, params: Record<string, string>) {
  const q = new URLSearchParams(params)
  redirect(`${path}?${q.toString()}`)
}

export async function createPost(formData: FormData) {
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')

  const title = ((formData.get('title') as string | null) ?? '').trim()
  const rawSlug = ((formData.get('slug') as string | null) ?? '').trim()
  const body = (formData.get('body') as string | null) ?? ''
  const coverUrl = ((formData.get('cover_url') as string | null) ?? '').trim()
  const status = formData.get('status') === 'published' ? 'published' : 'draft'
  const slug = rawSlug ? toSlug(rawSlug) : toSlug(title)

  const values = { title, slug: rawSlug, cover_url: coverUrl, status }
  if (!title) return buildRedirect('/dashboard/blog/new', { error: 'Tytuł wymagany', ...values })
  if (!slug) return buildRedirect('/dashboard/blog/new', { error: 'Slug wymagany', ...values })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .insert({
      dealer_id: dealerId,
      title,
      slug,
      body,
      cover_url: coverUrl || null,
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
    })
    .select('id')
    .single()

  if (error || !data) {
    return buildRedirect('/dashboard/blog/new', { error: error?.message ?? 'Błąd', ...values })
  }

  revalidatePath('/dashboard/blog')
  redirect('/dashboard/blog')
}

export async function updatePost(id: string, formData: FormData) {
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')

  const title = ((formData.get('title') as string | null) ?? '').trim()
  const rawSlug = ((formData.get('slug') as string | null) ?? '').trim()
  const body = (formData.get('body') as string | null) ?? ''
  const coverUrl = ((formData.get('cover_url') as string | null) ?? '').trim()
  const status = formData.get('status') === 'published' ? 'published' : 'draft'
  const slug = rawSlug ? toSlug(rawSlug) : toSlug(title)
  const editUrl = `/dashboard/blog/${id}/edit`

  if (!title || !slug) return buildRedirect(editUrl, { error: 'Tytuł i slug wymagane' })

  const supabase = await createClient()
  const { data: existing } = await supabase.from('posts').select('status, published_at').eq('id', id).single()

  const publishedAt =
    status === 'published'
      ? existing?.status === 'published' && existing.published_at
        ? existing.published_at
        : new Date().toISOString()
      : null

  const { error } = await supabase
    .from('posts')
    .update({
      title,
      slug,
      body,
      cover_url: coverUrl || null,
      status,
      published_at: publishedAt,
    })
    .eq('id', id)

  if (error) return buildRedirect(editUrl, { error: error.message })

  revalidatePath('/dashboard/blog')
  redirect('/dashboard/blog')
}

export async function deletePost(id: string) {
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')

  const supabase = await createClient()
  const { error } = await supabase.from('posts').delete().eq('id', id)

  if (error) return buildRedirect(`/dashboard/blog/${id}/edit`, { error: error.message })

  revalidatePath('/dashboard/blog')
  redirect('/dashboard/blog')
}
