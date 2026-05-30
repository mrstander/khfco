'use client'

import { getParentProfile, updateParentProfile } from '@/app/actions/parents'
import { useEffect, useState, useTransition } from 'react'

export default function ParentProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const result = await getParentProfile()
      setProfile(result)
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(null)

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string

    if (!name) {
      setError('Name is required')
      return
    }

    startTransition(async () => {
      try {
        await updateParentProfile({ name, phone })
        setSuccess('Profile updated successfully')
        await loadProfile()
        setTimeout(() => setSuccess(null), 3000)
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-2">Manage your account information</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <form action={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              name="name"
              type="text"
              required
              defaultValue={profile?.name || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              name="phone"
              type="tel"
              defaultValue={profile?.phone || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">School Information</p>
            <p className="text-gray-900 font-medium">{profile?.schools?.name}</p>
            <p className="text-sm text-gray-600">
              Role: <span className="font-medium capitalize">{profile?.role}</span>
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
