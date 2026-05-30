'use client'

import { useState } from 'react'

export default function InviteLinkCard({ schoolId, schoolName }: { schoolId: string; schoolName: string }) {
  const [copied, setCopied] = useState(false)
  
  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/register?school_id=${schoolId}`

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    })
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Hero card */}
      <div className="bg-linear-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Parent Invite Link</h2>
        <p className="text-indigo-200 text-sm mb-6">
          Share this link with parents so they can register under <span className="font-semibold text-white">{schoolName}</span>. 
          The link automatically assigns them to your school.
        </p>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <code className="flex-1 text-sm text-white/90 break-all font-mono">
            {inviteLink}
          </code>
          <button
            onClick={handleCopy}
            className={`shrink-0 px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm ${
              copied 
                ? 'bg-green-400 text-white' 
                : 'bg-white text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">How it works</h3>
        <ol className="space-y-4">
          {[
            { step: '1', title: 'Copy the link above', desc: 'Click the "Copy Link" button to copy your school\'s unique registration link.' },
            { step: '2', title: 'Share it with parents', desc: 'Send the link via WhatsApp, email, or print it on a notice. Any parent who clicks it will register under your school automatically.' },
            { step: '3', title: 'Parents register and add children', desc: 'Once parents sign up, they can add their children and register them for events.' },
          ].map(({ step, title, desc }) => (
            <li key={step} className="flex gap-4">
              <div className="shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                  {step}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{title}</h4>
                <p className="text-sm text-gray-500 mt-1">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Security note */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 flex gap-3">
        <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Security note:</span> This link is tied to your school's unique ID. Parents who use it cannot switch to a different school. Only share with parents associated with <span className="font-semibold">{schoolName}</span>.
        </p>
      </div>
    </div>
  )
}
