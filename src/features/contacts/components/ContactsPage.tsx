import { useState, useMemo } from 'react'
import { useContactFilters } from '@/hooks/useContactFilters'
import { useDebounce } from '@/hooks/useDebounce'
import { useContactsInfinite, useCreateContact, useToggleFavorite } from '../hooks/useContacts'
import { FilterBar } from './FilterBar'
import { ContactList } from './ContactList'
import { ContactDetail } from './ContactDetail'
import { ContactForm } from './ContactForm'
import { useModal } from '@/store/modalStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcut'
import type { ContactFormValues } from '@/lib/schemas'

export function ContactsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { filters, setSearch, setStatus, toggleTag, toggleFavoritesOnly, setSort, reset, isFiltered } = useContactFilters()
  const { open: openModal, close: closeModal } = useModal()

  // Debounce the search input before sending to query
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)

  const debouncedFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  )

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useContactsInfinite(debouncedFilters)
  const createContact = useCreateContact()
  const toggleFavorite = useToggleFavorite()

  const contacts = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data])
  const total = data?.pages[0]?.total ?? 0

  const handleSearchChange = (v: string) => {
    setSearchInput(v)
    setSearch(v)
  }

  const handleNew = () => {
    const onSubmit = async (values: ContactFormValues) => {
      const contact = await createContact.mutateAsync(values)
      closeModal()
      setSelectedId(contact.id)
    }
    openModal(<ContactForm onSubmit={onSubmit} onCancel={closeModal} submitLabel="Create Contact" />, 'New Contact')
  }

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'n', handler: handleNew },
    { key: 'Escape', handler: () => setSelectedId(null), ignoreWhenEditing: false },
  ])

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel: list */}
      <div className={`flex flex-col border-r border-gray-200 bg-white transition-all duration-200 ${selectedId ? 'w-[55%]' : 'flex-1'}`}>
        <FilterBar
          filters={filters}
          total={total}
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          onStatusChange={setStatus}
          onTagToggle={toggleTag}
          onFavoritesToggle={toggleFavoritesOnly}
          onSortChange={setSort}
          onReset={reset}
          isFiltered={isFiltered}
          onNew={handleNew}
        />
        <ContactList
          contacts={contacts}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onToggleFavorite={(id) => toggleFavorite.mutate(id)}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={!!hasNextPage}
          fetchNextPage={fetchNextPage}
        />
      </div>

      {/* Right panel: detail */}
      {selectedId && (
        <div className="w-[45%] bg-white overflow-hidden flex flex-col">
          <ContactDetail contactId={selectedId} onClose={() => setSelectedId(null)} />
        </div>
      )}
    </div>
  )
}
