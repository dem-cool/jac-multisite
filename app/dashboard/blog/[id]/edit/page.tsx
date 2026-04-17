import { createClient } from '@/lib/supabase-server'
import { getMyDealerId } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PostFormFields from '../../PostFormFields'
import { updatePost, deletePost } from '../../actions'
import DeleteButton from '@/components/admin/DeleteButton'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function s(v: string | string[] | undefined): string {
  return typeof v === 'string' ? v : ''
}

export default async function EditPostPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const sp = await searchParams
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')

  const supabase = await createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('id, title, slug, body, cover_url, status, dealer_id')
    .eq('id', id)
    .single()

  if (!post || post.dealer_id !== dealerId) redirect('/dashboard/blog')

  const update = updatePost.bind(null, id)
  const del = deletePost.bind(null, id)

  return (
    <main className="max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard/blog" className="text-sm text-neutral-500 hover:underline">
          &larr; Powrót do listy
        </Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Edytuj post</h1>

      {s(sp.error) && (
        <div className="mb-5 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300">
          {s(sp.error)}
        </div>
      )}

      <form action={update} className="space-y-5">
        <PostFormFields
          dealerId={dealerId}
          defaults={{
            title: post.title,
            slug: post.slug,
            body: post.body ?? '',
            cover_url: post.cover_url ?? '',
            status: post.status,
          }}
        />
        <button
          type="submit"
          className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Zapisz zmiany
        </button>
      </form>

      <div className="mt-10 border-t border-neutral-200 pt-8 dark:border-neutral-700">
        <h2 className="mb-3 text-sm font-semibold text-red-600 dark:text-red-400">Strefa niebezpieczna</h2>
        <DeleteButton action={del} label="Usuń post" confirmMessage="Usunąć ten post?" />
      </div>
    </main>
  )
}
