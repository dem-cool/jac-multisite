import { requireRole } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/src/types/supabase'
import Link from 'next/link'

export default async function DealersPage() {
  await requireRole(['superadmin'])

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: dealers, error } = await supabase
    .from('dealers')
    .select('id, slug, name, contact_json, created_at')
    .neq('slug', 'importer')
    .order('name')

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dealers</h1>
        <Link
          href="/admin/dealers/new"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 active:opacity-80"
        >
          Add Dealer
        </Link>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">Failed to load dealers: {error.message}</p>
      )}

      {dealers && dealers.length === 0 && (
        <p className="text-sm text-neutral-500">No dealers yet. Add one to get started.</p>
      )}

      {dealers && dealers.length > 0 && (
        <div className="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-foreground">Created</th>
                <th className="px-4 py-3 text-right font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {dealers.map((dealer) => (
                <tr key={dealer.id} className="bg-background hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-4 py-3 font-medium text-foreground">{dealer.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{dealer.slug}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {dealer.created_at ? new Date(dealer.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/dealers/${dealer.id}/edit`}
                      className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      Edit
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
