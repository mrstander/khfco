'use client'

import { updateEvent } from '@/app/actions/events'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function EditEventForm({ event }: { event: any }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }

  async function handleSubmit(formData: FormData) {
    setError(null)

    const data = {
      name: formData.get('name') as string,
      type: formData.get('type') as 'color_run' | 'neon_run',
      description: formData.get('description') as string,
      event_date: formData.get('event_date') as string,
      location: formData.get('location') as string,
      ticket_price: Number(formData.get('ticket_price')),
      capacity: Number(formData.get('capacity')),
    }

    startTransition(async () => {
      try {
        await updateEvent(event.id, data)
        router.push('/schools/events')
      } catch (err: any) {
        setError(err.message)
      }
    })
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <form action={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Event Name</label>
            <input id="name" name="name" type="text" defaultValue={event.name} required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="type">Event Type</label>
            <select id="type" name="type" defaultValue={event.type} required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm">
              <option value="color_run">Color Run</option>
              <option value="neon_run">Neon Night Run</option>
            </select>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="event_date">Date & Time</label>
            <input id="event_date" name="event_date" type="datetime-local" defaultValue={formatDateForInput(event.event_date)} required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">Location</label>
            <input id="location" name="location" type="text" defaultValue={event.location} required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ticket_price">Ticket Price (Rands)</label>
            <input id="ticket_price" name="ticket_price" type="number" step="0.01" min="0" defaultValue={event.ticket_price} required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="capacity">Capacity</label>
            <input id="capacity" name="capacity" type="number" min="1" defaultValue={event.capacity} required className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={4} defaultValue={event.description} className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"></textarea>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 py-2 px-3 rounded-md border border-red-100">
            {error}
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button disabled={isPending} type="submit" className="flex justify-center py-2 px-6 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors shadow-sm">
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
