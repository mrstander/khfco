import { createClient } from '@/lib/supabaseServer'
import ProfileForm from './ProfileForm'

export default async function SchoolProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user?.id)
    .single()

  const { data: schoolData } = await supabase
    .from('schools')
    .select('*')
    .eq('id', profile?.school_id)
    .single()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">School Profile</h1>
        <p className="text-gray-500 mt-1">Manage your school's identity and contact details</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <ProfileForm initialData={schoolData} />
      </div>
    </div>
  )
}
