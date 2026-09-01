'use client'

import { useState } from 'react'
import {
  Globe,
  ExternalLink,
  Edit2,
  Check,
  X,
  Plus,
} from 'lucide-react'
import { UserSocials } from '@/types/social'

interface SocialLinksProps {
  socials?: UserSocials | null
  isEditable?: boolean
  onSave?: (newSocials: UserSocials) => Promise<void>
}

// ─── Inline SVG brand icons (no extra deps) ───────────────────────────────────

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function XTwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

// ─── Platform config ──────────────────────────────────────────────────────────

interface PlatformDef {
  key: keyof UserSocials
  name: string
  Icon: React.ComponentType<{ className?: string }>
  iconColor: string
  hoverBorder: string
  hoverBg: string
  hoverText: string
  placeholder: string
  toUrl: (val: string) => string
  toHandle: (val: string) => string
}

function shortHost(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
  }
}

function extractPath(url: string, pattern: RegExp): string | null {
  try {
    const m = url.match(pattern)
    return m ? m[1] : null
  } catch {
    return null
  }
}

const platforms: PlatformDef[] = [
  {
    key: 'instagram',
    name: 'Instagram',
    Icon: InstagramIcon,
    iconColor: 'text-pink-400',
    hoverBorder: 'hover:border-pink-500/50',
    hoverBg: 'hover:bg-pink-500/[0.05]',
    hoverText: 'group-hover:text-pink-400',
    placeholder: '@username or profile URL',
    toUrl: (v) => v.startsWith('http') ? v : `https://instagram.com/${v.replace(/^@/, '')}`,
    toHandle: (v) => {
      if (!v) return ''
      if (v.startsWith('http')) {
        const seg = extractPath(v, /instagram\.com\/([^/?#]+)/)
        return seg ? `@${seg}` : shortHost(v)
      }
      return `@${v.replace(/^@/, '')}`
    },
  },
  {
    key: 'twitter',
    name: 'X / Twitter',
    Icon: XTwitterIcon,
    iconColor: 'text-neutral-200',
    hoverBorder: 'hover:border-neutral-500/50',
    hoverBg: 'hover:bg-neutral-500/[0.07]',
    hoverText: 'group-hover:text-white',
    placeholder: '@handle or profile URL',
    toUrl: (v) => v.startsWith('http') ? v : `https://x.com/${v.replace(/^@/, '')}`,
    toHandle: (v) => {
      if (!v) return ''
      if (v.startsWith('http')) {
        const seg = extractPath(v, /(?:twitter|x)\.com\/([^/?#]+)/)
        return seg ? `@${seg}` : shortHost(v)
      }
      return `@${v.replace(/^@/, '')}`
    },
  },
  {
    key: 'github',
    name: 'GitHub',
    Icon: GitHubIcon,
    iconColor: 'text-purple-400',
    hoverBorder: 'hover:border-purple-500/50',
    hoverBg: 'hover:bg-purple-500/[0.05]',
    hoverText: 'group-hover:text-purple-300',
    placeholder: '@username or profile URL',
    toUrl: (v) => v.startsWith('http') ? v : `https://github.com/${v.replace(/^@/, '')}`,
    toHandle: (v) => {
      if (!v) return ''
      if (v.startsWith('http')) {
        const seg = extractPath(v, /github\.com\/([^/?#]+)/)
        return seg ? `@${seg}` : shortHost(v)
      }
      return `@${v.replace(/^@/, '')}`
    },
  },
  {
    key: 'youtube',
    name: 'YouTube',
    Icon: YouTubeIcon,
    iconColor: 'text-red-400',
    hoverBorder: 'hover:border-red-500/50',
    hoverBg: 'hover:bg-red-500/[0.05]',
    hoverText: 'group-hover:text-red-400',
    placeholder: '@channel or URL',
    toUrl: (v) => v.startsWith('http') ? v : `https://youtube.com/@${v.replace(/^@/, '')}`,
    toHandle: (v) => {
      if (!v) return ''
      if (v.startsWith('http')) {
        const seg = extractPath(v, /youtube\.com\/@?([^/?#]+)/)
        return seg ? `@${seg}` : shortHost(v)
      }
      return `@${v.replace(/^@/, '')}`
    },
  },
  {
    key: 'linkedin',
    name: 'LinkedIn',
    Icon: LinkedInIcon,
    iconColor: 'text-blue-400',
    hoverBorder: 'hover:border-blue-500/50',
    hoverBg: 'hover:bg-blue-500/[0.05]',
    hoverText: 'group-hover:text-blue-400',
    placeholder: 'username or profile URL',
    toUrl: (v) => v.startsWith('http') ? v : `https://linkedin.com/in/${v.replace(/^@/, '')}`,
    toHandle: (v) => {
      if (!v) return ''
      if (v.startsWith('http')) {
        const seg = extractPath(v, /linkedin\.com\/in\/([^/?#]+)/)
        return seg ? seg : shortHost(v)
      }
      return v.replace(/^@/, '')
    },
  },
  {
    key: 'custom',
    name: 'Website',
    Icon: ({ className }) => <Globe className={className ?? ''} />,
    iconColor: 'text-emerald-400',
    hoverBorder: 'hover:border-emerald-500/50',
    hoverBg: 'hover:bg-emerald-500/[0.05]',
    hoverText: 'group-hover:text-emerald-400',
    placeholder: 'https://yourwebsite.com',
    toUrl: (v) => v.startsWith('http') ? v : `https://${v}`,
    toHandle: (v) => shortHost(v),
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function SocialLinks({ socials = {}, isEditable = false, onSave }: SocialLinksProps) {
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<UserSocials>(socials || {})
  const [saving, setSaving] = useState(false)

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

  // ── Edit mode ──────────────────────────────────────────────────────────────
  if (editing) {
    return (
      <div className="bg-neutral-950/80 border border-neutral-800 rounded-3xl p-5 shadow-xl animate-pop-in">
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs font-black uppercase text-purple-400 tracking-wider">
            Edit Public Socials
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setEditing(false)}
              aria-label="Cancel editing"
              className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              aria-label="Save social links"
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-xs rounded-lg transition-all flex items-center gap-1 shadow active-press"
            >
              <Check className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {platforms.map((p) => {
            const { Icon } = p
            return (
              <label
                key={p.key}
                className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 focus-within:border-neutral-600 rounded-xl px-3 py-2.5 transition-colors cursor-text"
              >
                <Icon className={`w-[18px] h-[18px] shrink-0 ${p.iconColor}`} />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">
                    {p.name}
                  </span>
                  <input
                    type="text"
                    placeholder={p.placeholder}
                    value={formData[p.key] || ''}
                    onChange={(e) => setFormData({ ...formData, [p.key]: e.target.value })}
                    maxLength={120}
                    className="bg-transparent text-xs text-white placeholder-neutral-600 w-full focus:outline-none"
                    aria-label={`${p.name} profile link or username`}
                  />
                </div>
                {formData[p.key] && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, [p.key]: '' })}
                    aria-label={`Clear ${p.name}`}
                    className="shrink-0 text-neutral-600 hover:text-neutral-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </label>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Display mode ───────────────────────────────────────────────────────────
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-xl">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-black uppercase text-neutral-400 tracking-wider">
          SOCIAL LINKS
        </span>
        {isEditable && (
          <button
            onClick={() => {
              setFormData(socials || {})
              setEditing(true)
            }}
            aria-label={activeLinks.length === 0 ? 'Add social links' : 'Edit social links'}
            className="flex items-center gap-1 text-[11px] font-black text-purple-400 hover:text-purple-300 transition-colors active-press"
          >
            <Edit2 className="w-3 h-3" aria-hidden="true" />
            {activeLinks.length === 0 ? 'ADD SOCIALS' : 'EDIT'}
          </button>
        )}
      </div>

      {/* Empty state */}
      {activeLinks.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-xs text-neutral-500 italic mb-3">Nothing connected yet.</p>
          {isEditable && (
            <button
              onClick={() => {
                setFormData(socials || {})
                setEditing(true)
              }}
              aria-label="Add social links"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-950 border border-neutral-700 hover:border-purple-600/60 hover:text-purple-300 text-neutral-300 text-xs font-black rounded-xl transition-all active-press"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              ADD SOCIAL
            </button>
          )}
        </div>
      ) : (
        /* Social cards grid — 1 col mobile, 2 col tablet, 3 col desktop */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {activeLinks.map((p) => {
            const { Icon } = p
            const raw = socials?.[p.key] || ''
            const url = p.toUrl(raw)
            const handle = p.toHandle(raw)

            return (
              <a
                key={p.key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${handle || p.name} profile on ${p.name}`}
                className={[
                  'group relative flex items-center gap-3 min-w-0',
                  'bg-neutral-950 border border-neutral-800 rounded-2xl',
                  'px-4 py-3.5',
                  'transition-all duration-200',
                  p.hoverBorder,
                  p.hoverBg,
                  'hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500',
                  'active-press',
                ].join(' ')}
              >
                {/* Platform icon badge */}
                <div className="shrink-0 w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                  <Icon className={`w-[18px] h-[18px] ${p.iconColor}`} />
                </div>

                {/* Platform name + handle */}
                <div className="flex-1 min-w-0">
                  <div className={`text-[11px] font-black uppercase tracking-wider text-neutral-300 leading-none mb-[5px] transition-colors ${p.hoverText}`}>
                    {p.name}
                  </div>
                  <div className="text-xs text-neutral-500 font-medium truncate leading-none">
                    {handle}
                  </div>
                </div>

                {/* External link arrow — subtle, moves on hover */}
                <ExternalLink
                  className="shrink-0 w-3.5 h-3.5 text-neutral-700 transition-all duration-200 group-hover:text-neutral-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
