import { createClient } from '@/lib/supabase-server'
import { getMyDealerId } from '@/lib/auth'
import Link from 'next/link'

export default async function BlogListPage() {
  const dealerId = await getMyDealerId()
  const supabase = await createClient()
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, status, published_at, created_at')
    .eq('dealer_id', dealerId ?? '')
    .order('created_at', { ascending: false })

  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Blog</h1>
        <Link
          href="/dashboard/blog/new"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Nowy post
        </Link>
      </div>

      {error ? (
        <p className="text-sm text-red-600">Błąd: {error.message}</p>
      ) : !posts?.length ? (
        <p className="text-sm text-neutral-500">Brak postów. Utwórz pierwszy.</p>
      ) : (
        <div className="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Tytuł</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {posts.map((p) => (
                <tr key={p.id} className="bg-background">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-neutral-500">{p.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                        p.status === 'published'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                          : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}
                    >
                      {p.status === 'published' ? 'Opublikowany' : 'Szkic'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/blog/${p.id}/edit`}
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
