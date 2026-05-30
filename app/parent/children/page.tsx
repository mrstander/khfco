'use client'

import { useState, useTransition, useEffect } from 'react'
import { addChild, getParentChildren, deleteChild, updateChild, getParentProfile } from '@/app/actions/parents'

export default function ChildrenPage() {
  const [children, setChildren] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [profileRes, childrenRes] = await Promise.all([
        getParentProfile(),
        getParentChildren()
      ])

      setProfile(profileRes)
      setChildren(childrenRes || [])
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(null)

    const name = formData.get('name') as string
    const grade = formData.get('grade') as string

    if (!name || !grade) {
      setError('Please fill in all fields')
      return
    }

    startTransition(async () => {
      try {
        if (editingId) {
          await updateChild(editingId, { name, grade })
          setSuccess('Child updated successfully')
        } else {
          if (!profile?.school_id) {
            throw new Error("No school linked to your account")
          }

          await addChild({
            name,
            grade,
            school_id: profile.school_id,
          })

          setSuccess('Child added successfully')
        }

        setShowForm(false)
        setEditingId(null)
        await loadData()

        setTimeout(() => setSuccess(null), 3000)
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  async function handleDelete(childId: string) {
    if (!confirm('Are you sure?')) return

    startTransition(async () => {
      try {
        await deleteChild(childId)
        setSuccess('Child removed successfully')
        await loadData()
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Children</h1>
          <p className="text-gray-900">
            {profile?.school_id
              ? 'Linked to school account'
              : '⚠ Not linked to a school'}
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
          }}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg"
        >
          {showForm ? 'Cancel' : '+ Add Child'}
        </button>
      </div>

      {/* ERROR / SUCCESS */}
      {error && <div className="p-3 bg-red-50 text-red-700">{error}</div>}
      {success && <div className="p-3 bg-green-50 text-green-700">{success}</div>}

      {/* FORM */}
      {showForm && (
        <form action={handleSubmit} className="bg-white p-6 rounded-xl space-y-4 text-gray-900">

          <input
            name="name"
            placeholder="Child name"
            defaultValue={children.find(c => c.id === editingId)?.name || ''}
            className="w-full border p-2 rounded text-gray-900"
          />

          <input
            name="grade"
            placeholder="Grade"
            defaultValue={children.find(c => c.id === editingId)?.grade || ''}
            className="w-full border p-2 rounded text-gray-900"
          />

          <button
            disabled={isPending}
            className="w-full bg-gray-900 text-white p-2 rounded"
          >
            {editingId ? 'Update Child' : 'Add Child'}
          </button>
        </form>
      )}

      {/* LIST */}
      {children.length > 0 ? (
        <div className="grid gap-4">
          {children.map(child => (
            <div key={child.id} className="p-4 border rounded flex justify-between">

              <div>
                <p className="font-bold text-gray-900">{child.name}</p>
                <p className="text-sm text-gray-900">{child.grade}</p>
              </div>

              <div className="flex gap-2 text-gray-900">
                <button
                  onClick={() => {
                    setEditingId(child.id)
                    setShowForm(true)
                  }}
                >
                  Edit
                </button>

                <button onClick={() => handleDelete(child.id)}>
                  Delete
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No children added yet</p>
      )}

    </div>
  )
}