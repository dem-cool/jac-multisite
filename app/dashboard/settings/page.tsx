import { createClient } from '@/lib/supabase-server'
import { getMyDealerId } from '@/lib/auth'
import FormField from '@/components/admin/FormField'
import type { Json } from '@/src/types/supabase'
import { updateSettings } from './actions'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function s(v: string | string[] | undefined) {
  return typeof v === 'string' ? v : ''
}

function pick(blob: Json | null, key: string): string {
  if (!blob || typeof blob !== 'object' || Array.isArray(blob)) return ''
  const v = (blob as Record<string, Json | undefined>)[key]
  return typeof v === 'string' ? v : ''
}

export default async function SettingsPage({ searchParams }: PageProps) {
  const dealerId = await getMyDealerId()
  const supabase = await createClient()
  const { data: dealer } = await supabase
    .from('dealers')
    .select('contact_json, footer_json')
    .eq('id', dealerId ?? '')
    .single()

  const sp = await searchParams

  return (
    <main className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Ustawienia dealera</h1>

      {s(sp.error) && (
        <div className="mb-5 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300">
          {s(sp.error)}
        </div>
      )}
      {s(sp.saved) && (
        <div className="mb-5 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-700 dark:bg-green-950/40 dark:text-green-300">
          Zapisano.
        </div>
      )}

      <form action={updateSettings} className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Kontakt</h2>
          <FormField
            id="contact_email"
            name="contact_email"
            type="email"
            label="Email kontaktowy"
            defaultValue={pick(dealer?.contact_json ?? null, 'email')}
          />
          <FormField
            id="contact_phone"
            name="contact_phone"
            type="tel"
            label="Telefon"
            defaultValue={pick(dealer?.contact_json ?? null, 'phone')}
          />
          <FormField
            id="contact_address"
            name="contact_address"
            type="text"
            label="Adres"
            defaultValue={pick(dealer?.contact_json ?? null, 'address')}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Stopka</h2>
          <FormField
            id="footer_email"
            name="footer_email"
            type="email"
            label="Email w stopce"
            defaultValue={pick(dealer?.footer_json ?? null, 'email')}
          />
          <FormField
            id="footer_phone"
            name="footer_phone"
            type="tel"
            label="Telefon w stopce"
            defaultValue={pick(dealer?.footer_json ?? null, 'phone')}
          />
          <FormField
            id="footer_address"
            name="footer_address"
            type="text"
            label="Adres w stopce"
            defaultValue={pick(dealer?.footer_json ?? null, 'address')}
          />
        </section>

        <button
          type="submit"
          className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Zapisz ustawienia
        </button>
      </form>
    </main>
  )
}
