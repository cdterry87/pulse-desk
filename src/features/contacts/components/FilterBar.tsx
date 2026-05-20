import { useRef, useEffect } from 'react'
import type { ContactFilters, ContactStatus, ContactTag } from '@/types'
import { Button } from '@/components/ui/Button'

const STATUSES: Array<{ value: ContactStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'churned', label: 'Churned' },
]

const TAGS: ContactTag[] = ['vip', 'partner', 'lead', 'customer', 'vendor']

const SORT_OPTIONS: Array<{ value: ContactFilters['sortBy']; label: string }> = [
  { value: 'name', label: 'Name' },
  { value: 'company', label: 'Company' },
  { value: 'createdAt', label: 'Created' },
  { value: 'updatedAt', label: 'Updated' },
]

interface FilterBarProps {
  filters: ContactFilters
  total: number
  searchValue: string
  onSearchChange: (v: string) => void
  onStatusChange: (v: ContactStatus | 'all') => void
  onTagToggle: (t: ContactTag) => void
  onFavoritesToggle: () => void
  onSortChange: (v: ContactFilters['sortBy']) => void
  onReset: () => void
  isFiltered: boolean
  onNew: () => void
}

export function FilterBar({
  filters,
  total,
  searchValue,
  onSearchChange,
  onStatusChange,
  onTagToggle,
  onFavoritesToggle,
  onSortChange,
  onReset,
  isFiltered,
  onNew,
}: FilterBarProps) {
  const searchRef = useRef<HTMLInputElement>(null)

  // Focus search on '/' keypress
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3 space-y-3">
      {/* Top row: search + new button */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
            type="search"
            placeholder="Search contacts… (/)"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            aria-label="Search contacts"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{total.toLocaleString()} contacts</span>
        </div>

        {isFiltered && (
          <Button size="sm" variant="ghost" onClick={onReset}>
            Clear filters
          </Button>
        )}

        <Button
          size="sm"
          variant="primary"
          onClick={onNew}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          New Contact
        </Button>
      </div>

      {/* Bottom row: status + tags + favorites + sort */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Status pills */}
        <div className="flex items-center gap-1" role="group" aria-label="Filter by status">
          {STATUSES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onStatusChange(value)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filters.status === value
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-gray-200" />

        {/* Tag filters */}
        <div className="flex items-center gap-1" role="group" aria-label="Filter by tag">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filters.tags.includes(tag)
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-gray-200" />

        {/* Favorites toggle */}
        <button
          onClick={onFavoritesToggle}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            filters.favoritesOnly ? 'bg-yellow-100 text-yellow-700' : 'text-gray-600 hover:bg-gray-100'
          }`}
          aria-pressed={filters.favoritesOnly}
        >
          <svg className="w-3.5 h-3.5" fill={filters.favoritesOnly ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Starred
        </button>

        <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
          <span>Sort:</span>
          {SORT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onSortChange(value)}
              className={`flex items-center gap-0.5 px-2 py-1 rounded transition-colors ${
                filters.sortBy === value ? 'text-indigo-600 font-medium' : 'hover:text-gray-900'
              }`}
            >
              {label}
              {filters.sortBy === value && (
                <span className="text-xs">{filters.sortDir === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
