import { faker } from '@faker-js/faker'
import type { Contact, Note, Task, Activity, ContactStatus, ContactTag, ActivityType } from '@/types'

faker.seed(42)

const STATUSES: ContactStatus[] = ['active', 'inactive', 'prospect', 'churned']
const TAGS: ContactTag[] = ['vip', 'partner', 'lead', 'customer', 'vendor']

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function generateContact(index: number): Contact {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const createdAt = faker.date.between({ from: '2022-01-01', to: '2024-12-31' }).toISOString()
  return {
    id: `contact-${index}`,
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    phone: faker.phone.number({ style: 'national' }),
    company: faker.company.name(),
    jobTitle: faker.person.jobTitle(),
    status: faker.helpers.arrayElement(STATUSES),
    tags: pickRandom(TAGS, faker.number.int({ min: 0, max: 3 })),
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
    isFavorite: faker.datatype.boolean(0.1),
    createdAt,
    updatedAt: faker.date.between({ from: createdAt, to: '2025-01-01' }).toISOString(),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zip: faker.location.zipCode(),
      country: 'US',
    },
    socialLinks: {
      linkedin: faker.datatype.boolean(0.6) ? `https://linkedin.com/in/${faker.internet.username()}` : undefined,
      twitter: faker.datatype.boolean(0.4) ? `https://twitter.com/${faker.internet.username()}` : undefined,
      website: faker.datatype.boolean(0.3) ? faker.internet.url() : undefined,
    },
  }
}

// Generate once and cache
let _contacts: Contact[] | null = null

export function getAllContacts(): Contact[] {
  if (!_contacts) {
    _contacts = Array.from({ length: 10000 }, (_, i) => generateContact(i))
  }
  return _contacts
}

export function generateNotesForContact(contactId: string, count = 3): Note[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `note-${contactId}-${i}`,
    contactId,
    content: faker.lorem.paragraph(),
    createdAt: faker.date.recent({ days: 90 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
    authorName: 'Chase Terry',
  }))
}

export function generateTasksForContact(contactId: string, count = 2): Task[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `task-${contactId}-${i}`,
    contactId,
    title: faker.hacker.phrase(),
    description: faker.datatype.boolean(0.5) ? faker.lorem.sentence() : undefined,
    priority: faker.helpers.arrayElement(['low', 'medium', 'high'] as const),
    status: faker.helpers.arrayElement(['todo', 'in_progress', 'done'] as const),
    dueDate: faker.datatype.boolean(0.6) ? faker.date.soon({ days: 30 }).toISOString() : undefined,
    createdAt: faker.date.recent({ days: 60 }).toISOString(),
    updatedAt: faker.date.recent({ days: 10 }).toISOString(),
  }))
}

const ACTIVITY_TEMPLATES: Record<ActivityType, (name: string) => string> = {
  contact_created: (name) => `Contact "${name}" was created`,
  contact_updated: (name) => `Contact "${name}" was updated`,
  contact_deleted: (name) => `Contact "${name}" was deleted`,
  note_added: (name) => `A note was added to "${name}"`,
  task_created: (name) => `A task was created for "${name}"`,
  task_completed: (name) => `A task was completed for "${name}"`,
  favorite_toggled: (name) => `"${name}" was starred`,
}

let _activities: Activity[] | null = null

export function generateInitialActivities(): Activity[] {
  if (_activities) return _activities
  const contacts = getAllContacts().slice(0, 50)
  const types = Object.keys(ACTIVITY_TEMPLATES) as ActivityType[]
  _activities = Array.from({ length: 100 }, (_, i) => {
    const contact = contacts[i % contacts.length]
    const type = faker.helpers.arrayElement(types)
    const name = `${contact.firstName} ${contact.lastName}`
    return {
      id: `activity-${i}`,
      type,
      contactId: contact.id,
      contactName: name,
      description: ACTIVITY_TEMPLATES[type](name),
      createdAt: faker.date.recent({ days: 30 }).toISOString(),
    }
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return _activities
}

export function addActivity(activity: Omit<Activity, 'id' | 'createdAt'>): Activity {
  const activities = generateInitialActivities()
  const newActivity: Activity = {
    ...activity,
    id: `activity-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  activities.unshift(newActivity)
  return newActivity
}
