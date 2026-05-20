import { useState, useCallback } from 'react'
import type { ContactFilters, ContactStatus, ContactTag } from '@/types'

const DEFAULT_FILTERS: ContactFilters = {
  search: '',
  status: 'all',
  tags: [],
  favoritesOnly: false,
  sortBy: 'name',
  sortDir: 'asc',
}

export function useContactFilters() {
  const [filters, setFilters] = useState<ContactFilters>(DEFAULT_FILTERS)

  const setSearch = useCallback((search: string) => {
    setFilters((f) => ({ ...f, search }))
  }, [])

  const setStatus = useCallback((status: ContactStatus | 'all') => {
    setFilters((f) => ({ ...f, status }))
  }, [])

  const toggleTag = useCallback((tag: ContactTag) => {
    setFilters((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }))
  }, [])

  const toggleFavoritesOnly = useCallback(() => {
    setFilters((f) => ({ ...f, favoritesOnly: !f.favoritesOnly }))
  }, [])

  const setSort = useCallback((sortBy: ContactFilters['sortBy']) => {
    setFilters((f) => ({
      ...f,
      sortBy,
      sortDir: f.sortBy === sortBy && f.sortDir === 'asc' ? 'desc' : 'asc',
    }))
  }, [])

  const reset = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  const isFiltered =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.tags.length > 0 ||
    filters.favoritesOnly

  return { filters, setSearch, setStatus, toggleTag, toggleFavoritesOnly, setSort, reset, isFiltered }
}
