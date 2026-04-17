import { createClient } from '@/lib/supabase-server'
import { getMyDealerId } from '@/lib/auth'
import Link from 'next/link'

export default async function FormsListPage() {
  const dealerId = await getMyDealerId()
  const supabase = await createClient()
  const { data: forms } = await supabase
    .from('forms')
    .select('id, name, recipient_email, fields_json, created_at')
    .eq('dealer_id', dealerId ?? '')
    .order('created_at', { ascending: false })

  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Formularze</h1>
        <Link
          href="/dashboard/forms/new"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Nowy formularz
        </Link>
      </div>

      {!forms?.length ? (
        <p className="text-sm text-neutral-500">Brak formularzy.</p>
      ) : (
        <div className="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nazwa</th>
                <th className="px-4 py-3 text-left font-medium">Odbiorca</th>
                <th className="px-4 py-3 text-left font-medium">Pól</th>
                <th className="px-4 py-3 text-right font-medium">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {forms.map((f) => {
                const count = Array.isArray(f.fields_json) ? f.fields_json.length : 0
                return (
                  <tr key={f.id} className="bg-background">
                    <td className="px-4 py-3 font-medium">{f.name}</td>
                    <td className="px-4 py-3 text-neutral-500">{f.recipient_email}</td>
                    <td className="px-4 py-3 text-neutral-500">{count}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/forms/${f.id}/edit`}
                        className="text-sm font-medium underline-offset-4 hover:underline"
                      >
                        Edytuj
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
