import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '@/lib/api'
import { contactKeys } from './useContacts'
import type { NoteFormValues } from '@/lib/schemas'
import { useToast } from '@/store/toastStore'

export function useNotes(contactId: string) {
  return useQuery({
    queryKey: contactKeys.notes(contactId),
    queryFn: () => api.fetchNotes(contactId),
    staleTime: 30_000,
  })
}

export function useCreateNote(contactId: string) {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (values: NoteFormValues) => api.createNote(contactId, values),
    onMutate: async (values) => {
      await qc.cancelQueries({ queryKey: contactKeys.notes(contactId) })
      const prev = qc.getQueryData(contactKeys.notes(contactId))
      // Optimistic insert
      qc.setQueryData(contactKeys.notes(contactId), (old: import('@/types').Note[] | undefined) => {
        const optimistic = {
          id: `optimistic-${Date.now()}`,
          contactId,
          content: values.content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          authorName: 'Chase Terry',
        }
        return old ? [optimistic, ...old] : [optimistic]
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(contactKeys.notes(contactId), ctx.prev)
      toast('Failed to add note', 'error')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: contactKeys.notes(contactId) }),
  })
}

export function useDeleteNote(contactId: string) {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (noteId: string) => api.deleteNote(contactId, noteId),
    onMutate: async (noteId) => {
      await qc.cancelQueries({ queryKey: contactKeys.notes(contactId) })
      const prev = qc.getQueryData(contactKeys.notes(contactId))
      qc.setQueryData(contactKeys.notes(contactId), (old: { id: string }[] | undefined) =>
        old?.filter((n) => n.id !== noteId),
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(contactKeys.notes(contactId), ctx.prev)
      toast('Failed to delete note', 'error')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: contactKeys.notes(contactId) }),
  })
}
