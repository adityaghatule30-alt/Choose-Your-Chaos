'use client'

import { useState } from 'react'
import {
  Globe,
  Plus,
  ExternalLink,
  Edit2,
  Check,
  X,
  Share2,
} from 'lucide-react'
import { UserSocials } from '@/types/social'

interface SocialLinksProps {
  socials?: UserSocials | null
  isEditable?: boolean
  onSave?: (newSocials: UserSocials) => Promise<void>
}

export function SocialLinks({ socials = {}, isEditable = false, onSave }: SocialLinksProps) {
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<UserSocials>(socials || {})
  const [saving, setSaving] = useState(false)

  const platforms = [
    { key: 'instagram' as keyof UserSocials, name: 'Instagram', emoji: '📸', prefix: 'https://instagram.com/', color: 'hover:text-pink-400' },
    { key: 'twitter' as keyof UserSocials, name: 'X / Twitter', emoji: '🐦', prefix: 'https://x.com/', color: 'hover:text-sky-400' },
    { key: 'github' as keyof UserSocials, name: 'GitHub', emoji: '🐙', prefix: 'https://github.com/', color: 'hover:text-purple-400' },
    { key: 'youtube' as keyof UserSocials, name: 'YouTube', emoji: '▶️', prefix: 'https://youtube.com/@', color: 'hover:text-red-400' },
    { key: 'linkedin' as keyof UserSocials, name: 'LinkedIn', emoji: '💼', prefix: 'https://linkedin.com/in/', color: 'hover:text-blue-400' },
    { key: 'custom' as keyof UserSocials, name: 'Website', emoji: '🌐', prefix: '', color: 'hover:text-emerald-400' },
  ]

  const activeLinks = platforms.filter((p) => Boolean(socials?.[p.key]))

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave(formData)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const getFullUrl = (key: keyof UserSocials, val: string) => {
    if (!val) return '#'
    if (val.startsWith('http://') || val.startsWith('https://')) return val
    if (key === 'instagram') return `https://instagram.com/${val.replace('@', '')}`
    if (key === 'twitter') return `https://x.com/${val.replace('@', '')}`
    if (key === 'github') return `https://github.com/${val.replace('@', '')}`
    if (key === 'youtube') return `https://youtube.com/@${val.replace('@', '')}`
    if (key === 'linkedin') return `https://linkedin.com/in/${val.replace('@', '')}`
    return `https://${val}`
  }

  if (editing) {
    return (
      <div className="bg-neutral-950/80 border border-neutral-800 rounded-3xl p-5 shadow-xl animate-pop-in">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-black uppercase text-purple-400 tracking-wider">
            Edit Public Socials
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setEditing(false)}
              className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-lg transition-all flex items-center gap-1 shadow"
            >
              <Check className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {platforms.map((p) => (
            <div key={p.key} className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2">
              <span className="text-sm shrink-0">{p.emoji}</span>
              <input
                type="text"
                placeholder={p.name}
                value={formData[p.key] || ''}
                onChange={(e) => setFormData({ ...formData, [p.key]: e.target.value })}
                maxLength={60}
                className="bg-transparent text-xs text-white placeholder-neutral-500 w-full focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black uppercase text-neutral-400 tracking-wider">
          SOCIAL LINKS
        </span>
        {isEditable && (
          <button
            onClick={() => {
              setFormData(socials || {})
              setEditing(true)
            }}
            className="text-[11px] font-black text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3 h-3" /> {activeLinks.length === 0 ? 'ADD SOCIALS' : 'EDIT'}
          </button>
        )}
      </div>

      {activeLinks.length === 0 ? (
        <div className="text-center py-4 text-xs text-neutral-500 italic">
          No social links connected yet.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {activeLinks.map((p) => {
            const val = socials?.[p.key] || ''
            const url = getFullUrl(p.key, val)

            return (
              <a
                key={p.key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-3 py-2 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 ${p.color} rounded-xl text-xs font-bold transition-all hover:scale-105 shadow-sm group`}
              >
                <span className="text-sm">{p.emoji}</span>
                <span className="truncate max-w-[120px]">{val.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500" />
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
