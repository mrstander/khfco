'use client'

import { updateSchoolProfile } from '@/app/actions/schools'
import { useState, useTransition } from 'react'

export default function ProfileForm({ initialData }: { initialData: any }) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(false)
    const data = {
      name: formData.get('name') as string,
      contact_person: formData.get('contact_person') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      location: formData.get('location') as string,
    }

    startTransition(async () => {
      try {
        await updateSchoolProfile(data)
        setSuccess(true)
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">School Name</label>
          <input id="name" name="name" type="text" defaultValue={initialData?.name} required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="contact_person">Contact Person</label>
          <input id="contact_person" name="contact_person" type="text" defaultValue={initialData?.contact_person} required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Public Contact Email</label>
          <input id="email" name="email" type="email" defaultValue={initialData?.email} required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">Phone Number</label>
          <input id="phone" name="phone" type="tel" defaultValue={initialData?.phone} className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">Address / Location</label>
          <input id="location" name="location" type="text" defaultValue={initialData?.location} className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
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
        <button disabled={isPending} type="submit" className="flex justify-center py-2 px-6 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors shadow-sm">
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
