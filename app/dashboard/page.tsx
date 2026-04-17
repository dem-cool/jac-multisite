import { createClient } from '@/lib/supabase-server'
import { getMyDealerId } from '@/lib/auth'
import Link from 'next/link'

export default async function DashboardHome() {
  const dealerId = await getMyDealerId()
  const supabase = await createClient()

  const [{ count: postCount }, { count: slideCount }, { count: promoCount }, { count: formCount }] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('dealer_id', dealerId ?? ''),
    supabase.from('carousel_slides').select('*', { count: 'exact', head: true }).eq('dealer_id', dealerId ?? ''),
    supabase.from('promos').select('*', { count: 'exact', head: true }).eq('dealer_id', dealerId ?? ''),
    supabase.from('forms').select('*', { count: 'exact', head: true }).eq('dealer_id', dealerId ?? ''),
  ])

  const tiles: { href: string; label: string; count: number | null }[] = [
    { href: '/dashboard/blog', label: 'Posty', count: postCount ?? 0 },
    { href: '/dashboard/slider', label: 'Slajdy', count: slideCount ?? 0 },
    { href: '/dashboard/promos', label: 'Promocje', count: promoCount ?? 0 },
    { href: '/dashboard/forms', label: 'Formularze', count: formCount ?? 0 },
  ]

  return (
    <main>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">Panel dealera</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="rounded-md border border-neutral-200 bg-background px-4 py-5 text-sm transition-colors hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500"
          >
            <div className="text-xs uppercase tracking-wide text-neutral-500">{t.label}</div>
            <div className="mt-2 text-2xl font-semibold text-foreground">{t.count ?? 0}</div>
          </Link>
        ))}
      </div>
    </main>
  )
}
