import Link from 'next/link'
import type { Database } from '../../src/types/supabase'

type DealerRow = Database['public']['Tables']['dealers']['Row']

interface HeaderProps {
  dealer: DealerRow
}

export default function Header({ dealer }: HeaderProps) {
  const isImporter = dealer.slug === 'importer'

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Link href="/" className="text-2xl font-bold tracking-tight text-black">
          JAC
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex items-center gap-6 text-sm font-medium">
        <Link href="/" className="hover:underline">
          Strona główna
        </Link>
        <Link href="/blog" className="hover:underline">
          Blog
        </Link>
        <Link href="/promocje" className="hover:underline">
          Promocje
        </Link>
        <Link href="/o-nas" className="hover:underline">
          O nas
        </Link>
        {isImporter && (
          <Link href="/dealerzy" className="hover:underline">
            Dealerzy
          </Link>
        )}
      </nav>

      {/* Right side */}
      <div className="flex-shrink-0 w-32 flex justify-end">
        {!isImporter && (
          <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {dealer.name}
          </span>
        )}
      </div>
    </header>
  )
}
