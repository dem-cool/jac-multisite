import FormField from '@/components/admin/FormField'
import RichTextEditor from '@/components/admin/RichTextEditor'
import ImageUploader from '@/components/admin/ImageUploader'

interface Props {
  dealerId: string
  defaults?: {
    title?: string
    slug?: string
    body?: string
    cover_url?: string
    status?: string
  }
}

export default function PostFormFields({ dealerId, defaults = {} }: Props) {
  return (
    <div className="space-y-5">
      <FormField
        id="title"
        name="title"
        type="text"
        required
        defaultValue={defaults.title ?? ''}
        label="Tytuł"
      />
      <FormField
        id="slug"
        name="slug"
        type="text"
        defaultValue={defaults.slug ?? ''}
        label="Slug"
        hint="Pozostaw puste, aby wygenerować z tytułu"
      />
      <ImageUploader
        name="cover_url"
        label="Obraz okładki"
        defaultValue={defaults.cover_url ?? ''}
        dealerId={dealerId}
      />
      <RichTextEditor name="body" label="Treść" defaultValue={defaults.body ?? ''} />
      <div className="space-y-1.5">
        <label htmlFor="status" className="text-sm font-medium text-foreground">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={defaults.status ?? 'draft'}
          className="w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-foreground dark:border-neutral-600"
        >
          <option value="draft">Szkic</option>
          <option value="published">Opublikowany</option>
        </select>
      </div>
    </div>
  )
}
