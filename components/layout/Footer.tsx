import Link from 'next/link'
import type { Database } from '../../src/types/supabase'

type DealerRow = Database['public']['Tables']['dealers']['Row']

interface FooterData {
  address?: string
  phone?: string
  email?: string
}

interface FooterProps {
  dealer: DealerRow
}

export default function Footer({ dealer }: FooterProps) {
  const isImporter = dealer.slug === 'importer'

  // Safely cast footer_json to expected shape
  const footerData = (dealer.footer_json ?? null) as FooterData | null

  return (
    <footer className="mt-auto border-t bg-gray-50 px-6 py-8 text-sm text-gray-600">
      <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-1">
          {footerData?.address && (
            <p>
              <span className="font-medium">Adres:</span> {footerData.address}
            </p>
          )}
          {footerData?.phone && (
            <p>
              <span className="font-medium">Telefon:</span>{' '}
              <a href={`tel:${footerData.phone}`} className="hover:underline">
                {footerData.phone}
              </a>
            </p>
          )}
          {footerData?.email && (
            <p>
              <span className="font-medium">E-mail:</span>{' '}
              <a href={`mailto:${footerData.email}`} className="hover:underline">
                {footerData.email}
              </a>
            </p>
          )}
          {!footerData?.address && !footerData?.phone && !footerData?.email && (
            <p className="text-gray-400">JAC Motors &copy; {new Date().getFullYear()}</p>
          )}
        </div>

        {isImporter && (
          <div>
            <Link href="/dealerzy" className="font-medium hover:underline">
              Wszyscy dealerzy
            </Link>
          </div>
        )}
      </div>
    </footer>
  )
}
