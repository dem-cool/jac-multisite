import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/supabase'

type DealerRow = Database['public']['Tables']['dealers']['Row']

function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey)
}

export async function getDealerBySlug(slug: string): Promise<DealerRow | null> {
  const supabase = getServiceRoleClient()

  const { data, error } = await supabase
    .from('dealers')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return null
  }

  return data
}
