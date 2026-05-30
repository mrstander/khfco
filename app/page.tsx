import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      
      <div className="text-center max-w-2xl space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">
          School Events & Parent Engagement Platform
        </h1>

        <p className="text-gray-600 text-lg">
          A simple way for schools, parents, and students to manage events,
          tickets, and participation in one place.
        </p>

        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/login"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Get Started
          </Link>
        </div>
      </div>

      <div className="mt-16 text-sm text-gray-400">
        © {new Date().getFullYear()} School Platform
      </div>
    </main>
  )
}