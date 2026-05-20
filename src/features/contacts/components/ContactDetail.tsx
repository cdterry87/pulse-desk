import { useState } from 'react'
import { useContact, useToggleFavorite, useDeleteContact, useUpdateContact } from '../hooks/useContacts'
import { NotesList } from './NotesList'
import { TasksList } from './TasksList'
import { ContactForm } from './ContactForm'
import { StatusBadge, TagBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ContactDetailSkeleton } from '@/components/ui/Skeleton'
import { useModal } from '@/store/modalStore'
import type { ContactFormValues } from '@/lib/schemas'

type Tab = 'details' | 'notes' | 'tasks'

interface ContactDetailProps {
  contactId: string
  onClose: () => void
}

export function ContactDetail({ contactId, onClose }: ContactDetailProps) {
  const { data: contact, isLoading } = useContact(contactId)
  const toggleFavorite = useToggleFavorite()
  const deleteContact = useDeleteContact()
  const updateContact = useUpdateContact()
  const { open: openModal, close: closeModal } = useModal()
  const [tab, setTab] = useState<Tab>('details')

  if (isLoading) return <ContactDetailSkeleton />
  if (!contact) return null

  const fullName = `${contact.firstName} ${contact.lastName}`

  const handleEdit = () => {
    const onSubmit = async (values: ContactFormValues) => {
      await updateContact.mutateAsync({ id: contactId, values })
      closeModal()
    }
    openModal(
      <ContactForm
        defaultValues={contact}
        onSubmit={onSubmit}
        onCancel={closeModal}
        submitLabel="Save Changes"
      />,
      `Edit ${fullName}`,
    )
  }

  const handleDelete = async () => {
    if (!confirm(`Delete ${fullName}? This cannot be undone.`)) return
    await deleteContact.mutateAsync(contactId)
    onClose()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-4 px-5 py-4 border-b border-gray-100">
        <img
          src={contact.avatarUrl}
          alt=""
          className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-900 truncate">{fullName}</h2>
            <button
              onClick={() => toggleFavorite.mutate(contactId)}
              className={`flex-shrink-0 transition-colors ${contact.isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
              aria-label={contact.isFavorite ? 'Remove from favorites' : 'Star contact'}
            >
              <svg className="w-4 h-4" fill={contact.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 truncate">{contact.jobTitle} · {contact.company}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="ghost" onClick={handleEdit}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={onClose} aria-label="Close panel">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-5">
        {(['details', 'notes', 'tasks'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
        {tab === 'details' && (
          <div className="space-y-5">
            {/* Status + tags */}
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={contact.status} />
              {contact.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
            </div>

            {/* Contact info */}
            <dl className="space-y-3 text-sm">
              <DetailRow label="Email">
                <a href={`mailto:${contact.email}`} className="text-indigo-600 hover:underline">{contact.email}</a>
              </DetailRow>
              <DetailRow label="Phone">
                <a href={`tel:${contact.phone}`} className="text-indigo-600 hover:underline">{contact.phone}</a>
              </DetailRow>
              <DetailRow label="Company">{contact.company}</DetailRow>
              <DetailRow label="Title">{contact.jobTitle}</DetailRow>
              {contact.address?.city && (
                <DetailRow label="Location">
                  {contact.address.city}, {contact.address.state}
                </DetailRow>
              )}
            </dl>

            {/* Social links */}
            {(contact.socialLinks?.linkedin || contact.socialLinks?.twitter || contact.socialLinks?.website) && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Links</p>
                <div className="flex flex-wrap gap-2">
                  {contact.socialLinks.linkedin && (
                    <a href={contact.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline">LinkedIn</a>
                  )}
                  {contact.socialLinks.twitter && (
                    <a href={contact.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline">Twitter</a>
                  )}
                  {contact.socialLinks.website && (
                    <a href={contact.socialLinks.website} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline">Website</a>
                  )}
                </div>
              </div>
            )}

            {/* Danger zone */}
            <div className="pt-4 border-t border-gray-100">
              <Button size="sm" variant="danger" onClick={handleDelete} loading={deleteContact.isPending}>
                Delete Contact
              </Button>
            </div>
          </div>
        )}

        {tab === 'notes' && <NotesList contactId={contactId} />}
        {tab === 'tasks' && <TasksList contactId={contactId} />}
      </div>
    </div>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 flex-shrink-0 text-gray-400 font-medium">{label}</dt>
      <dd className="text-gray-800 min-w-0">{children}</dd>
    </div>
  )
}
