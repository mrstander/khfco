import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'

export default async function SchoolDashboardPage() {
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

  // Fetch registered parents
  const { data: parents } = await supabase
    .from('profiles')
    .select('id, name, phone, email')
    .eq('school_id', schoolId)
    .eq('role', 'parent')

  // Fetch all children (students) in the school
  const { data: children } = await supabase
    .from('students')
    .select(`
      *,
      profiles!parent_id (
        id,
        name,
        phone
      )
    `)
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })

  // Calculate tickets
  const eventIds = events?.map(e => e.id) || []
  let totalRevenue = 0
  let totalTicketsSold = 0

  if (eventIds.length > 0) {
    const { data: tickets } = await supabase
      .from('tickets')
      .select('quantity, total_amount')
      .in('event_id', eventIds)
    
    if (tickets) {
      tickets.forEach(t => {
        totalTicketsSold += t.quantity
        totalRevenue += Number(t.total_amount)
      })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Events</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{events?.length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Registered Parents</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{parents?.length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Children Registered</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{children?.length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">R{totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
          <Link href="/schools/events/new" className="text-sm bg-indigo-50 text-gray-900 px-3 py-1 rounded-md hover:bg-indigo-100 transition font-medium">
            + New Event
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {events && events.length > 0 ? (
            events.slice(0, 5).map((event) => (
              <div key={event.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div>
                  <h3 className="text-md font-medium text-gray-900">{event.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 flex items-center space-x-2">
                    <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700">{event.type.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{new Date(event.event_date).toLocaleDateString()}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">R {Number(event.ticket_price).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Capacity: {event.capacity}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No events scheduled yet. Create your first run!
            </div>
          )}
        </div>
        {events && events.length > 5 && (
          <div className="px-6 py-3 border-t border-gray-100 text-center bg-gray-50 text-sm">
            <Link href="/schools/events" className="text-indigo-600 hover:text-indigo-800 font-medium">
              View all events &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Registered Parents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Registered Parents</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {parents && parents.length > 0 ? (
              parents.slice(0, 10).map((parent) => (
                <div key={parent.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{parent.name}</p>
                    <p className="text-xs text-gray-500">{parent.phone || 'No phone'}</p>
                  </div>
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Active</span>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No parents registered yet. Share the invite link!
              </div>
            )}
          </div>
        </div>

        {/* Children by Grade */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Children Registered</h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {children && children.length > 0 ? (
              children.slice(0, 10).map((child) => (
                <div key={child.id} className="px-6 py-3 hover:bg-gray-50 transition">
                  <p className="text-sm font-medium text-gray-900">{child.name}</p>
                  <div className="flex justify-between items-start mt-1">
                    <p className="text-xs text-gray-500">Grade {child.grade}</p>
                    <p className="text-xs text-gray-600">Parent: {child.profiles?.name}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No children registered yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
