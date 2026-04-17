import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const cookieStore = await cookies()

  cookieStore.set('__dealer', slug, {
    path: '/',
    httpOnly: false,
    maxAge: 86400,
  })

  redirect('/')
}
