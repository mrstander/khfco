'use server'

import { createClient } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

export async function createEvent(data: { 
  name: string; 
  type: 'color_run' | 'neon_run'; 
  description?: string; 
  event_date: string; 
  location: string; 
  ticket_price: number; 
  capacity: number; 
  image_url?: string;
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user.id).single()
  if (!profile?.school_id) throw new Error("No school associated with this account")
  
  const { data: event, error } = await supabase
    .from('events')
    .insert([{ ...data, school_id: profile.school_id }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath('/events')
  revalidatePath('/schools/events')
  revalidatePath('/schools/dashboard')
  return event
}

export async function updateEvent(id: string, data: { 
  name?: string; 
  type?: 'color_run' | 'neon_run'; 
  description?: string; 
  event_date?: string; 
  location?: string; 
  ticket_price?: number; 
  capacity?: number; 
  image_url?: string;
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user.id).single()
  if (!profile?.school_id) throw new Error("No school associated with this account")
  
  const { data: event, error } = await supabase
    .from('events')
    .update(data)
    .eq('id', id)
    .eq('school_id', profile.school_id) // ensure they own it
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath('/events')
  revalidatePath('/schools/events')
  revalidatePath('/schools/dashboard')
  return event
}

export async function getEvents() {
  const supabase = await createClient()
  const { data: events, error } = await supabase
    .from('events')
    .select('*, schools(name)')

  if (error) throw new Error(error.message)
  return events
}

export async function getEventById(id: string) {
  const supabase = await createClient()
  const { data: event, error } = await supabase
    .from('events')
    .select('*, schools(name)')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return event
}

export async function getEventsBySchool(schoolId: string) {
  const supabase = await createClient()
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('school_id', schoolId)

  if (error) throw new Error(error.message)
  return events
}
