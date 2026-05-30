'use server'

import { createClient } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

export async function registerStudentAccount(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const surname = formData.get('surname') as string
  const grade = formData.get('grade') as string
  const school_id = formData.get('school_id') as string

  if (!email || !password || !name || !surname || !school_id) {
    throw new Error('All fields are required.')
  }

  // 1. Sign up the user (the database trigger will assign role = 'student' and use the metadata)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'student',
        name,
        surname,
        grade,
        school_id
      }
    }
  })

  if (authError) {
    throw new Error(authError.message)
  }
  
  if (!authData.user) {
    throw new Error("Could not create user account. This email is likely already registered.")
  }

  // Wait briefly for the DB trigger to create the profile row
  await new Promise(resolve => setTimeout(resolve, 500))

  return { success: true }
}

export async function getStudentProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      *,
      schools (
        name
      )
    `)
    .eq('id', user.id)
    .single()

  if (error) throw new Error(error.message)
  return profile
}

export async function updateStudentProfile(data: { name: string; surname: string; grade: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/student/profile')
  revalidatePath('/student/dashboard')
  return { success: true }
}

export async function getStudentSchoolEvents() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // The RLS policy "Students can view their school events" automatically filters this,
  // but we can explicitly query just to be safe.
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })

  if (error) throw new Error(error.message)
  return events
}

export async function getStudentTickets() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select(`
      *,
      events (
        name
      )
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return tickets
}
