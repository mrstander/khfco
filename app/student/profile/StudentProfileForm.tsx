'use client'

import { updateStudentProfile } from '@/app/actions/students'
import { useState, useTransition } from 'react'

export default function StudentProfileForm({ initialData }: { initialData: any }) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(false)
    const data = {
      name: formData.get('name') as string,
      surname: formData.get('surname') as string,
      grade: formData.get('grade') as string,
    }

    startTransition(async () => {
      try {
        await updateStudentProfile(data)
        setSuccess(true)
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">First Name</label>
          <input id="name" name="name" type="text" defaultValue={initialData?.name} required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="surname">Surname</label>
          <input id="surname" name="surname" type="text" defaultValue={initialData?.surname} required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="grade">Grade / Class</label>
          <input id="grade" name="grade" type="text" defaultValue={initialData?.grade} required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 py-2 px-3 rounded-md border border-red-100">
          {error}
        </div>
      )}
      
      {success && (
        <div className="text-green-700 text-sm bg-green-50 py-2 px-3 rounded-md border border-green-200">
          Profile updated successfully!
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <button disabled={isPending} type="submit" className="flex justify-center py-2 px-6 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors shadow-sm">
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
