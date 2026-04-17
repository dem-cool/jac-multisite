import { requireRole } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/src/types/supabase'
import { redirect } from 'next/navigation'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

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

    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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
      await supabase.auth.admin.inviteUserByEmail(email, {
        data: { role: 'dealer_admin', dealer_id: dealer.id },
      })
    }

    redirect('/admin/dealers')
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-8">
        <a href="/admin/dealers" className="text-sm text-neutral-500 hover:underline">&larr; Back to Dealers</a>
      </div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">New Dealer</h1>

      <form action={createDealer} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Dealer Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="e.g. Acme Motors"
            className="w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-foreground outline-none ring-offset-background transition-[color,box-shadow] focus-visible:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-400/40 dark:border-neutral-600 dark:focus-visible:border-neutral-500"
          />
          <p className="text-xs text-neutral-500">Slug will be auto-generated from name</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Admin Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="admin@dealership.com"
            className="w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-foreground outline-none ring-offset-background transition-[color,box-shadow] focus-visible:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-400/40 dark:border-neutral-600 dark:focus-visible:border-neutral-500"
          />
          <p className="text-xs text-neutral-500">An invite will be sent to this email as dealer_admin</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-sm font-medium text-foreground">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+1 555 000 0000"
            className="w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-foreground outline-none ring-offset-background transition-[color,box-shadow] focus-visible:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-400/40 dark:border-neutral-600 dark:focus-visible:border-neutral-500"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="address" className="text-sm font-medium text-foreground">Address</label>
          <input
            id="address"
            name="address"
            type="text"
            placeholder="123 Main St, City, State"
            className="w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-foreground outline-none ring-offset-background transition-[color,box-shadow] focus-visible:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-400/40 dark:border-neutral-600 dark:focus-visible:border-neutral-500"
          />
        </div>

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
