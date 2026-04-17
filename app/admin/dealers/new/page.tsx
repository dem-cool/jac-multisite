import { requireRole } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-admin'
import { findFreeDealerSlug, toSlug } from '@/lib/slug'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import FormField from '@/components/admin/FormField'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function str(v: string | string[] | undefined): string {
  return typeof v === 'string' ? v : ''
}

function errorRedirect(path: string, error: string, values: Record<string, string>) {
  const params = new URLSearchParams({ error, ...values })
  redirect(`${path}?${params.toString()}`)
}

export default async function NewDealerPage({ searchParams }: PageProps) {
  await requireRole(['superadmin'])
  const sp = await searchParams

  const error = str(sp.error)
  const name = str(sp.name)
  const email = str(sp.email)
  const phone = str(sp.phone)
  const address = str(sp.address)

  async function createDealer(formData: FormData) {
    'use server'

    await requireRole(['superadmin'])

    const name = (formData.get('name') as string | null)?.trim() ?? ''
    const email = (formData.get('email') as string | null)?.trim() ?? ''
    const phone = (formData.get('phone') as string | null)?.trim() ?? ''
    const address = (formData.get('address') as string | null)?.trim() ?? ''
    const values = { name, email, phone, address }

    const base = toSlug(name)
    if (!name || !base) return errorRedirect('/admin/dealers/new', 'Name is required', values)
    if (base === 'importer') {
      return errorRedirect('/admin/dealers/new', 'Slug "importer" is reserved', values)
    }

    const supabase = createAdminClient()
    const slug = await findFreeDealerSlug(supabase, base)

    const { data: dealer, error: insertError } = await supabase
      .from('dealers')
      .insert({
        name,
        slug,
        contact_json: { email, phone, address },
      })
      .select('id')
      .single()

    if (insertError || !dealer) {
      return errorRedirect('/admin/dealers/new', insertError?.message ?? 'Insert failed', values)
    }

    if (email) {
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: { role: 'dealer_admin', dealer_id: dealer.id },
      })
      if (inviteError) {
        const params = new URLSearchParams({
          error: `Dealer created but invite failed: ${inviteError.message}`,
        })
        redirect(`/admin/dealers/${dealer.id}/edit?${params.toString()}`)
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

      {error && (
        <div className="mb-5 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <form action={createDealer} className="space-y-5">
        <FormField
          id="name"
          name="name"
          type="text"
          required
          defaultValue={name}
          placeholder="e.g. Acme Motors"
          label="Dealer Name"
          hint="Slug will be auto-generated from name (collisions get a numeric suffix)"
        />

        <FormField
          id="email"
          name="email"
          type="email"
          defaultValue={email}
          placeholder="admin@dealership.com"
          label="Admin Email"
          hint="An invite will be sent to this email as dealer_admin"
        />

        <FormField
          id="phone"
          name="phone"
          type="tel"
          defaultValue={phone}
          placeholder="+1 555 000 0000"
          label="Phone"
        />

        <FormField
          id="address"
          name="address"
          type="text"
          defaultValue={address}
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
