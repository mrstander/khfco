'use client'

import { login } from '@/app/actions/auth'
import { useActionState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, { error: '' })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign In
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome back to the fundraising platform
          </p>
        </div>
        <form className="mt-8 space-y-6" action={action}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" placeholder="admin@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" placeholder="••••••••" />
            </div>
          </div>

          {state?.error && (
            <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-md border border-red-100">
              {state.error}
            </div>
          )}

          <div>
            <button disabled={isPending} type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors shadow-sm">
              {isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center mt-4 flex flex-col space-y-2">
            <Link href="/register/school" className="font-medium text-gray-900 hover:text-gray-500 text-sm">
              Don't have an account? Register your school
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
