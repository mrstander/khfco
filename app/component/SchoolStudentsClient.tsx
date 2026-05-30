'use client'

import { useMemo, useState } from 'react'

export default function SchoolStudentsClient({ students }: any) {
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')

  // ✅ safer normalization (prevents crashes)
  const safeStudents = students || []

  // unique grades (ignore empty values)
  const grades = useMemo(() => {
    return Array.from(
      new Set(
        safeStudents
          .map((s: any) => s.grade)
          .filter(Boolean)
      )
    )
  }, [safeStudents])

  // filtered list
  const filtered = useMemo(() => {
    return safeStudents.filter((s: any) => {
      const name = s?.name?.toLowerCase?.() || ''
      const matchesName = name.includes(search.toLowerCase())

      const matchesGrade =
        gradeFilter === 'all' || s.grade === gradeFilter

      return matchesName && matchesGrade
    })
  }, [safeStudents, search, gradeFilter])

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Registered Students
        </h1>
        <p className="text-gray-500 mt-1">
          {filtered.length} student{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-3">

        {/* Search */}
        <input
          type="text"
          placeholder="Search student name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />

        {/* Grade Filter */}
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="w-48 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Grades</option>
          {grades.map((g: any) => (
            <option key={g} value={g}>
              Grade {g}
            </option>
          ))}
        </select>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

        <table className="w-full text-left">

          <thead className="bg-gray-50 text-sm text-gray-500 sticky top-0">
            <tr>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Grade</th>
              <th className="px-6 py-4">Parent</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Registered</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filtered.map((s: any) => (
              <tr key={s.id} className="hover:bg-gray-50 transition">

                <td className="px-6 py-4 font-medium">
                  {s.name}
                </td>

                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {s.grade || '—'}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {s.parentName || 'Unknown'}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {s.parentPhone || '—'}
                </td>

                <td className="px-6 py-4 text-gray-500 text-sm">
                  {s.created_at
                    ? new Date(s.created_at).toLocaleDateString()
                    : '—'}
                </td>

              </tr>
            ))}
          </tbody>

        </table>

        {/* EMPTY STATE */}
        {filtered.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No students match your filters
          </div>
        )}

      </div>
    </div>
  )
}