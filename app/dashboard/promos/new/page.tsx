import { getMyDealerId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PromoFormFields from '../PromoFormFields'
import { createPromo } from '../actions'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function s(v: string | string[] | undefined) {
  return typeof v === 'string' ? v : ''
}

export default async function NewPromoPage({ searchParams }: PageProps) {
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')
  const sp = await searchParams

  return (
    <main className="max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard/promos" className="text-sm text-neutral-500 hover:underline">
          &larr; Powrót
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Nowa promocja</h1>
      {s(sp.error) && (
        <div className="mb-5 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300">
          {s(sp.error)}
        </div>
      )}
      <form action={createPromo} className="space-y-5">
        <PromoFormFields
          dealerId={dealerId}
          defaults={{
            title: s(sp.title),
            slug: s(sp.slug),
            hero_url: s(sp.hero_url),
            active: s(sp.active) !== 'false',
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
