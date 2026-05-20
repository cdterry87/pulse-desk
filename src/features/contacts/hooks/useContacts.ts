import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '@/lib/api'
import type { ContactFilters } from '@/types'
import type { ContactFormValues } from '@/lib/schemas'
import { useToast } from '@/store/toastStore'

const PAGE_SIZE = 50

export const contactKeys = {
  all: ['contacts'] as const,
  list: (filters: ContactFilters) => ['contacts', 'list', filters] as const,
  detail: (id: string) => ['contacts', 'detail', id] as const,
  notes: (id: string) => ['contacts', 'notes', id] as const,
  tasks: (id: string) => ['contacts', 'tasks', id] as const,
}

export function useContactsInfinite(filters: ContactFilters) {
  return useInfiniteQuery({
    queryKey: contactKeys.list(filters),
    queryFn: ({ pageParam }) => api.fetchContacts(filters, pageParam as number, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (last) => last.hasNextPage ? last.page + 1 : undefined,
    staleTime: 30_000,
  })
}

export function useContact(id: string | null) {
  return useQuery({
    queryKey: contactKeys.detail(id ?? ''),
    queryFn: () => api.fetchContact(id!),
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useCreateContact() {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (values: ContactFormValues) => api.createContact(values),
    onSuccess: (contact) => {
      qc.invalidateQueries({ queryKey: contactKeys.all })
      toast(`${contact.firstName} ${contact.lastName} was added`, 'success')
    },
    onError: () => toast('Failed to create contact', 'error'),
  })
}

export function useUpdateContact() {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<ContactFormValues> }) =>
      api.updateContact(id, values),
    onSuccess: (contact) => {
      qc.invalidateQueries({ queryKey: contactKeys.all })
      qc.setQueryData(contactKeys.detail(contact.id), contact)
      toast('Contact updated', 'success')
    },
    onError: () => toast('Failed to update contact', 'error'),
  })
}

export function useDeleteContact() {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => api.deleteContact(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contactKeys.all })
      toast('Contact deleted', 'info')
    },
    onError: () => toast('Failed to delete contact', 'error'),
  })
}

export function useToggleFavorite() {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => api.toggleFavorite(id),
    onMutate: async (id) => {
      // Optimistic update in detail cache
      await qc.cancelQueries({ queryKey: contactKeys.detail(id) })
      const prev = qc.getQueryData(contactKeys.detail(id))
      qc.setQueryData(contactKeys.detail(id), (old: ReturnType<typeof useContact>['data']) => {
        if (!old) return old
        return { ...old, isFavorite: !old.isFavorite }
      })
      return { prev, id }
    },
    onError: (_err, id, ctx) => {
      if (ctx?.prev) qc.setQueryData(contactKeys.detail(id), ctx.prev)
      toast('Failed to update favorite', 'error')
    },
    onSettled: (_data, _err, id) => {
      qc.invalidateQueries({ queryKey: contactKeys.list })
      qc.invalidateQueries({ queryKey: contactKeys.detail(id) })
    },
  })
}
