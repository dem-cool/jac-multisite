import { createClient } from '@/lib/supabase-server'
import { getMyDealerId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SlideFormFields from '../../SlideFormFields'
import { updateSlide, deleteSlide } from '../../actions'
import DeleteButton from '@/components/admin/DeleteButton'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function s(v: string | string[] | undefined) {
  return typeof v === 'string' ? v : ''
}

export default async function EditSlidePage({ params, searchParams }: PageProps) {
  const { id } = await params
  const sp = await searchParams
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')

  const supabase = await createClient()
  const { data: slide } = await supabase
    .from('carousel_slides')
    .select('id, image_url, headline, link, dealer_id')
    .eq('id', id)
    .single()

  if (!slide || slide.dealer_id !== dealerId) redirect('/dashboard/slider')

  const update = updateSlide.bind(null, id)
  const del = deleteSlide.bind(null, id)

  return (
    <main className="max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard/slider" className="text-sm text-neutral-500 hover:underline">
          &larr; Powrót
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Edytuj slajd</h1>
      {s(sp.error) && (
        <div className="mb-5 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300">
          {s(sp.error)}
        </div>
      )}
      <form action={update} className="space-y-5">
        <SlideFormFields
          dealerId={dealerId}
          defaults={{
            image_url: slide.image_url,
            headline: slide.headline ?? '',
            link: slide.link ?? '',
          }}
        />
        <button
          type="submit"
          className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Zapisz
        </button>
      </form>
      <div className="mt-10 border-t border-neutral-200 pt-8 dark:border-neutral-700">
        <DeleteButton action={del} label="Usuń slajd" confirmMessage="Usunąć ten slajd?" />
      </div>
    </main>
  )
}
