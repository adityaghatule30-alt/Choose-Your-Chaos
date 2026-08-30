'use client'

import { useState } from 'react'
import {
  BookOpen,
  Play,
  Flame,
  ShieldAlert,
  Heart,
  Users,
  Trophy,
  Award,
  Zap,
  HelpCircle,
  Sparkles,
  Bot,
} from 'lucide-react'

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState('start')

  const sections = [
    { id: 'start', label: '🚀 Getting Started' },
    { id: 'either-or', label: '🎲 Either / Or' },
    { id: 'truth-chaos', label: '🔥 Truth Chaos' },
    { id: 'judge-me', label: '⚖️ Judge Me Court' },
    { id: 'rooms', label: '👥 Friend Rooms' },
    { id: 'couples', label: '❤️ Couples & Duos' },
    { id: 'progression', label: '⭐ XP & Chaos Score' },
    { id: 'ai', label: '🤖 Chaos AI' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-black text-yellow-400 uppercase tracking-widest mb-4">
          <BookOpen className="w-3.5 h-3.5" /> Official Rulebook
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          THE CHAOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400">GUIDE</span>
        </h1>
        <p className="text-neutral-400 text-xs sm:text-sm mt-2">
          Everything you need to know about navigating the chaos, surviving court trials, and dominating rankings.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveTab(sec.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap border transition-all cursor-pointer ${
              activeTab === sec.id
                ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/20'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* Content Container */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        {activeTab === 'start' && (
          <div className="space-y-4 animate-pop-in">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" /> How to Start Playing
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Choose Your Chaos is designed for instant play. Jump into solo dilemmas in Either / Or, submit real-life drama to Judge Me, or host a live room for your squad.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs text-neutral-300">
                <span className="font-black text-yellow-400 block mb-1">1. CREATE IDENTITY</span>
                Pick your custom avatar from 14 official avatars and set your username.
              </div>
              <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs text-neutral-300">
                <span className="font-black text-pink-400 block mb-1">2. JOIN OR HOST</span>
                Create private friend lobbies with room codes or play public modes.
              </div>
              <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs text-neutral-300">
                <span className="font-black text-purple-400 block mb-1">3. LEVEL UP</span>
                Earn server-verified XP and climb to the top of the global leaderboard.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'either-or' && (
          <div className="space-y-4 animate-pop-in">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-yellow-400 fill-current" /> Either / Or Dilemmas
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Every round presents two conflicting options. Make your secret choice to reveal global percentages and instant witty reactions.
            </p>
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs text-neutral-300">
              💡 <span className="font-bold text-white">XP Rewards:</span> Every vote earns +5 XP towards your player progression.
            </div>
          </div>
        )}

        {activeTab === 'truth-chaos' && (
          <div className="space-y-4 animate-pop-in">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" /> Truth Chaos (Spotlight)
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              A random player is selected to be in the spotlight. Everyone else in the room asks spicy questions. The chosen player can answer or use limited skips.
            </p>
            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs text-neutral-300">
              💀 <span className="font-bold text-white">Skip Rule:</span> Each player only gets 2 skips per turn. Once skips are exhausted, you must confess!
            </div>
          </div>
        )}

        {activeTab === 'judge-me' && (
          <div className="space-y-4 animate-pop-in">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" /> Judge Me Courtroom
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Anyone can submit real moral dilemmas. The jury casts verdicts: Innocent 😇, Guilty 😬, or Criminal 💀, with active jury discussion and emoji reactions.
            </p>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="space-y-4 animate-pop-in">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" /> Friend Rooms & Multiplayer
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Create a custom room, select 3, 5, or 10 rounds, and share your 6-character room code. Players lock answers in secret before simultaneous reveals.
            </p>
          </div>
        )}

        {activeTab === 'couples' && (
          <div className="space-y-4 animate-pop-in">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" /> Couples & Duos
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Features 3 unique modes: Memory Lane (testing telepathy), Couple Chaos (who is more chaotic?), and Ship or Skip (compatibility verdicts).
            </p>
          </div>
        )}

        {activeTab === 'progression' && (
          <div className="space-y-4 animate-pop-in">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> XP, Levels & Chaos Score
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              XP is server-authoritative and earned through genuine actions (voting, submitting cases, judging, commenting, and completing rooms).
            </p>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4 animate-pop-in">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" /> Chaos AI Commentary
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Chaos AI occasionally interrupts spicy confessions, dramatic verdicts, and couples matches to deliver witty, sarcastic commentary.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
