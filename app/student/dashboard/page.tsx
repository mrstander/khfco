import { getStudentProfile, getStudentSchoolEvents, getStudentTickets } from '@/app/actions/students'
import Link from 'next/link'

export default async function StudentDashboardPage() {
  const profile = await getStudentProfile()
  const events = await getStudentSchoolEvents()
  const tickets = await getStudentTickets()

  const totalTicketsSold = tickets?.reduce((sum, t) => sum + (t.quantity || 0), 0) || 0
  const totalRevenueGenerated = tickets?.reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0) || 0

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 1. Overview Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {profile?.name} {profile?.surname}!</h1>
        <p className="text-gray-500">Student at <span className="font-semibold text-indigo-600">{profile?.schools?.name}</span> • Grade: {profile?.grade}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="text-gray-500 text-sm font-medium">Tickets Sold</h3>
          <p className="text-4xl font-bold text-indigo-600 mt-2">{totalTicketsSold}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <h3 className="text-gray-500 text-sm font-medium">Funds Raised</h3>
          <p className="text-4xl font-bold text-green-600 mt-2">R {totalRevenueGenerated.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* 2. School Events Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">Upcoming School Events</h2>
          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
                    View / Share Link
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
              <p className="text-gray-500">Your school hasn't published any events yet.</p>
            </div>
          )}
        </div>

        {/* 3. My Tickets Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">Recent Sales</h2>
          {tickets && tickets.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {tickets.slice(0, 5).map((ticket) => (
                  <div key={ticket.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{ticket.buyer_name}</p>
                      <p className="text-sm text-gray-500">{ticket.events?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">R {Number(ticket.total_amount).toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{ticket.quantity} ticket(s)</p>
                    </div>
                  </div>
                ))}
              </div>
              {tickets.length > 5 && (
                <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
                  <Link href="/student/tickets" className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
                    View All Sales &rarr;
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
              <p className="text-gray-500">You haven't sold any tickets yet. Share your event link to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
