import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema } from '@/lib/schemas'
import type { ContactFormValues } from '@/lib/schemas'
import type { Contact, ContactTag } from '@/types'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { usePhoneFormat } from '@/hooks/usePhoneFormat'

const ALL_TAGS: ContactTag[] = ['vip', 'partner', 'lead', 'customer', 'vendor']

interface ContactFormProps {
  defaultValues?: Partial<Contact>
  onSubmit: (values: ContactFormValues) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function ContactForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Save' }: ContactFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: defaultValues?.firstName ?? '',
      lastName: defaultValues?.lastName ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      company: defaultValues?.company ?? '',
      jobTitle: defaultValues?.jobTitle ?? '',
      status: defaultValues?.status ?? 'prospect',
      tags: defaultValues?.tags ?? [],
      address: defaultValues?.address,
      socialLinks: defaultValues?.socialLinks,
    },
  })

  const selectedTags = watch('tags') ?? []
  const phoneValue = watch('phone')

  const handlePhoneChange = usePhoneFormat((formatted) => setValue('phone', formatted, { shouldValidate: true }))

  const toggleTag = (tag: ContactTag) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]
    setValue('tags', next, { shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First Name"
          placeholder="Jane"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label="Last Name"
          placeholder="Smith"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="jane@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      {/* Phone — controlled for formatting */}
      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</label>
        <input
          id="phone"
          type="tel"
          placeholder="(555) 867-5309"
          value={phoneValue}
          onChange={handlePhoneChange}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
        />
        {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Company"
          placeholder="Acme Corp"
          error={errors.company?.message}
          {...register('company')}
        />
        <Input
          label="Job Title"
          placeholder="Product Manager"
          error={errors.jobTitle?.message}
          {...register('jobTitle')}
        />
      </div>

      <Select label="Status" error={errors.status?.message} {...register('status')}>
        <option value="prospect">Prospect</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="churned">Churned</option>
      </Select>

      {/* Tags */}
      <Controller
        control={control}
        name="tags"
        render={() => (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Tags</span>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      />

      {/* Address */}
      <details className="group">
        <summary className="text-sm font-medium text-gray-700 cursor-pointer list-none flex items-center gap-1 select-none">
          <svg className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Address (optional)
        </summary>
        <div className="mt-3 space-y-3">
          <Input label="Street" placeholder="123 Main St" {...register('address.street')} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="City" placeholder="Austin" {...register('address.city')} />
            <Input label="State" placeholder="TX" {...register('address.state')} />
            <Input label="ZIP" placeholder="78701" {...register('address.zip')} />
          </div>
        </div>
      </details>

      {/* Social */}
      <details className="group">
        <summary className="text-sm font-medium text-gray-700 cursor-pointer list-none flex items-center gap-1 select-none">
          <svg className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Social Links (optional)
        </summary>
        <div className="mt-3 space-y-3">
          <Input label="LinkedIn URL" type="url" placeholder="https://linkedin.com/in/..." {...register('socialLinks.linkedin')} />
          <Input label="Twitter URL" type="url" placeholder="https://twitter.com/..." {...register('socialLinks.twitter')} />
          <Input label="Website" type="url" placeholder="https://example.com" {...register('socialLinks.website')} />
        </div>
      </details>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  )
}
