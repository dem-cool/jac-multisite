import Link from 'next/link'

const LINKS: { href: string; label: string }[] = [
  { href: '/dashboard', label: 'Home' },
  { href: '/dashboard/blog', label: 'Blog' },
  { href: '/dashboard/slider', label: 'Slider' },
  { href: '/dashboard/promos', label: 'Promocje' },
  { href: '/dashboard/forms', label: 'Formularze' },
  { href: '/dashboard/settings', label: 'Ustawienia' },
]

export default function DashboardNav({ dealerName }: { dealerName: string }) {
  return (
    <aside className="w-56 shrink-0 border-r border-neutral-200 bg-neutral-50 px-4 py-8 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-neutral-500">Dealer</p>
        <p className="mt-1 truncate text-sm font-semibold text-foreground">{dealerName}</p>
      </div>
      <nav className="flex flex-col gap-1 text-sm">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded px-2 py-1.5 text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
