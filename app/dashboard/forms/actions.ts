'use server'

import { createClient } from '@/lib/supabase-server'
import { getMyDealerId } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Json } from '@/src/types/supabase'

function build(path: string, params: Record<string, string>) {
  const q = new URLSearchParams(params)
  redirect(`${path}?${q.toString()}`)
}

type FieldType = 'text' | 'email' | 'tel' | 'textarea'

interface BuilderField {
  label: string
  type: FieldType
  required: boolean
}

function parseFields(raw: string): BuilderField[] | null {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    const allowed: FieldType[] = ['text', 'email', 'tel', 'textarea']
    return parsed
      .map((f): BuilderField | null => {
        if (!f || typeof f !== 'object') return null
        const label = typeof f.label === 'string' ? f.label.trim() : ''
        const type = allowed.includes(f.type) ? (f.type as FieldType) : 'text'
        const required = Boolean(f.required)
        if (!label) return null
        return { label, type, required }
      })
      .filter((f): f is BuilderField => f !== null)
  } catch {
    return null
  }
}

export async function createForm(formData: FormData) {
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')

  const name = ((formData.get('name') as string | null) ?? '').trim()
  const recipient = ((formData.get('recipient_email') as string | null) ?? '').trim()
  const fieldsRaw = ((formData.get('fields_json') as string | null) ?? '[]').trim()
  const fields = parseFields(fieldsRaw)

  const values = { name, recipient_email: recipient, fields_json: fieldsRaw }
  if (!name) return build('/dashboard/forms/new', { error: 'Nazwa wymagana', ...values })
  if (!recipient) return build('/dashboard/forms/new', { error: 'Email odbiorcy wymagany', ...values })
  if (!fields || fields.length === 0)
    return build('/dashboard/forms/new', { error: 'Dodaj co najmniej jedno pole', ...values })

  const supabase = await createClient()
  const { error } = await supabase.from('forms').insert({
    dealer_id: dealerId,
    name,
    recipient_email: recipient,
    fields_json: fields as unknown as Json,
  })
  if (error) return build('/dashboard/forms/new', { error: error.message, ...values })

  revalidatePath('/dashboard/forms')
  redirect('/dashboard/forms')
}

export async function updateForm(id: string, formData: FormData) {
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')

  const name = ((formData.get('name') as string | null) ?? '').trim()
  const recipient = ((formData.get('recipient_email') as string | null) ?? '').trim()
  const fieldsRaw = ((formData.get('fields_json') as string | null) ?? '[]').trim()
  const fields = parseFields(fieldsRaw)
  const editUrl = `/dashboard/forms/${id}/edit`

  if (!name || !recipient) return build(editUrl, { error: 'Nazwa i email odbiorcy wymagane' })
  if (!fields || fields.length === 0) return build(editUrl, { error: 'Dodaj co najmniej jedno pole' })

  const supabase = await createClient()
  const { error } = await supabase
    .from('forms')
    .update({ name, recipient_email: recipient, fields_json: fields as unknown as Json })
    .eq('id', id)
  if (error) return build(editUrl, { error: error.message })

  revalidatePath('/dashboard/forms')
  redirect('/dashboard/forms')
}

export async function deleteForm(id: string) {
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')

  const supabase = await createClient()
  const { error } = await supabase.from('forms').delete().eq('id', id)
  if (error) return build(`/dashboard/forms/${id}/edit`, { error: error.message })

  revalidatePath('/dashboard/forms')
  redirect('/dashboard/forms')
}
