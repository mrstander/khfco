'use server'

import { createClient } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

export async function createSchool(data: { name: string; contact_person: string; email: string; phone?: string; location?: string }) {
  const supabase = await createClient()
  
  const { data: school, error } = await supabase
    .from('schools')
    .insert([data])
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath('/schools')
  revalidatePath('/admin')
  return school
}

export async function updateSchoolProfile(data: { name: string; contact_person: string; email: string; phone: string; location: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase.from('profiles').select('school_id').eq('id', user.id).single()
  if (!profile?.school_id) throw new Error("No school associated with this account")

  const { error } = await supabase
    .from('schools')
    .update(data)
    .eq('id', profile.school_id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/schools/profile')
  revalidatePath('/schools/dashboard')
  return { success: true }
}

export async function getSchoolById(id: string) {
  const supabase = await createClient()
  const { data: school, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return school
}

export async function getSchools() {
  const supabase = await createClient()
  const { data: schools, error } = await supabase
    .from('schools')
    .select('*')

  if (error) throw new Error(error.message)
  return schools
}
