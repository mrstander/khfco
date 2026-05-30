'use client'

import { registerParentAccount } from '@/app/actions/auth'
import { useState, useTransition, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ParentRegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const schoolId = searchParams.get('school_id')
  
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!schoolId) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center border border-red-100">
        <h3 className="font-bold mb-2">Invalid Registration Link</h3>
        <p>You must use a valid invite link from your school to register as a parent.</p>
      </div>
    )
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    formData.append('school_id', schoolId as string)

    startTransition(async () => {
      try {
        const result = await registerParentAccount(formData)
        if (result?.success) {
          router.push('/parent/dashboard')
        }
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Full Name</label>
        <input id="name" name="name" type="text" required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">Phone Number</label>
        <input id="phone" name="phone" type="tel" className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>

      <div className="pt-2 border-t border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email Address</label>
        <input id="email" name="email" type="email" required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
      </div>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 py-2 px-3 rounded-md border border-red-100">
          {error}
        </div>
      )}

      <div>
        <button disabled={isPending} type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors">
          {isPending ? 'Registering...' : 'Complete Registration'}
        </button>
      </div>
      
      <div className="text-center text-sm text-gray-500 pt-4">
        Already have an account? <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Sign in</Link>
      </div>
    </form>
  )
}

export default function ParentRegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Parent Registration</h2>
        <p className="mt-2 text-sm text-gray-600">
          Join your school's fundraising platform and register your children
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          <Suspense fallback={<div className="text-center py-4">Loading form...</div>}>
            <ParentRegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
