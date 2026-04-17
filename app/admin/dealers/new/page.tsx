import { requireRole } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-admin'
import { toSlug } from '@/lib/slug'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import FormField from '@/components/admin/FormField'

export default async function NewDealerPage() {
  await requireRole(['superadmin'])

  async function createDealer(formData: FormData) {
    'use server'

    await requireRole(['superadmin'])

    const name = (formData.get('name') as string | null)?.trim() ?? ''
    const slug = toSlug(name)
    const email = (formData.get('email') as string | null)?.trim() ?? ''
    const phone = (formData.get('phone') as string | null)?.trim() ?? ''
    const address = (formData.get('address') as string | null)?.trim() ?? ''

    if (!name || !slug) return redirect('/admin/dealers/new?error=name')
    if (slug === 'importer') {
      return redirect(`/admin/dealers/new?error=${encodeURIComponent('Slug "importer" is reserved')}`)
    }

    const supabase = createAdminClient()

    const { data: dealer, error: insertError } = await supabase
      .from('dealers')
      .insert({
        name,
        slug,
        contact_json: { email, phone, address },
      })
      .select('id')
      .single()

    if (insertError || !dealer) return redirect(`/admin/dealers/new?error=${encodeURIComponent(insertError?.message ?? 'insert')}`)

    if (email) {
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: { role: 'dealer_admin', dealer_id: dealer.id },
      })
      if (inviteError) {
        return redirect(
          `/admin/dealers/${dealer.id}/edit?error=${encodeURIComponent(`Dealer created but invite failed: ${inviteError.message}`)}`,
        )
      }
    }

    redirect('/admin/dealers')
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-8">
        <Link href="/admin/dealers" className="text-sm text-neutral-500 hover:underline">&larr; Back to Dealers</Link>
      </div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">New Dealer</h1>

      <form action={createDealer} className="space-y-5">
        <FormField
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. Acme Motors"
          label="Dealer Name"
          hint="Slug will be auto-generated from name"
        />

        <FormField
          id="email"
          name="email"
          type="email"
          placeholder="admin@dealership.com"
          label="Admin Email"
          hint="An invite will be sent to this email as dealer_admin"
        />

        <FormField
          id="phone"
          name="phone"
          type="tel"
          placeholder="+1 555 000 0000"
          label="Phone"
        />

        <FormField
          id="address"
          name="address"
          type="text"
          placeholder="123 Main St, City, State"
          label="Address"
        />

        <button
          type="submit"
          className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 active:opacity-80"
        >
          Create Dealer
        </button>
      </form>
    </main>
  )
}
