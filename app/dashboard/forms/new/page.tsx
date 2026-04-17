import { getMyDealerId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import FormFormFields from '../FormFields'
import { createForm } from '../actions'
import type { BuilderField, FieldType } from '../FieldsBuilder'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function s(v: string | string[] | undefined) {
  return typeof v === 'string' ? v : ''
}

function tryParseFields(raw: string): BuilderField[] {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((p: { label?: unknown; type?: unknown; required?: unknown }) => ({
      label: typeof p.label === 'string' ? p.label : '',
      type: (['text', 'email', 'tel', 'textarea'].includes(String(p.type)) ? p.type : 'text') as FieldType,
      required: Boolean(p.required),
    }))
  } catch {
    return []
  }
}

export default async function NewFormPage({ searchParams }: PageProps) {
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')
  const sp = await searchParams

  const rawFields = s(sp.fields_json)
  const fields = rawFields ? tryParseFields(rawFields) : []

  return (
    <main className="max-w-3xl">
      <div className="mb-6">
        <Link href="/dashboard/forms" className="text-sm text-neutral-500 hover:underline">
          &larr; Powrót
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Nowy formularz</h1>
      {s(sp.error) && (
        <div className="mb-5 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300">
          {s(sp.error)}
        </div>
      )}
      <form action={createForm} className="space-y-5">
        <FormFormFields
          defaults={{
            name: s(sp.name),
            recipient_email: s(sp.recipient_email),
            fields,
          }}
        />
        <button
          type="submit"
          className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Utwórz
        </button>
      </form>
    </main>
  )
}
