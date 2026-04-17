import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getDealerBySlug } from './lib/dealer'

const SLUG_RE = /^[a-z0-9-]+$/

function getAccessToken(request: NextRequest): string | null {
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) {
      try {
        const parsed = JSON.parse(cookie.value)
        // Supabase SSR stores it as [access_token, refresh_token] or as an object
        if (Array.isArray(parsed)) return parsed[0]
        if (parsed?.access_token) return parsed.access_token
      } catch {}
    }
  }
  return null
}

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

  const { pathname } = request.nextUrl

  // Protect /admin/* — require superadmin
  if (pathname.startsWith('/admin')) {
    const token = getAccessToken(request)
      ?? request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload?.app_metadata?.role !== 'superadmin') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Protect /dashboard/* — require dealer_admin or superadmin
  if (pathname.startsWith('/dashboard')) {
    const token = getAccessToken(request)
      ?? request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const role = payload?.app_metadata?.role
      if (role !== 'dealer_admin' && role !== 'superadmin') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
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
