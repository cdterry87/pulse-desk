import type { ReactNode } from 'react'
import type { ContactStatus, ContactTag, TaskPriority, TaskStatus } from '@/types'

const STATUS_STYLES: Record<ContactStatus, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  prospect: 'bg-blue-100 text-blue-700',
  churned: 'bg-red-100 text-red-600',
}

const TAG_STYLES: Record<ContactTag, string> = {
  vip: 'bg-purple-100 text-purple-700',
  partner: 'bg-indigo-100 text-indigo-700',
  lead: 'bg-yellow-100 text-yellow-700',
  customer: 'bg-teal-100 text-teal-700',
  vendor: 'bg-orange-100 text-orange-700',
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-600',
}

const TASK_STATUS_STYLES: Record<TaskStatus, string> = {
  todo: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
}

interface BadgeProps {
  children: ReactNode
  className?: string
}

function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: ContactStatus }) {
  return <Badge className={STATUS_STYLES[status]}>{status}</Badge>
}

export function TagBadge({ tag }: { tag: ContactTag }) {
  return <Badge className={TAG_STYLES[tag]}>{tag}</Badge>
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge className={PRIORITY_STYLES[priority]}>{priority}</Badge>
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const labels: Record<TaskStatus, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
  }
  return <Badge className={TASK_STATUS_STYLES[status]}>{labels[status]}</Badge>
}
