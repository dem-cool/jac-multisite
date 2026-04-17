import FormField from '@/components/admin/FormField'
import RichTextEditor from '@/components/admin/RichTextEditor'
import ImageUploader from '@/components/admin/ImageUploader'

interface Props {
  dealerId: string
  defaults?: { title?: string; slug?: string; body?: string; hero_url?: string; active?: boolean }
}

export default function PromoFormFields({ dealerId, defaults = {} }: Props) {
  const active = defaults.active ?? true

  return (
    <div className="space-y-5">
      <FormField id="title" name="title" type="text" required defaultValue={defaults.title ?? ''} label="Tytuł" />
      <FormField
        id="slug"
        name="slug"
        type="text"
        defaultValue={defaults.slug ?? ''}
        label="Slug"
        hint="Pozostaw puste, aby wygenerować z tytułu"
      />
      <ImageUploader
        name="hero_url"
        label="Obraz promocji"
        defaultValue={defaults.hero_url ?? ''}
        dealerId={dealerId}
      />
      <RichTextEditor name="body" label="Treść" defaultValue={defaults.body ?? ''} />
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input type="checkbox" name="active" defaultChecked={active} />
        Aktywna (widoczna publicznie)
      </label>
    </div>
  )
}
