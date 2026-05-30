import { createClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EditEventForm from './EditEventForm'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  // Verify ownership
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user.id).single()
  if (!profile?.school_id) redirect('/')

  // Fetch event
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('school_id', profile.school_id)
    .single()

  if (!event) {
    redirect('/schools/events')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
        <Link href="/schools/events" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
          &larr; Back to Events
        </Link>
      </div>

      <EditEventForm event={event} />
    </div>
  )
}
