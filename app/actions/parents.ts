'use server'

import { createClient } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

/* =====================================================
   PARENT PROFILE
===================================================== */

export async function getParentProfile() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw new Error(error.message)

  return data
}

export async function updateParentProfile(data: {
  name: string
  phone?: string
}) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/parent/profile')
  revalidatePath('/parent/dashboard')

  return { success: true }
}

/* =====================================================
   CHILDREN (STUDENTS)
===================================================== */

export async function getParentChildren() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('parent_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return data
}

export async function addChild(childData: {
  name: string
  grade: string
  school_id: string
}) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from('students')
    .insert([
      {
        parent_id: user.id,
        name: childData.name,
        grade: childData.grade,
        school_id: childData.school_id
      }
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/parent/children')
  revalidatePath('/parent/dashboard')

  return data
}

export async function updateChild(
  childId: string,
  childData: { name: string; grade: string }
) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data: student } = await supabase
    .from('students')
    .select('parent_id')
    .eq('id', childId)
    .single()

  if (student?.parent_id !== user.id) {
    throw new Error("Unauthorized: You can only edit your own children")
  }

  const { error } = await supabase
    .from('students')
    .update(childData)
    .eq('id', childId)

  if (error) throw new Error(error.message)

  revalidatePath('/parent/children')
  revalidatePath('/parent/dashboard')

  return { success: true }
}

export async function deleteChild(childId: string) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data: student } = await supabase
    .from('students')
    .select('parent_id')
    .eq('id', childId)
    .single()

  if (student?.parent_id !== user.id) {
    throw new Error("Unauthorized: You can only delete your own children")
  }

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', childId)

  if (error) throw new Error(error.message)

  revalidatePath('/parent/children')
  revalidatePath('/parent/dashboard')

  return { success: true }
}

/* =====================================================
   EVENTS (SAFE - NO CRASH)
===================================================== */

export async function getSchoolEventsForParent() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) return []

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('school_id', profile.school_id)
    .order('event_date', { ascending: true })

  if (error) throw new Error(error.message)

  return data
}

/* =====================================================
   TICKETS (FIXED - NO parent_id, NO JOINS)
===================================================== */

export async function getParentTickets() {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // STEP 1: get this parent's students
  const { data: students } = await supabase
    .from('students')
    .select('id, name')
    .eq('parent_id', user.id)

  const studentIds = students?.map(s => s.id) || []

  if (studentIds.length === 0) return []

  const studentMap = new Map(
    (students || []).map(s => [s.id, s.name])
  )

  // STEP 2: get tickets for those students
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .in('student_id', studentIds)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return data.map(ticket => ({
    ...ticket,
    student_name: studentMap.get(ticket.student_id) || null
  }))
}

/* =====================================================
   SCHOOL VIEW (SAFE)
===================================================== */

export async function getSchoolStudents(schoolId: string) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'school' || profile?.school_id !== schoolId) {
    throw new Error("Unauthorized")
  }

  const { data: students, error } = await supabase
    .from('students')
    .select('*')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  const enriched = await Promise.all(
    (students || []).map(async (s) => {
      const { data: parent } = await supabase
        .from('profiles')
        .select('id, name, phone')
        .eq('id', s.parent_id)
        .single()

      return {
        ...s,
        parent: parent || null
      }
    })
  )

  return enriched
}