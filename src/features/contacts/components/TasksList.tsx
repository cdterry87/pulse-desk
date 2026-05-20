import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema } from '@/lib/schemas'
import type { TaskFormValues } from '@/lib/schemas'
import type { Task } from '@/types'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks'
import { Button } from '@/components/ui/Button'
import { PriorityBadge, TaskStatusBadge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { useState } from 'react'

function TaskItem({
  task,
  onStatusToggle,
  onDelete,
}: {
  task: Task
  onStatusToggle: (task: Task) => void
  onDelete: (id: string) => void
}) {
  const isDone = task.status === 'done'
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg group">
      <button
        onClick={() => onStatusToggle(task)}
        className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
          isDone ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-indigo-500'
        }`}
        aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
      >
        {isDone && (
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <PriorityBadge priority={task.priority} />
          <TaskStatusBadge status={task.status} />
          {task.dueDate && (
            <span className="text-xs text-gray-400">
              Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
        aria-label="Delete task"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export function TasksList({ contactId }: { contactId: string }) {
  const { data: tasks, isLoading } = useTasks(contactId)
  const createTask = useCreateTask(contactId)
  const updateTask = useUpdateTask(contactId)
  const deleteTask = useDeleteTask(contactId)
  const [showForm, setShowForm] = useState(false)

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: 'medium', status: 'todo' },
  })

  const onSubmit = async (values: TaskFormValues) => {
    await createTask.mutateAsync(values)
    reset()
    setShowForm(false)
  }

  const handleStatusToggle = (task: Task) => {
    const next = task.status === 'done' ? 'todo' : 'done'
    updateTask.mutate({ taskId: task.id, values: { status: next } })
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" variant="ghost" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Add Task'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 rounded-lg p-3 space-y-3">
          <input
            placeholder="Task title"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            {...register('title')}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('priority')}
            >
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
            <input
              type="date"
              className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('dueDate')}
            />
          </div>
          <input type="hidden" value="todo" {...register('status')} />
          <Button type="submit" size="sm" variant="primary" loading={isSubmitting} className="w-full">
            Create Task
          </Button>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : tasks?.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No tasks yet</p>
      ) : (
        <div className="space-y-2">
          {tasks?.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusToggle={handleStatusToggle}
              onDelete={(id) => deleteTask.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
