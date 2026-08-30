'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Gavel, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react'

const CATEGORIES = [
  { slug: 'relationships', name: 'Relationships', emoji: '❤️' },
  { slug: 'friends', name: 'Friends', emoji: '👯' },
  { slug: 'work', name: 'Work / Corporate', emoji: '💼' },
  { slug: 'college', name: 'College / School', emoji: '🎓' },
  { slug: 'money', name: 'Money', emoji: '💸' },
  { slug: 'funny', name: 'Funny / Absurd', emoji: '😂' },
  { slug: 'indian', name: 'Desi / Family', emoji: '🇮🇳' },
]

export default function SubmitCasePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categorySlug, setCategorySlug] = useState('relationships')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login?redirectTo=/judge-me/submit')
      return
    }

    setErrorMsg(null)
    setSuccessMsg(null)

    if (title.trim().length < 5) {
      setErrorMsg('Title must be at least 5 characters.')
      return
    }

    if (description.trim().length < 15) {
      setErrorMsg('Situation description must be at least 15 characters.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/judge/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category_slug: categorySlug,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setSuccessMsg('Case submitted. The court is reviewing your evidence. ⚖️ (+20 XP)')
        setTimeout(() => {
          router.push(`/judge-me/${data.case.id}`)
        }, 1500)
      } else {
        setErrorMsg(data.message || 'Your case didn’t reach the courtroom. Try again.')
      }
    } catch {
      setErrorMsg('Your case didn’t reach the courtroom. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <Link
        href="/judge-me"
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Court Feed
      </Link>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl -z-10" />

        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-red-950/60 border border-red-800 rounded-2xl mb-3 shadow-inner">
            <Gavel className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">SUBMIT YOUR CASE</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Let the internet decide if you belong in jail or in the right.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl text-emerald-300 text-sm flex items-start gap-2.5 animate-bounce">
            <Sparkles className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Case Title (Short & Punchy)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. I canceled plans to stay home and game."
              disabled={submitting}
              maxLength={200}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Category
            </label>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              disabled={submitting}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors disabled:opacity-50"
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              The Situation (Full Evidence)
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the court what actually happened, what you did, and why you feel conflicted..."
              disabled={submitting}
              maxLength={2000}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors resize-none disabled:opacity-50"
              required
            />
            <div className="text-right text-[11px] text-neutral-500 mt-1">
              {description.length} / 2000
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-red-600/25 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'FILING EVIDENCE...' : 'SUBMIT TO THE COURT ⚖️'}
          </button>
        </form>
      </div>
    </div>
  )
}
