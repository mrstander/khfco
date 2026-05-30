import Link from 'next/link'
import { createClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get parent profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, role, school_id')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'parent') {
    redirect('/')
  }

  // Get school name (SAFE manual join)
  let school = null

  if (profile?.school_id) {
    const { data } = await supabase
      .from('schools')
      .select('id, name')
      .eq('id', profile.school_id)
      .single()

    school = data
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Parent Portal</h2>
          <p className="text-sm text-gray-500">Manage your children</p>

          {/* ✅ SCHOOL NAME */}
          <div className="mt-3 px-3 py-2 bg-indigo-50 rounded-lg">
            <p className="text-xs text-gray-500">School</p>
            <p className="text-sm font-semibold text-indigo-700">
              {school?.name || 'No school linked'}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <Link
            href="/parent/dashboard"
            className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition font-medium"
          >
            Dashboard
          </Link>

          <Link
            href="/parent/children"
            className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition font-medium"
          >
            My Children
          </Link>

          <Link
            href="/parent/profile"
            className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition font-medium"
          >
            Profile
          </Link>
        </nav>

        <div className="border-t pt-4">
          <form
            action={async () => {
              'use server'
              const supabase = await createClient()
              await supabase.auth.signOut()
              redirect('/login')
            }}
          >
            <button
              type="submit"
              className="w-full px-4 py-2 text-red-700 hover:bg-red-50 rounded-lg transition font-medium text-left"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  )
}