import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — Choose Your Chaos',
  description: 'How Choose Your Chaos utilizes cookies for authentication, preferences, and session security.',
}

export default function CookiePolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 leading-relaxed">
      <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">COOKIE POLICY</h1>
      <p className="text-xs text-neutral-500 mb-8">Last Updated: August 2026</p>

      <div className="space-y-6 text-sm text-neutral-300">
        <section>
          <h2 className="text-lg font-bold text-white mb-2">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files placed on your device to remember user sessions, enhance navigation, and maintain secure authentication states.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">2. How We Use Cookies</h2>
          <ul className="list-disc pl-5 space-y-2 text-neutral-400">
            <li><strong>Strictly Necessary Cookies:</strong> Required for secure user authentication, maintaining active Supabase login sessions across App Router pages, and CSRF protection.</li>
            <li><strong>Functional Cookies:</strong> Store player preferences such as humor mode, language settings, and interface configurations.</li>
            <li><strong>Advertising & Analytics Cookies:</strong> Used by Google AdSense and third-party measurement partners to display relevant ads and measure audience interactions.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">3. Managing Your Cookie Preferences</h2>
          <p>
            Most modern web browsers allow you to manage or delete cookies via your browser settings. Note that disabling necessary session cookies may prevent you from logging in or participating in multiplayer rooms.
          </p>
        </section>
      </div>
    </div>
  )
}
