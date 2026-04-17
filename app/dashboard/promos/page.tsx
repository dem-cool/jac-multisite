import { createClient } from '@/lib/supabase-server'
import { getMyDealerId } from '@/lib/auth'
import Link from 'next/link'

export default async function PromosListPage() {
  const dealerId = await getMyDealerId()
  const supabase = await createClient()
  const { data: promos } = await supabase
    .from('promos')
    .select('id, title, slug, active, created_at')
    .eq('dealer_id', dealerId ?? '')
    .order('created_at', { ascending: false })

  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Promocje</h1>
        <Link
          href="/dashboard/promos/new"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Nowa promocja
        </Link>
      </div>

      {!promos?.length ? (
        <p className="text-sm text-neutral-500">Brak promocji.</p>
      ) : (
        <div className="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Tytuł</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-left font-medium">Aktywna</th>
                <th className="px-4 py-3 text-right font-medium">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {promos.map((p) => (
                <tr key={p.id} className="bg-background">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-neutral-500">{p.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                        p.active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                          : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}
                    >
                      {p.active ? 'Tak' : 'Nie'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/promos/${p.id}/edit`}
                      className="text-sm font-medium underline-offset-4 hover:underline"
                    >
                      Edytuj
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
