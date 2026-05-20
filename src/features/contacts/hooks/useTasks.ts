import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '@/lib/api'
import { contactKeys } from './useContacts'
import type { TaskFormValues } from '@/lib/schemas'
import { useToast } from '@/store/toastStore'

export function useTasks(contactId: string) {
  return useQuery({
    queryKey: contactKeys.tasks(contactId),
    queryFn: () => api.fetchTasks(contactId),
    staleTime: 30_000,
  })
}

export function useCreateTask(contactId: string) {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (values: TaskFormValues) => api.createTask(contactId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contactKeys.tasks(contactId) })
      toast('Task created', 'success')
    },
    onError: () => toast('Failed to create task', 'error'),
  })
}

export function useUpdateTask(contactId: string) {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ taskId, values }: { taskId: string; values: Partial<TaskFormValues> }) =>
      api.updateTask(contactId, taskId, values),
    onMutate: async ({ taskId, values }) => {
      await qc.cancelQueries({ queryKey: contactKeys.tasks(contactId) })
      const prev = qc.getQueryData(contactKeys.tasks(contactId))
      qc.setQueryData(contactKeys.tasks(contactId), (old: { id: string }[] | undefined) =>
        old?.map((t) => (t.id === taskId ? { ...t, ...values } : t)),
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(contactKeys.tasks(contactId), ctx.prev)
      toast('Failed to update task', 'error')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: contactKeys.tasks(contactId) }),
  })
}

export function useDeleteTask(contactId: string) {
  const qc = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (taskId: string) => api.deleteTask(contactId, taskId),
    onMutate: async (taskId) => {
      await qc.cancelQueries({ queryKey: contactKeys.tasks(contactId) })
      const prev = qc.getQueryData(contactKeys.tasks(contactId))
      qc.setQueryData(contactKeys.tasks(contactId), (old: { id: string }[] | undefined) =>
        old?.filter((t) => t.id !== taskId),
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(contactKeys.tasks(contactId), ctx.prev)
      toast('Failed to delete task', 'error')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: contactKeys.tasks(contactId) }),
  })
}
