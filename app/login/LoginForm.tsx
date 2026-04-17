'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <main className="mx-auto max-w-md px-4 py-24">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
        Sign in
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-foreground outline-none ring-offset-background transition-[color,box-shadow] focus-visible:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-400/40 dark:border-neutral-600 dark:focus-visible:border-neutral-500"
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="login-password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-foreground outline-none ring-offset-background transition-[color,box-shadow] focus-visible:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-400/40 dark:border-neutral-600 dark:focus-visible:border-neutral-500"
            autoComplete="current-password"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 active:opacity-80"
        >
          Sign in
        </button>
      </form>
    </main>
  )
}
