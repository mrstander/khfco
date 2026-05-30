'use server'

import { createClient } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

export async function createSponsor(data: {
  event_id: string;
  sponsor_name: string;
  sponsorship_amount: number;
  sponsorship_type?: string;
}) {
  const supabase = await createClient()
  
  const { data: sponsor, error } = await supabase
    .from('sponsors')
    .insert([data])
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath(`/events/${data.event_id}`)
  return sponsor
}

export async function getSponsorsByEvent(eventId: string) {
  const supabase = await createClient()
  const { data: sponsors, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('event_id', eventId)

  if (error) throw new Error(error.message)
  return sponsors
}
