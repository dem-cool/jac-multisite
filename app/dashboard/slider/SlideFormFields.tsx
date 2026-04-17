import FormField from '@/components/admin/FormField'
import ImageUploader from '@/components/admin/ImageUploader'

interface Props {
  dealerId: string
  defaults?: { image_url?: string; headline?: string; link?: string }
}

export default function SlideFormFields({ dealerId, defaults = {} }: Props) {
  return (
    <div className="space-y-5">
      <ImageUploader
        name="image_url"
        label="Obraz slajdu"
        defaultValue={defaults.image_url ?? ''}
        dealerId={dealerId}
      />
      <FormField id="headline" name="headline" type="text" defaultValue={defaults.headline ?? ''} label="Nagłówek" />
      <FormField
        id="link"
        name="link"
        type="text"
        defaultValue={defaults.link ?? ''}
        label="Link (opcjonalny)"
        placeholder="/promocje/nowa-oferta"
      />
    </div>
  )
}
