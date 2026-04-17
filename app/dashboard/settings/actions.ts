'use server'

import { createClient } from '@/lib/supabase-server'
import { getMyDealerId } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Json } from '@/src/types/supabase'

function build(params: Record<string, string>) {
  const q = new URLSearchParams(params)
  redirect(`/dashboard/settings?${q.toString()}`)
}

export async function updateSettings(formData: FormData) {
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')

  const contact = {
    email: ((formData.get('contact_email') as string | null) ?? '').trim(),
    phone: ((formData.get('contact_phone') as string | null) ?? '').trim(),
    address: ((formData.get('contact_address') as string | null) ?? '').trim(),
  }
  const footer = {
    email: ((formData.get('footer_email') as string | null) ?? '').trim(),
    phone: ((formData.get('footer_phone') as string | null) ?? '').trim(),
    address: ((formData.get('footer_address') as string | null) ?? '').trim(),
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('dealers')
    .update({
      contact_json: contact as unknown as Json,
      footer_json: footer as unknown as Json,
    })
    .eq('id', dealerId)

  if (error) return build({ error: error.message })

  revalidatePath('/dashboard/settings')
  build({ saved: '1' })
}
