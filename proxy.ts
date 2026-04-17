import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getDealerBySlug } from './lib/dealer'

const SLUG_RE = /^[a-z0-9-]+$/

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const hostname = host.split(':')[0]
  const parts = hostname.split('.')

  let slug: string
  let fromSubdomain = false

  if (parts.length > 2) {
    slug = parts[0]
    fromSubdomain = true
  } else {
    const dealerCookie = request.cookies.get('__dealer')
    if (dealerCookie?.value) {
      slug = dealerCookie.value
    } else {
      const dealerParam = request.nextUrl.searchParams.get('_dealer')
      if (dealerParam) {
        slug = dealerParam
      } else {
        slug = 'importer'
      }
    }
  }

  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: 'Unknown tenant' }, { status: 404 })
  }

  const dealer = await getDealerBySlug(slug)

  if (!dealer) {
    // importer is the root-tenant fallback — pass through even if not seeded yet
    if (slug === 'importer' && !fromSubdomain) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-dealer-slug', slug)
      return NextResponse.next({ request: { headers: requestHeaders } })
    }
    return NextResponse.json({ error: 'Unknown tenant' }, { status: 404 })
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-dealer-slug', dealer.slug)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
