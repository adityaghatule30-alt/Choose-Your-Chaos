import { Metadata } from 'next'
import { HelpCircle, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — Choose Your Chaos',
  description: 'Find answers to common questions about gameplay, multiplayer rooms, XP progression, and safety moderation.',
}

const FAQS = [
  {
    q: 'What is Choose Your Chaos?',
    a: 'Choose Your Chaos is an interactive party and dilemma game platform featuring Either/Or questions, Truth or Dares, public Judge Me court trials, and real-time multiplayer Friend Rooms.',
  },
  {
    q: 'How does Either / Or work?',
    a: 'You are presented with two choices (Option A vs Option B). Pick your side to immediately reveal global vote percentages and deterministic funny reactions while earning +5 XP.',
  },
  {
    q: 'How does Truth or Dare work?',
    a: 'Select your mode (Truth 🎭 or Dare 😈) and difficulty (Easy, Medium, Chaos). Once you answer or complete the challenge, click "I ANSWERED" or "I DID IT" to earn up to +15 XP.',
  },
  {
    q: 'How does the Judge Me court work?',
    a: 'Anyone can submit real situations to the court. The community votes whether you are "Not Guilty 😇", "Guilty 😬", or "Absolutely Criminal 💀", complete with jury comments and reactions.',
  },
  {
    q: 'How do multiplayer Friend Rooms work?',
    a: 'A host creates a room and shares the 6-character code. Players join and lock in their answers secretly. Once everyone answers, the host reveals the squad votes simultaneously, awarding round points and match rewards.',
  },
  {
    q: 'How does the XP & Level progression work?',
    a: 'XP is server-authoritative and earned through genuine gameplay (voting, answering, judging, commenting, and completing rooms). Your level increases automatically based on our continuous progression curve.',
  },
  {
    q: 'How do I report inappropriate content?',
    a: 'Every dilemma, truth/dare prompt, court case, and jury comment has a ⚑ Report button. Our staff moderation team promptly reviews all flagged items.',
  },
]

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-10">
        <div className="inline-flex p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl mb-3">
          <HelpCircle className="w-8 h-8 text-yellow-400" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
          FREQUENTLY ASKED QUESTIONS
        </h1>
        <p className="text-xs text-neutral-400">Everything you need to know about the chaos.</p>
      </div>

      <div className="space-y-4">
        {FAQS.map((item, idx) => (
          <div key={idx} className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-md">
            <h3 className="text-sm sm:text-base font-black text-white mb-2">{item.q}</h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
