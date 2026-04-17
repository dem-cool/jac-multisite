import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  const user = await getUser()
  if (user) {
    const role = user.app_metadata?.role
    if (role === 'superadmin') redirect('/admin/dealers')
    else if (role === 'dealer_admin') redirect('/dashboard')
    else redirect('/')
  }
  return <LoginForm />
}
