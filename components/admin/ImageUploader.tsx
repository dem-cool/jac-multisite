'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface Props {
  name: string
  label: string
  defaultValue?: string
  dealerId: string
}

export default function ImageUploader({ name, label, defaultValue = '', dealerId }: Props) {
  const [url, setUrl] = useState(defaultValue)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploading(true)

    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const path = `${dealerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const { error: upErr } = await supabase.storage.from('dealer-media').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

    if (upErr) {
      setError(upErr.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('dealer-media').getPublicUrl(path)
    setUrl(data.publicUrl)
    setUploading(false)
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {url && (
        <div className="mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Podgląd" className="max-h-40 rounded-md border border-neutral-200 object-cover dark:border-neutral-700" />
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={uploading}
        className="block text-sm text-neutral-600 file:mr-3 file:rounded-md file:border file:border-neutral-300 file:bg-neutral-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-neutral-100 dark:text-neutral-300 dark:file:border-neutral-600 dark:file:bg-neutral-800"
      />
      {uploading && <p className="text-xs text-neutral-500">Przesyłanie…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {url && (
        <button
          type="button"
          onClick={() => setUrl('')}
          className="text-xs text-red-600 underline-offset-2 hover:underline"
        >
          Usuń obraz
        </button>
      )}
      <input type="hidden" name={name} value={url} readOnly />
    </div>
  )
}
