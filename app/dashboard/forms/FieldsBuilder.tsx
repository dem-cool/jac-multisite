'use client'

import { useState } from 'react'

export type FieldType = 'text' | 'email' | 'tel' | 'textarea'

export interface BuilderField {
  label: string
  type: FieldType
  required: boolean
}

const TYPE_OPTIONS: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Tekst' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Telefon' },
  { value: 'textarea', label: 'Wiadomość' },
]

export default function FieldsBuilder({ initial }: { initial: BuilderField[] }) {
  const [fields, setFields] = useState<BuilderField[]>(initial)

  function update(i: number, patch: Partial<BuilderField>) {
    setFields((f) => f.map((row, idx) => (idx === i ? { ...row, ...patch } : row)))
  }

  function remove(i: number) {
    setFields((f) => f.filter((_, idx) => idx !== i))
  }

  function add() {
    setFields((f) => [...f, { label: '', type: 'text', required: false }])
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Pola formularza</label>

      {fields.length === 0 && (
        <p className="text-xs text-neutral-500">Brak pól. Dodaj pierwsze poniżej.</p>
      )}

      <div className="space-y-2">
        {fields.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_140px_100px_auto] items-center gap-2 rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
          >
            <input
              type="text"
              placeholder="Etykieta (np. Imię)"
              value={row.label}
              onChange={(e) => update(i, { label: e.target.value })}
              className="rounded-md border border-neutral-300 bg-background px-2 py-1.5 text-sm dark:border-neutral-600"
            />
            <select
              value={row.type}
              onChange={(e) => update(i, { type: e.target.value as FieldType })}
              className="rounded-md border border-neutral-300 bg-background px-2 py-1.5 text-sm dark:border-neutral-600"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 text-xs text-foreground">
              <input
                type="checkbox"
                checked={row.required}
                onChange={(e) => update(i, { required: e.target.checked })}
              />
              Wymagane
            </label>
            <button
              type="button"
              onClick={() => remove(i)}
              className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-950"
            >
              Usuń
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
      >
        + Dodaj pole
      </button>

      <input type="hidden" name="fields_json" value={JSON.stringify(fields)} readOnly />
    </div>
  )
}
