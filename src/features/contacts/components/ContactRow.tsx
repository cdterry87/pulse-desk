import { memo } from 'react'
import type { Contact } from '@/types'
import { StatusBadge, TagBadge } from '@/components/ui/Badge'

interface ContactRowProps {
  contact: Contact
  isSelected: boolean
  onSelect: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export const ContactRow = memo(function ContactRow({
  contact,
  isSelected,
  onSelect,
  onToggleFavorite,
}: ContactRowProps) {
  return (
    <div
      role="row"
      aria-selected={isSelected}
      onClick={() => onSelect(contact.id)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(contact.id)}
      tabIndex={0}
      className={`flex items-center gap-4 px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors group
        ${isSelected ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : 'hover:bg-gray-50'}`}
    >
      {/* Avatar */}
      <img
        src={contact.avatarUrl}
        alt=""
        className="w-9 h-9 rounded-full flex-shrink-0 bg-gray-100"
        loading="lazy"
      />

      {/* Name + email */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {contact.firstName} {contact.lastName}
        </p>
        <p className="text-xs text-gray-500 truncate">{contact.email}</p>
      </div>

      {/* Company */}
      <p className="text-xs text-gray-500 w-36 truncate hidden md:block">{contact.company}</p>

      {/* Status */}
      <div className="flex-shrink-0 hidden sm:block">
        <StatusBadge status={contact.status} />
      </div>

      {/* Tags */}
      <div className="flex gap-1 flex-shrink-0 hidden lg:flex">
        {contact.tags.slice(0, 2).map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>

      {/* Favorite star */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite(contact.id)
        }}
        className={`flex-shrink-0 p-1 rounded transition-colors ${
          contact.isFavorite
            ? 'text-yellow-400'
            : 'text-gray-200 group-hover:text-gray-300 hover:text-yellow-400'
        }`}
        aria-label={contact.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg className="w-4 h-4" fill={contact.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </button>
    </div>
  )
})
