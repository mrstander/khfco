'use server'

import { createClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function login(prevState: { error: string }, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'admin') {
      redirect('/admin')
    } else if (profile?.role === 'school') {
      redirect('/schools/dashboard')
    } else if (profile?.role === 'parent') {
      redirect('/parent/dashboard')
    }
  }

  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function registerSchoolAccount(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const schoolName = formData.get('schoolName') as string
  const contactPerson = formData.get('contactPerson') as string
  const phone = formData.get('phone') as string

  // 1. Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: contactPerson,
      }
    }
  })

  if (authError) {
    console.error("Auth Error:", authError)
    throw new Error(authError.message)
  }
  
  if (!authData.user) throw new Error("Could not create user account. This email is likely already registered.")

  // Wait briefly for the DB trigger to create the profile row
  await new Promise(resolve => setTimeout(resolve, 500))

  // 2. We need a service role client to insert the school and update the profile, 
  // since RLS prevents normal users from creating schools or upgrading their role.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in environment variables")
  }
  
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  )

  // 3. Insert the school
  const { data: schoolData, error: schoolError } = await supabaseAdmin
    .from('schools')
    .insert([{
      name: schoolName,
      contact_person: contactPerson,
      email: email,
      phone: phone,
    }])
    .select()
    .single()

  if (schoolError) {
    console.error("School Insert Error:", schoolError)
    throw new Error(`Failed to create school record: ${schoolError.message}`)
  }

  // 4. Update the user's profile to be a 'school' role and link the school_id
  const { data: updatedProfile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ 
      role: 'school',
      school_id: schoolData.id 
    })
    .eq('id', authData.user.id)
    .select()
    .single()

  if (profileError) {
    console.error("Profile Update Error:", profileError)
    throw new Error(`Failed to update profile role: ${profileError.message}`)
  }

  // Successfully registered!
  return { success: true }
}

export async function registerParentAccount(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const school_id = formData.get('school_id') as string

  if (!email || !password || !name || !school_id) {
    throw new Error('Email, password, name, and school are required.')
  }

  // 1. Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      }
    }
  })

  if (authError) {
    console.error("Auth Error:", authError)
    throw new Error(authError.message)
  }
  
  if (!authData.user) {
    throw new Error("Could not create user account. This email is likely already registered.")
  }

  // Wait briefly for the DB trigger to create the profile row
  await new Promise(resolve => setTimeout(resolve, 500))

  // 2. We need a service role client to update the profile role
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in environment variables")
  }
  
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  )

  // 3. Update the user's profile to be a 'parent' role and link the school_id
  const { data: updatedProfile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ 
      role: 'parent',
      school_id: school_id,
      phone: phone
    })
    .eq('id', authData.user.id)
    .select()
    .single()

  if (profileError) {
    console.error("Profile Update Error:", profileError)
    throw new Error(`Failed to update profile role: ${profileError.message}`)
  }

  // Successfully registered!
  return { success: true }
}
