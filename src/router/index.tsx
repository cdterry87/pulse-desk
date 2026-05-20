import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { ContactRowSkeleton } from '@/components/ui/Skeleton'

const ContactsPage = lazy(() =>
  import('@/features/contacts/components/ContactsPage').then((m) => ({ default: m.ContactsPage })),
)
const ActivityPage = lazy(() =>
  import('@/features/activity/components/ActivityPage').then((m) => ({ default: m.ActivityPage })),
)

function PageSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 p-4 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <ContactRowSkeleton key={i} />)}
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell><PageSuspense><Navigate to="/contacts" replace /></PageSuspense></AppShell>,
  },
  {
    path: '/contacts',
    element: <AppShell><PageSuspense><ContactsPage /></PageSuspense></AppShell>,
  },
  {
    path: '/activity',
    element: <AppShell><PageSuspense><ActivityPage /></PageSuspense></AppShell>,
  },
])
