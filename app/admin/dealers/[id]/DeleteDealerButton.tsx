'use client'

interface Props {
  action: () => Promise<void>
}

export default function DeleteDealerButton({ action }: Props) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
        onClick={(e) => {
          if (!confirm('Are you sure you want to delete this dealer? This cannot be undone.')) {
            e.preventDefault()
          }
        }}
      >
        Delete Dealer
      </button>
    </form>
  )
}
