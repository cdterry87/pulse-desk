import { useRef, useEffect, useCallback } from 'react'
import type { Contact } from '@/types'
import { ContactRow } from './ContactRow'
import { ContactRowSkeleton } from '@/components/ui/Skeleton'

interface ContactListProps {
  contacts: Contact[]
  selectedId: string | null
  onSelect: (id: string) => void
  onToggleFavorite: (id: string) => void
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
  isLoading: boolean
}

export function ContactList({
  contacts,
  selectedId,
  onSelect,
  onToggleFavorite,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  isLoading,
}: ContactListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Infinite scroll via IntersectionObserver
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(handleObserver, { rootMargin: '200px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleObserver])

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto" role="table" aria-label="Contacts">
        {Array.from({ length: 12 }).map((_, i) => <ContactRowSkeleton key={i} />)}
      </div>
    )
  }

  if (contacts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-sm font-medium">No contacts found</p>
        <p className="text-xs">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin" role="table" aria-label="Contacts list">
      <div role="rowgroup">
        {contacts.map((contact) => (
          <ContactRow
            key={contact.id}
            contact={contact}
            isSelected={contact.id === selectedId}
            onSelect={onSelect}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-1" aria-hidden="true" />

      {isFetchingNextPage && (
        <div className="py-4">
          {Array.from({ length: 3 }).map((_, i) => <ContactRowSkeleton key={i} />)}
        </div>
      )}

      {!hasNextPage && contacts.length > 0 && (
        <p className="text-center text-xs text-gray-400 py-4">
          All {contacts.length.toLocaleString()} contacts loaded
        </p>
      )}
    </div>
  )
}
