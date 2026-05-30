'use server'

import { createClient } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

export async function createTicket(data: {
  event_id: string;
  buyer_name: string;
  buyer_email: string;
  quantity: number;
  total_amount: number;
}) {
  const supabase = await createClient()
  
  const { data: ticket, error } = await supabase
    .from('tickets')
    .insert([data])
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath(`/events/${data.event_id}`)
  return ticket
}

export async function getTicketsByEvent(eventId: string) {
  const supabase = await createClient()
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('event_id', eventId)

  if (error) throw new Error(error.message)
  return tickets
}
