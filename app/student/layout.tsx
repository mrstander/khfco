import { logout } from '@/app/actions/auth'
import Link from 'next/link'
import { ReactNode } from 'react'

export default function StudentDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-indigo-900 text-white flex flex-col hidden md:flex min-h-screen border-r border-indigo-800">
        <div className="p-6 border-b border-indigo-800">
          <h2 className="text-2xl font-extrabold tracking-tight">KHF</h2>
          <p className="text-indigo-300 text-sm mt-1">Student Portal</p>
        </div>
        <nav className="mt-6 flex flex-col px-4 space-y-2">
          <Link href="/student/dashboard" className="px-4 py-2 rounded-md hover:bg-indigo-800 transition">
            Dashboard
          </Link>
          <Link href="/student/tickets" className="px-4 py-2 rounded-md hover:bg-indigo-800 transition">
            My Tickets
          </Link>
          <Link href="/student/profile" className="px-4 py-2 rounded-md hover:bg-indigo-800 transition">
            My Profile
          </Link>
          <form action={logout} className="mt-8 border-t border-indigo-800 pt-4">
            <button type="submit" className="w-full text-left px-4 py-2 rounded-md hover:bg-red-600 transition text-red-200 hover:text-white">
              Sign Out
            </button>
          </form>
        </nav>
      </aside>

      {/* Mobile Header (visible only on small screens) */}
      <header className="md:hidden bg-indigo-900 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Student Portal</h2>
        <form action={logout}>
          <button type="submit" className="text-sm px-3 py-1 bg-indigo-800 rounded">Sign out</button>
        </form>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
