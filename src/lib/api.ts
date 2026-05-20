import type {
  Contact,
  Note,
  Task,
  Activity,
  PaginatedResponse,
  ContactFilters,
} from '@/types'
import type { ContactFormValues, NoteFormValues, TaskFormValues } from '@/lib/schemas'
import {
  getAllContacts,
  generateNotesForContact,
  generateTasksForContact,
  generateInitialActivities,
  addActivity,
} from '@/lib/mockData'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// In-memory stores, initialized lazily
const notesStore = new Map<string, Note[]>()
const tasksStore = new Map<string, Task[]>()

function getNotes(contactId: string): Note[] {
  if (!notesStore.has(contactId)) {
    notesStore.set(contactId, generateNotesForContact(contactId))
  }
  return notesStore.get(contactId)!
}

function getTasks(contactId: string): Task[] {
  if (!tasksStore.has(contactId)) {
    tasksStore.set(contactId, generateTasksForContact(contactId))
  }
  return tasksStore.get(contactId)!
}

// --- Contacts ---

export async function fetchContacts(
  filters: ContactFilters,
  page: number,
  pageSize: number,
): Promise<PaginatedResponse<Contact>> {
  await delay(80)

  let contacts = getAllContacts()

  const q = filters.search.trim().toLowerCase()
  if (q) {
    contacts = contacts.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q),
    )
  }

  if (filters.status !== 'all') {
    contacts = contacts.filter((c) => c.status === filters.status)
  }

  if (filters.tags.length > 0) {
    contacts = contacts.filter((c) => filters.tags.some((t) => c.tags.includes(t)))
  }

  if (filters.favoritesOnly) {
    contacts = contacts.filter((c) => c.isFavorite)
  }

  contacts = [...contacts].sort((a, b) => {
    let aVal: string
    let bVal: string
    switch (filters.sortBy) {
      case 'name':
        aVal = `${a.firstName} ${a.lastName}`
        bVal = `${b.firstName} ${b.lastName}`
        break
      case 'company':
        aVal = a.company
        bVal = b.company
        break
      case 'createdAt':
        aVal = a.createdAt
        bVal = b.createdAt
        break
      case 'updatedAt':
        aVal = a.updatedAt
        bVal = b.updatedAt
        break
    }
    return filters.sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
  })

  const total = contacts.length
  const start = (page - 1) * pageSize
  const data = contacts.slice(start, start + pageSize)

  return {
    data,
    total,
    page,
    pageSize,
    hasNextPage: start + pageSize < total,
  }
}

export async function fetchContact(id: string): Promise<Contact> {
  await delay(50)
  const contact = getAllContacts().find((c) => c.id === id)
  if (!contact) throw new Error(`Contact ${id} not found`)
  return { ...contact }
}

export async function createContact(values: ContactFormValues): Promise<Contact> {
  await delay(150)
  const contacts = getAllContacts()
  const now = new Date().toISOString()
  const newContact: Contact = {
    id: `contact-${Date.now()}`,
    ...values,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.firstName}${values.lastName}`,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  }
  contacts.unshift(newContact)
  addActivity({
    type: 'contact_created',
    contactId: newContact.id,
    contactName: `${newContact.firstName} ${newContact.lastName}`,
    description: `Contact "${newContact.firstName} ${newContact.lastName}" was created`,
  })
  return newContact
}

export async function updateContact(id: string, values: Partial<ContactFormValues>): Promise<Contact> {
  await delay(120)
  const contacts = getAllContacts()
  const idx = contacts.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error(`Contact ${id} not found`)
  const updated = { ...contacts[idx], ...values, updatedAt: new Date().toISOString() }
  contacts[idx] = updated
  addActivity({
    type: 'contact_updated',
    contactId: id,
    contactName: `${updated.firstName} ${updated.lastName}`,
    description: `Contact "${updated.firstName} ${updated.lastName}" was updated`,
  })
  return updated
}

export async function deleteContact(id: string): Promise<void> {
  await delay(100)
  const contacts = getAllContacts()
  const idx = contacts.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error(`Contact ${id} not found`)
  const [removed] = contacts.splice(idx, 1)
  addActivity({
    type: 'contact_deleted',
    contactId: id,
    contactName: `${removed.firstName} ${removed.lastName}`,
    description: `Contact "${removed.firstName} ${removed.lastName}" was deleted`,
  })
}

export async function toggleFavorite(id: string): Promise<Contact> {
  await delay(50)
  const contacts = getAllContacts()
  const idx = contacts.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error(`Contact ${id} not found`)
  contacts[idx] = { ...contacts[idx], isFavorite: !contacts[idx].isFavorite }
  addActivity({
    type: 'favorite_toggled',
    contactId: id,
    contactName: `${contacts[idx].firstName} ${contacts[idx].lastName}`,
    description: `"${contacts[idx].firstName} ${contacts[idx].lastName}" was ${contacts[idx].isFavorite ? 'starred' : 'unstarred'}`,
  })
  return contacts[idx]
}

// --- Notes ---

export async function fetchNotes(contactId: string): Promise<Note[]> {
  await delay(60)
  return [...getNotes(contactId)]
}

export async function createNote(contactId: string, values: NoteFormValues): Promise<Note> {
  await delay(100)
  const notes = getNotes(contactId)
  const now = new Date().toISOString()
  const note: Note = {
    id: `note-${Date.now()}`,
    contactId,
    content: values.content,
    createdAt: now,
    updatedAt: now,
    authorName: 'Chase Terry',
  }
  notes.unshift(note)
  return note
}

export async function deleteNote(contactId: string, noteId: string): Promise<void> {
  await delay(80)
  const notes = getNotes(contactId)
  const idx = notes.findIndex((n) => n.id === noteId)
  if (idx !== -1) notes.splice(idx, 1)
}

// --- Tasks ---

export async function fetchTasks(contactId: string): Promise<Task[]> {
  await delay(60)
  return [...getTasks(contactId)]
}

export async function createTask(contactId: string, values: TaskFormValues): Promise<Task> {
  await delay(100)
  const tasks = getTasks(contactId)
  const now = new Date().toISOString()
  const task: Task = {
    id: `task-${Date.now()}`,
    contactId,
    ...values,
    createdAt: now,
    updatedAt: now,
  }
  tasks.unshift(task)
  return task
}

export async function updateTask(contactId: string, taskId: string, values: Partial<TaskFormValues>): Promise<Task> {
  await delay(80)
  const tasks = getTasks(contactId)
  const idx = tasks.findIndex((t) => t.id === taskId)
  if (idx === -1) throw new Error(`Task ${taskId} not found`)
  tasks[idx] = { ...tasks[idx], ...values, updatedAt: new Date().toISOString() }
  return tasks[idx]
}

export async function deleteTask(contactId: string, taskId: string): Promise<void> {
  await delay(80)
  const tasks = getTasks(contactId)
  const idx = tasks.findIndex((t) => t.id === taskId)
  if (idx !== -1) tasks.splice(idx, 1)
}

// --- Activity ---

export async function fetchActivities(): Promise<Activity[]> {
  await delay(70)
  return [...generateInitialActivities()]
}
