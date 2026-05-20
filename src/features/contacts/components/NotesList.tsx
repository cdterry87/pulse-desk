import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { noteSchema } from '@/lib/schemas'
import type { NoteFormValues } from '@/lib/schemas'
import { useNotes, useCreateNote, useDeleteNote } from '../hooks/useNotes'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function NotesList({ contactId }: { contactId: string }) {
  const { data: notes, isLoading } = useNotes(contactId)
  const createNote = useCreateNote(contactId)
  const deleteNote = useDeleteNote(contactId)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
  })

  const onSubmit = async (values: NoteFormValues) => {
    await createNote.mutateAsync(values)
    reset()
  }

  return (
    <div className="space-y-4">
      {/* Add note form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <textarea
          placeholder="Add a note…"
          rows={3}
          className={`w-full px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.content ? 'border-red-400' : 'border-gray-200'}`}
          {...register('content')}
        />
        {errors.content && <p className="text-xs text-red-600">{errors.content.message}</p>}
        <div className="flex justify-end">
          <Button type="submit" size="sm" variant="primary" loading={isSubmitting}>
            Add Note
          </Button>
        </div>
      </form>

      {/* Notes list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : notes?.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No notes yet</p>
      ) : (
        <div className="space-y-3">
          {notes?.map((note) => (
            <div key={note.id} className="bg-gray-50 rounded-lg p-3 text-sm group relative">
              <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{note.authorName} · {formatDate(note.createdAt)}</span>
                <button
                  onClick={() => deleteNote.mutate(note.id)}
                  className="text-xs text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Delete note"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
