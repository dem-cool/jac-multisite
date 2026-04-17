import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './src/types/supabase'

type DealerRow = Database['public']['Tables']['dealers']['Row']

async function getDealerBySlugInline(slug: string): Promise<DealerRow | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey)

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

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  // Strip port if present
  const hostname = host.split(':')[0]
  const parts = hostname.split('.')

  let slug: string
  let fromSubdomain = false

  // 1. Try subdomain detection
  if (parts.length > 2) {
    slug = parts[0]
    fromSubdomain = true
  } else {
    // 2. Fall back to __dealer cookie
    const dealerCookie = request.cookies.get('__dealer')
    if (dealerCookie?.value) {
      slug = dealerCookie.value
    } else {
      // 3. Fall back to ?_dealer query param
      const dealerParam = request.nextUrl.searchParams.get('_dealer')
      if (dealerParam) {
        slug = dealerParam
      } else {
        // 4. Fall back to importer (root tenant)
        slug = 'importer'
      }
    }
  }

  // Validate the slug exists (skip DB check for importer fallback only if it was the default)
  const isImporterFallback = slug === 'importer' && !fromSubdomain

  const dealer = await getDealerBySlugInline(slug)

  if (!dealer) {
    if (!isImporterFallback) {
      return NextResponse.json({ error: 'Unknown tenant' }, { status: 404 })
    }
    // importer fallback not found in DB — still pass through but without dealer header
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-dealer-slug', slug)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Valid dealer — set x-dealer-slug header and pass through
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-dealer-slug', dealer.slug)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
