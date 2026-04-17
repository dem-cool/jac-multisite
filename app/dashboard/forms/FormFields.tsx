import FormField from '@/components/admin/FormField'
import FieldsBuilder, { type BuilderField } from './FieldsBuilder'

interface Props {
  defaults?: { name?: string; recipient_email?: string; fields?: BuilderField[] }
}

export default function FormFormFields({ defaults = {} }: Props) {
  return (
    <div className="space-y-5">
      <FormField
        id="name"
        name="name"
        type="text"
        required
        defaultValue={defaults.name ?? ''}
        label="Nazwa formularza"
        placeholder="np. Kontakt, Jazda próbna"
      />
      <FormField
        id="recipient_email"
        name="recipient_email"
        type="email"
        required
        defaultValue={defaults.recipient_email ?? ''}
        label="Email odbiorcy"
        hint="Tam trafią wysłane zgłoszenia"
      />
      <FieldsBuilder initial={defaults.fields ?? []} />
    </div>
  )
}
