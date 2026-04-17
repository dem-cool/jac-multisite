import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/supabase'

type DealerRow = Database['public']['Tables']['dealers']['Row']

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey)

export async function getDealerBySlug(slug: string): Promise<DealerRow | null> {
  const { data, error } = await supabase
    .from('dealers')
    .select('id, slug, name')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return null
  }

  return data as DealerRow
}
