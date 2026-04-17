'use client'

interface Props {
  action: () => Promise<void>
  label?: string
  confirmMessage?: string
}

export default function DeleteButton({
  action,
  label = 'Usuń',
  confirmMessage = 'Na pewno usunąć? Operacja jest nieodwracalna.',
}: Props) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
        onClick={(e) => {
          if (!confirm(confirmMessage)) e.preventDefault()
        }}
      >
        {label}
      </button>
    </form>
  )
}
