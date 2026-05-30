import { createClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export default async function SchoolDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, schools(name)')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'school' && profile?.role !== 'admin') {
    redirect('/')
  }

  // Handle Supabase relationships - schools could be an array or object
  // Since it's a one-to-many relationship where profiles references schools, schools is an object
  const schoolData = profile?.schools as any
  const schoolName = schoolData?.name || 'School Dashboard'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-indigo-900 text-white flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold font-sans truncate" title={schoolName}>{schoolName}</h2>
          <p className="text-indigo-300 text-sm mt-1">Fundraising Platform</p>
        </div>
        <nav className="mt-6 flex flex-col px-4 space-y-2">
          <Link href="/schools/dashboard" className="px-4 py-2 rounded-md hover:bg-indigo-800 transition">
            Dashboard
          </Link>
          <Link href="/schools/events" className="px-4 py-2 rounded-md hover:bg-indigo-800 transition">
            My Events
          </Link>
          <Link href="/schools/students" className="px-4 py-2 rounded-md hover:bg-indigo-800 transition">
            Students
          </Link>
          <Link href="/schools/profile" className="px-4 py-2 rounded-md hover:bg-indigo-800 transition">
            School Profile
          </Link>
          <Link href="/schools/invite" className="px-4 py-2 rounded-md hover:bg-indigo-800 transition">
            Invite Parents
          </Link>
          <form action={logout} className="mt-8 border-t border-indigo-800 pt-4">
            <button type="submit" className="w-full text-left px-4 py-2 rounded-md hover:bg-red-600 transition text-red-200 hover:text-white">
              Log out
            </button>
          </form>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
