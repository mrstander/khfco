import { createClient } from '@/lib/supabaseServer'
import SchoolStudentsClient from '../../component/SchoolStudentsClient'

export default async function SchoolStudentsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) {
    return <div className="p-6 text-red-600">No school linked</div>
  }

  const { data: students } = await supabase
    .from('students')
    .select('id, name, grade, created_at, parent_id')
    .eq('school_id', profile.school_id)
    .order('created_at', { ascending: false })

  // enrich parent info
  const enriched = await Promise.all(
    (students || []).map(async (s) => {
      const { data: parent } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', s.parent_id)
        .single()

      return {
        ...s,
        parentName: parent?.name || 'Unknown',
        parentPhone: parent?.phone || '—'
      }
    })
  )

  return <SchoolStudentsClient students={enriched} />
}