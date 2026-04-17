import { headers } from 'next/headers'
import { getDealerBySlug } from './dealer'
import type { Database } from '../src/types/supabase'

type DealerRow = Database['public']['Tables']['dealers']['Row']

export async function getDealerFromHeaders(): Promise<DealerRow> {
  const headerStore = await headers()
  const slug = headerStore.get('x-dealer-slug')

  if (!slug) {
    throw new Error('No dealer slug found in request headers')
  }

  const dealer = await getDealerBySlug(slug)

  if (!dealer) {
    throw new Error(`Dealer not found for slug: ${slug}`)
  }

  return dealer
}
