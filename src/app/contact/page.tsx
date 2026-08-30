import { Metadata } from 'next'
import { Mail, MessageSquare, Send } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us — Choose Your Chaos',
  description: 'Get in touch with the Choose Your Chaos team for inquiries, feedback, partnerships, or support.',
}

export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-16 text-center">
      <div className="inline-flex p-3 bg-neutral-900 border border-neutral-800 rounded-2xl mb-4 text-yellow-400">
        <Mail className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black text-white tracking-tight mb-2">CONTACT US</h1>
      <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-8">
        Have feedback, bug reports, or partnership ideas? We’d love to hear from you.
      </p>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
            Support Email
          </label>
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-yellow-400 font-mono text-xs">
            support@chooseyourchaos.com
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
            Business Inquiries
          </label>
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-yellow-400 font-mono text-xs">
            partnerships@chooseyourchaos.com
          </div>
        </div>

        <p className="text-[11px] text-neutral-500 mt-6 leading-relaxed">
          Please allow 24-48 business hours for response. For urgent content moderation requests, you can use the in-game reporting button on any post.
        </p>
      </div>
    </div>
  )
}
