import { getStudentProfile } from '@/app/actions/students'
import StudentProfileForm from './StudentProfileForm'

export default async function StudentProfilePage() {
  const profile = await getStudentProfile()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your student details</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <StudentProfileForm initialData={profile} />
      </div>
    </div>
  )
}
