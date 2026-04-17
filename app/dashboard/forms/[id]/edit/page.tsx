import { createClient } from '@/lib/supabase-server'
import { getMyDealerId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import FormFormFields from '../../FormFields'
import { updateForm, deleteForm } from '../../actions'
import DeleteButton from '@/components/admin/DeleteButton'
import type { BuilderField, FieldType } from '../../FieldsBuilder'
import type { Json } from '@/src/types/supabase'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function s(v: string | string[] | undefined) {
  return typeof v === 'string' ? v : ''
}

function parseStoredFields(raw: Json | null): BuilderField[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((p): BuilderField | null => {
      if (!p || typeof p !== 'object' || Array.isArray(p)) return null
      const obj = p as Record<string, Json | undefined>
      const label = typeof obj.label === 'string' ? obj.label : ''
      const typeVal = String(obj.type ?? 'text')
      const type = (['text', 'email', 'tel', 'textarea'].includes(typeVal) ? typeVal : 'text') as FieldType
      return { label, type, required: Boolean(obj.required) }
    })
    .filter((x): x is BuilderField => x !== null)
}

export default async function EditFormPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const sp = await searchParams
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')

  const supabase = await createClient()
  const { data: form } = await supabase
    .from('forms')
    .select('id, name, recipient_email, fields_json, dealer_id')
    .eq('id', id)
    .single()

  if (!form || form.dealer_id !== dealerId) redirect('/dashboard/forms')

  const update = updateForm.bind(null, id)
  const del = deleteForm.bind(null, id)

  return (
    <main className="max-w-3xl">
      <div className="mb-6">
        <Link href="/dashboard/forms" className="text-sm text-neutral-500 hover:underline">
          &larr; Powrót
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Edytuj formularz</h1>
      {s(sp.error) && (
        <div className="mb-5 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300">
          {s(sp.error)}
        </div>
      )}
      <form action={update} className="space-y-5">
        <FormFormFields
          defaults={{
            name: form.name,
            recipient_email: form.recipient_email,
            fields: parseStoredFields(form.fields_json),
          }}
        />
        <button
          type="submit"
          className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Zapisz
        </button>
      </form>
      <div className="mt-10 border-t border-neutral-200 pt-8 dark:border-neutral-700">
        <DeleteButton action={del} label="Usuń formularz" confirmMessage="Usunąć formularz?" />
      </div>
    </main>
  )
}
