import { requireRole } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/src/types/supabase'
import { redirect } from 'next/navigation'
import DeleteDealerButton from '../DeleteDealerButton'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getContactField(contact: Json | null, key: string): string {
  if (!contact || typeof contact !== 'object' || Array.isArray(contact)) return ''
  const value = (contact as Record<string, Json | undefined>)[key]
  return typeof value === 'string' ? value : ''
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditDealerPage({ params }: PageProps) {
  await requireRole(['superadmin'])

  const { id } = await params

  const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: dealer, error } = await supabase
    .from('dealers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !dealer) redirect('/admin/dealers')

  async function updateDealer(formData: FormData) {
    'use server'

    await requireRole(['superadmin'])

    const name = (formData.get('name') as string | null)?.trim() ?? ''
    const slug = (formData.get('slug') as string | null)?.trim() || toSlug(name)
    const email = (formData.get('email') as string | null)?.trim() ?? ''
    const phone = (formData.get('phone') as string | null)?.trim() ?? ''
    const address = (formData.get('address') as string | null)?.trim() ?? ''

    if (!name || !slug) return redirect(`/admin/dealers/${id}/edit?error=name`)

    const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { error: updateError } = await supabase
      .from('dealers')
      .update({
        name,
        slug,
        contact_json: { email, phone, address },
      })
      .eq('id', id)

    if (updateError) return redirect(`/admin/dealers/${id}/edit?error=${encodeURIComponent(updateError.message)}`)

    redirect('/admin/dealers')
  }

  async function deleteDealer() {
    'use server'

    await requireRole(['superadmin'])

    const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: target } = await supabase.from('dealers').select('slug').eq('id', id).single()
    if (target?.slug === 'importer') return redirect(`/admin/dealers/${id}/edit?error=Cannot+delete+the+importer+tenant`)

    const { error: deleteError } = await supabase
      .from('dealers')
      .delete()
      .eq('id', id)

    if (deleteError) return redirect(`/admin/dealers/${id}/edit?error=${encodeURIComponent(deleteError.message)}`)

    redirect('/admin/dealers')
  }

  const email = getContactField(dealer.contact_json, 'email')
  const phone = getContactField(dealer.contact_json, 'phone')
  const address = getContactField(dealer.contact_json, 'address')

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-8">
        <a href="/admin/dealers" className="text-sm text-neutral-500 hover:underline">&larr; Back to Dealers</a>
      </div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">Edit Dealer</h1>

      <form action={updateDealer} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Dealer Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={dealer.name}
            className="w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-foreground outline-none ring-offset-background transition-[color,box-shadow] focus-visible:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-400/40 dark:border-neutral-600 dark:focus-visible:border-neutral-500"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="slug" className="text-sm font-medium text-foreground">Slug</label>
          <input
            id="slug"
            name="slug"
            type="text"
            defaultValue={dealer.slug}
            className="w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-foreground outline-none ring-offset-background transition-[color,box-shadow] focus-visible:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-400/40 dark:border-neutral-600 dark:focus-visible:border-neutral-500"
          />
          <p className="text-xs text-neutral-500">Leave blank to auto-generate from name</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">Contact Email</label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={email}
            className="w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-foreground outline-none ring-offset-background transition-[color,box-shadow] focus-visible:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-400/40 dark:border-neutral-600 dark:focus-visible:border-neutral-500"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-medium text-foreground">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={phone}
            className="w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-foreground outline-none ring-offset-background transition-[color,box-shadow] focus-visible:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-400/40 dark:border-neutral-600 dark:focus-visible:border-neutral-500"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="address" className="text-sm font-medium text-foreground">Address</label>
          <input
            id="address"
            name="address"
            type="text"
            defaultValue={address}
            className="w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-foreground outline-none ring-offset-background transition-[color,box-shadow] focus-visible:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-400/40 dark:border-neutral-600 dark:focus-visible:border-neutral-500"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 active:opacity-80"
        >
          Save Changes
        </button>
      </form>

      <div className="mt-10 border-t border-neutral-200 pt-8 dark:border-neutral-700">
        <h2 className="mb-3 text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
        <p className="mb-4 text-sm text-neutral-500">
          Deleting this dealer is permanent and cannot be undone. All associated data will be removed.
        </p>
        <DeleteDealerButton action={deleteDealer} />
      </div>
    </main>
  )
}
