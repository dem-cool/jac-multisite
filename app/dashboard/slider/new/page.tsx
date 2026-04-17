import { getMyDealerId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SlideFormFields from '../SlideFormFields'
import { createSlide } from '../actions'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function s(v: string | string[] | undefined) {
  return typeof v === 'string' ? v : ''
}

export default async function NewSlidePage({ searchParams }: PageProps) {
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')
  const sp = await searchParams

  return (
    <main className="max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard/slider" className="text-sm text-neutral-500 hover:underline">
          &larr; Powrót
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Nowy slajd</h1>
      {s(sp.error) && (
        <div className="mb-5 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300">
          {s(sp.error)}
        </div>
      )}
      <form action={createSlide} className="space-y-5">
        <SlideFormFields
          dealerId={dealerId}
          defaults={{ headline: s(sp.headline), link: s(sp.link) }}
        />
        <button
          type="submit"
          className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Dodaj slajd
        </button>
      </form>
    </main>
  )
}
