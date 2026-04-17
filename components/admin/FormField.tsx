import type { InputHTMLAttributes, ReactNode } from 'react'

const INPUT_CLASS =
  'w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-foreground outline-none ring-offset-background transition-[color,box-shadow] focus-visible:border-neutral-500 focus-visible:ring-2 focus-visible:ring-neutral-400/40 dark:border-neutral-600 dark:focus-visible:border-neutral-500'

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: ReactNode
  hint?: ReactNode
}

export default function FormField({ label, hint, id, required, ...inputProps }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input id={id} required={required} className={INPUT_CLASS} {...inputProps} />
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  )
}
