import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'

export default async function SchoolEventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user?.id)
    .single()

  const schoolId = profile?.school_id

  // Fetch events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('school_id', schoolId)
    .order('event_date', { ascending: true })

  // Determine event status
  const getStatus = (dateStr: string) => {
    const eventDate = new Date(dateStr)
    const today = new Date()
    return eventDate > today ? 'Upcoming' : 'Completed'
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-500 mt-1">Manage your fundraising runs and track performance</p>
        </div>
        <Link 
          href="/schools/events/new" 
          className="inline-flex justify-center items-center px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-700 transition shadow-sm"
        >
          + Create Event
        </Link>
      </div>

      {events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const status = getStatus(event.event_date)
            const isUpcoming = status === 'Upcoming'
            return (
              <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300 flex flex-col">
                {event.image_url ? (
                  <div className="h-48 w-full relative">
                    <img src={event.image_url} alt={event.name} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm backdrop-blur-md ${
                        isUpcoming ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'
                      }`}>
                        {status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 w-full relative bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white/30 text-5xl font-bold">{event.name.charAt(0)}</span>
                    <div className="absolute top-4 right-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm backdrop-blur-md ${
                        isUpcoming ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'
                      }`}>
                        {status}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{event.name}</h3>
                  </div>
                  
                  <div className="text-sm text-gray-500 space-y-1 mb-4 flex-grow">
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      {new Date(event.event_date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      {event.location}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Ticket Price</p>
                      <p className="text-lg font-bold text-gray-900">R {Number(event.ticket_price).toFixed(2)}</p>
                    </div>
                    <Link 
                      href={`/schools/events/${event.id}/edit`}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg transition"
                    >
                      Edit Event
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-gray-900 mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">No events yet</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">You haven't created any fundraising runs yet. Get started by creating your first event to start selling tickets!</p>
          <div className="mt-8">
            <Link href="/schools/events/new" className="inline-flex justify-center items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition shadow-sm">
              + Create Your First Event
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
