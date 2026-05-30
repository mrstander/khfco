'use client'

import { registerSchoolAccount } from '@/app/actions/auth'
import { useState, useTransition } from 'react'
import Link from 'next/link'

import { useRouter } from 'next/navigation'

export default function RegisterSchoolPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        const result = await registerSchoolAccount(formData)
        if (result?.success) {
          router.push('/schools')
        }
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register School
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join the platform to host your color or neon run
          </p>
        </div>
        <form className="mt-8 space-y-6" action={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="schoolName">School Name</label>
              <input id="schoolName" name="schoolName" type="text" required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" placeholder="Springfield High" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="contactPerson">Contact Person</label>
              <input id="contactPerson" name="contactPerson" type="text" required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">Phone Number</label>
              <input id="phone" name="phone" type="tel" className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" placeholder="(555) 123-4567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" placeholder="jane@springfield.edu" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required minLength={6} className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" placeholder="••••••••" />
            </div>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-md border border-red-100">
              {error}
            </div>
          )}

          <div>
            <button disabled={isPending} type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors shadow-sm">
              {isPending ? 'Registering...' : 'Register School'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <Link href="/login" className="font-medium text-gray-900 hover:text-gray-500 text-sm">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
