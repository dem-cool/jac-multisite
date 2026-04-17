import { requireRole } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-admin'
import { SLUG_RE, toSlug } from '@/lib/slug'
import type { Json } from '@/src/types/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import FormField from '@/components/admin/FormField'
import DeleteDealerButton from '../DeleteDealerButton'

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

  const supabase = createAdminClient()
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
    const rawSlug = (formData.get('slug') as string | null)?.trim() ?? ''
    const slug = rawSlug || toSlug(name)
    const email = (formData.get('email') as string | null)?.trim() ?? ''
    const phone = (formData.get('phone') as string | null)?.trim() ?? ''
    const address = (formData.get('address') as string | null)?.trim() ?? ''

    const editUrl = `/admin/dealers/${id}/edit`

    if (!name || !slug) return redirect(`${editUrl}?error=name`)
    if (!SLUG_RE.test(slug)) {
      return redirect(`${editUrl}?error=${encodeURIComponent('Slug must only contain lowercase letters, digits, and hyphens')}`)
    }

    const supabase = createAdminClient()

    const { data: current } = await supabase.from('dealers').select('slug').eq('id', id).single()
    if (current?.slug === 'importer' && slug !== 'importer') {
      return redirect(`${editUrl}?error=${encodeURIComponent('Cannot rename the importer tenant')}`)
    }
    if (current?.slug !== 'importer' && slug === 'importer') {
      return redirect(`${editUrl}?error=${encodeURIComponent('Slug "importer" is reserved')}`)
    }

    const { error: updateError } = await supabase
      .from('dealers')
      .update({
        name,
        slug,
        contact_json: { email, phone, address },
      })
      .eq('id', id)

    if (updateError) return redirect(`${editUrl}?error=${encodeURIComponent(updateError.message)}`)

    redirect('/admin/dealers')
  }

  async function deleteDealer() {
    'use server'

    await requireRole(['superadmin'])

    const supabase = createAdminClient()

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
        <Link href="/admin/dealers" className="text-sm text-neutral-500 hover:underline">&larr; Back to Dealers</Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">Edit Dealer</h1>

      <form action={updateDealer} className="space-y-5">
        <FormField
          id="name"
          name="name"
          type="text"
          required
          defaultValue={dealer.name}
          label="Dealer Name"
        />

        <FormField
          id="slug"
          name="slug"
          type="text"
          defaultValue={dealer.slug}
          label="Slug"
          hint="Leave blank to auto-generate from name"
        />

        <FormField
          id="email"
          name="email"
          type="email"
          defaultValue={email}
          label="Contact Email"
        />

        <FormField
          id="phone"
          name="phone"
          type="tel"
          defaultValue={phone}
          label="Phone"
        />

        <FormField
          id="address"
          name="address"
          type="text"
          defaultValue={address}
          label="Address"
        />

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
