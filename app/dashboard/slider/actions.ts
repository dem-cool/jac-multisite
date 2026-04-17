'use server'

import { createClient } from '@/lib/supabase-server'
import { getMyDealerId } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function build(path: string, params: Record<string, string>) {
  const q = new URLSearchParams(params)
  redirect(`${path}?${q.toString()}`)
}

export async function createSlide(formData: FormData) {
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')

  const imageUrl = ((formData.get('image_url') as string | null) ?? '').trim()
  const headline = ((formData.get('headline') as string | null) ?? '').trim()
  const link = ((formData.get('link') as string | null) ?? '').trim()

  if (!imageUrl) return build('/dashboard/slider/new', { error: 'Obraz jest wymagany', headline, link })

  const supabase = await createClient()
  const { data: last } = await supabase
    .from('carousel_slides')
    .select('sort_order')
    .eq('dealer_id', dealerId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const nextOrder = (last?.sort_order ?? -1) + 1

  const { error } = await supabase.from('carousel_slides').insert({
    dealer_id: dealerId,
    image_url: imageUrl,
    headline: headline || null,
    link: link || null,
    sort_order: nextOrder,
  })
  if (error) return build('/dashboard/slider/new', { error: error.message, headline, link })

  revalidatePath('/dashboard/slider')
  redirect('/dashboard/slider')
}

export async function updateSlide(id: string, formData: FormData) {
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')

  const imageUrl = ((formData.get('image_url') as string | null) ?? '').trim()
  const headline = ((formData.get('headline') as string | null) ?? '').trim()
  const link = ((formData.get('link') as string | null) ?? '').trim()

  if (!imageUrl) return build(`/dashboard/slider/${id}/edit`, { error: 'Obraz jest wymagany' })

  const supabase = await createClient()
  const { error } = await supabase
    .from('carousel_slides')
    .update({ image_url: imageUrl, headline: headline || null, link: link || null })
    .eq('id', id)

  if (error) return build(`/dashboard/slider/${id}/edit`, { error: error.message })

  revalidatePath('/dashboard/slider')
  redirect('/dashboard/slider')
}

export async function deleteSlide(id: string) {
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')

  const supabase = await createClient()
  const { error } = await supabase.from('carousel_slides').delete().eq('id', id)
  if (error) return build(`/dashboard/slider/${id}/edit`, { error: error.message })

  revalidatePath('/dashboard/slider')
  redirect('/dashboard/slider')
}

export async function reorderSlides(orderedIds: string[]) {
  const dealerId = await getMyDealerId()
  if (!dealerId) return { ok: false, error: 'Unauthorized' }

  const supabase = await createClient()
  const updates = orderedIds.map((id, index) =>
    supabase.from('carousel_slides').update({ sort_order: index }).eq('id', id).eq('dealer_id', dealerId),
  )
  const results = await Promise.all(updates)
  const firstErr = results.find((r) => r.error)
  if (firstErr?.error) return { ok: false, error: firstErr.error.message }

  revalidatePath('/dashboard/slider')
  return { ok: true }
}
