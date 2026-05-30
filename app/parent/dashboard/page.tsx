import { getParentProfile, getParentChildren, getSchoolEventsForParent, getParentTickets } from '@/app/actions/parents'
import Link from 'next/link'

export default async function ParentDashboardPage() {
  const profile = await getParentProfile()
  const children = await getParentChildren()
  const events = await getSchoolEventsForParent()
  const tickets = await getParentTickets()

  const totalTicketsSold = tickets?.reduce((sum, t) => sum + (t.quantity || 0), 0) || 0
  const totalRevenueGenerated = tickets?.reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0) || 0

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 1. Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {profile?.name}!</h1>
        <p className="text-gray-500">You have <span className="font-semibold text-indigo-600">{children?.length || 0}</span> child{children?.length !== 1 ? 'ren' : ''} registered at <span className="font-semibold text-indigo-600">{profile?.schools?.name}</span></p>
      </div>

      {/* 2. Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="text-gray-500 text-sm font-medium">Total Tickets Sold</h3>
          <p className="text-4xl font-bold text-indigo-600 mt-2">{totalTicketsSold}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="text-gray-500 text-sm font-medium">Funds Raised</h3>
          <p className="text-4xl font-bold text-green-600 mt-2">R {totalRevenueGenerated.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* 3. Your Children */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Your Children</h2>
            <Link href="/parent/children" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
              Manage →
            </Link>
          </div>
          
          {children && children.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {children.map((child: any) => (
                <div
                  key={child.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{child.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">Grade: {child.grade}</p>
                    </div>
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 text-center">
              <p className="text-blue-700 mb-4">You haven't added any children yet</p>
              <Link
                href="/parent/children"
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
              >
                Add Your First Child
              </Link>
            </div>
          )}
        </div>

        {/* 4. School Events Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming School Events</h2>
            <Link href="/schools/events" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
              View All →
            </Link>
          </div>

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {events.slice(0, 5).map((event: any) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                >
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{event.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                      <span className="capitalize bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium">
                        {event.type.replace('_', ' ')}
                      </span>
                      <span>•</span>
                      <span>{new Date(event.event_date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-2">Ticket: R {Number(event.ticket_price).toFixed(2)}</p>
                  </div>
                  <button className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm">
                    Register Child
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
              <p className="text-gray-500">No upcoming events yet</p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Recent Ticket Activity */}
      {tickets && tickets.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Recent Ticket Activity</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Event</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Child</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tickets.slice(0, 5).map((ticket: any) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3 text-sm text-gray-900 font-medium">{ticket.events?.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{ticket.students?.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{ticket.quantity}</td>
                      <td className="px-6 py-3 text-sm text-gray-900 font-medium">R {Number(ticket.total_amount).toFixed(2)}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{new Date(ticket.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
