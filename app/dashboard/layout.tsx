import { requireRole, getMyDealerId } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import DashboardNav from '@/components/admin/DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['dealer_admin'])
  const dealerId = await getMyDealerId()
  if (!dealerId) redirect('/login')

  const supabase = createAdminClient()
  const { data: dealer } = await supabase
    .from('dealers')
    .select('name')
    .eq('id', dealerId)
    .single()

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      <DashboardNav dealerName={dealer?.name ?? 'Dealer'} />
      <div className="flex-1 px-6 py-8">{children}</div>
    </div>
  )
}
