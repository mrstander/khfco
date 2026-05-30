import { createClient } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'
import InviteLinkCard from './InviteLinkCard'

export default async function InviteParentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) redirect('/')

  const { data: school } = await supabase
    .from('schools')
    .select('id, name')
    .eq('id', profile.school_id)
    .single()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invite Parents</h1>
        <p className="text-gray-500 mt-1">Generate and share a unique registration link for parents in your school</p>
      </div>
      <InviteLinkCard schoolId={school!.id} schoolName={school!.name} />
    </div>
  )
}
