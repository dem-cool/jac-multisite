import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getDealerBySlug } from './lib/dealer'

const SLUG_RE = /^[a-z0-9-]+$/

async function checkAuth(request: NextRequest, allowedRoles: string[]): Promise<NextResponse | null> {
  const tmp = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => tmp.cookies.set(name, value, options)),
      },
    },
  )
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (!role || !allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return null
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  const hostname = host.split(':')[0]
  const parts = hostname.split('.')

  const { pathname } = request.nextUrl
  const needsAdmin = pathname.startsWith('/admin')
  const needsDashboard = pathname.startsWith('/dashboard')

  if (needsAdmin || needsDashboard) {
    const redirect = await checkAuth(
      request,
      needsAdmin ? ['superadmin'] : ['dealer_admin', 'superadmin'],
    )
    if (redirect) return redirect
  }

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
      slug = dealerParam ?? 'importer'
    }
  }

  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: 'Unknown tenant' }, { status: 404 })
  }

  const dealer = await getDealerBySlug(slug)
  const isImporterFallback = !dealer && slug === 'importer' && !fromSubdomain
  if (!dealer && !isImporterFallback) {
    return NextResponse.json({ error: 'Unknown tenant' }, { status: 404 })
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-dealer-slug', dealer?.slug ?? slug)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
