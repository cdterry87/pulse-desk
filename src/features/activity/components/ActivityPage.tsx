import { useQuery } from '@tanstack/react-query'
import { fetchActivities } from '@/lib/api'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Activity, ActivityType } from '@/types'

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  contact_created: (
    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
  contact_updated: (
    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  contact_deleted: (
    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
    </svg>
  ),
  note_added: (
    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  task_created: (
    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  task_completed: (
    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  favorite_toggled: (
    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
}

const ICON_BG: Record<ActivityType, string> = {
  contact_created: 'bg-green-50',
  contact_updated: 'bg-blue-50',
  contact_deleted: 'bg-red-50',
  note_added: 'bg-indigo-50',
  task_created: 'bg-purple-50',
  task_completed: 'bg-green-50',
  favorite_toggled: 'bg-yellow-50',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function ActivityItem({ activity }: { activity: Activity }) {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${ICON_BG[activity.type]}`}>
        {ACTIVITY_ICONS[activity.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800">{activity.description}</p>
        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(activity.createdAt)}</p>
      </div>
    </div>
  )
}

export function ActivityPage() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: fetchActivities,
    staleTime: 10_000,
  })

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin p-6 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Activity Feed</h1>
        <p className="text-sm text-gray-500 mt-1">Recent changes across all contacts</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 px-4 divide-y divide-gray-100">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-4">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))
        ) : activities?.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No activity yet</p>
        ) : (
          activities?.map((a) => <ActivityItem key={a.id} activity={a} />)
        )}
      </div>
    </div>
  )
}
