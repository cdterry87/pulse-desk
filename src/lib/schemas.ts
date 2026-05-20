import { z } from 'zod'

export const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Phone number too short').max(20),
  company: z.string().min(1, 'Company is required').max(100),
  jobTitle: z.string().min(1, 'Job title is required').max(100),
  status: z.enum(['active', 'inactive', 'prospect', 'churned']),
  tags: z.array(z.enum(['vip', 'partner', 'lead', 'customer', 'vendor'])).default([]),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
  }).optional(),
})

export type ContactFormValues = z.infer<typeof contactSchema>

export const noteSchema = z.object({
  content: z.string().min(1, 'Note cannot be empty').max(2000),
})

export type NoteFormValues = z.infer<typeof noteSchema>

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in_progress', 'done']),
  dueDate: z.string().optional(),
})

export type TaskFormValues = z.infer<typeof taskSchema>
