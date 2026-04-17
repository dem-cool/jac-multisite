import { createClient } from '@/lib/supabase-server'
import { getMyDealerId } from '@/lib/auth'
import Link from 'next/link'
import SlideList from './SlideList'

export default async function SliderPage() {
  const dealerId = await getMyDealerId()
  const supabase = await createClient()
  const { data: slides } = await supabase
    .from('carousel_slides')
    .select('id, image_url, headline, link, sort_order')
    .eq('dealer_id', dealerId ?? '')
    .order('sort_order')

  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Slider</h1>
        <Link
          href="/dashboard/slider/new"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Nowy slajd
        </Link>
      </div>
      <p className="mb-4 text-xs text-neutral-500">Przeciągnij slajdy, aby zmienić kolejność.</p>
      <SlideList initial={slides ?? []} />
    </main>
  )
}
