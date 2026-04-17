import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/src/types/supabase'

export const SLUG_RE = /^[a-z0-9-]+$/

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function findFreeDealerSlug(
  supabase: SupabaseClient<Database>,
  base: string,
): Promise<string> {
  const { data } = await supabase
    .from('dealers')
    .select('slug')
    .or(`slug.eq.${base},slug.like.${base}-%`)
  const taken = new Set((data ?? []).map((d) => d.slug))
  if (!taken.has(base)) return base
  for (let n = 2; n < 1000; n++) {
    const candidate = `${base}-${n}`
    if (!taken.has(candidate)) return candidate
  }
  return `${base}-${Date.now()}`
}
