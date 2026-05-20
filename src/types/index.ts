export type ContactStatus = 'active' | 'inactive' | 'prospect' | 'churned'
export type ContactTag = 'vip' | 'partner' | 'lead' | 'customer' | 'vendor'

export interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  jobTitle: string
  status: ContactStatus
  tags: ContactTag[]
  avatarUrl: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  address?: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
  socialLinks?: {
    linkedin?: string
    twitter?: string
    website?: string
  }
}

export interface Note {
  id: string
  contactId: string
  content: string
  createdAt: string
  updatedAt: string
  authorName: string
}

export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Task {
  id: string
  contactId: string
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export type ActivityType =
  | 'contact_created'
  | 'contact_updated'
  | 'contact_deleted'
  | 'note_added'
  | 'task_created'
  | 'task_completed'
  | 'favorite_toggled'

export interface Activity {
  id: string
  type: ActivityType
  contactId: string
  contactName: string
  description: string
  createdAt: string
  metadata?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasNextPage: boolean
}

export interface ContactFilters {
  search: string
  status: ContactStatus | 'all'
  tags: ContactTag[]
  favoritesOnly: boolean
  sortBy: 'name' | 'company' | 'createdAt' | 'updatedAt'
  sortDir: 'asc' | 'desc'
}
