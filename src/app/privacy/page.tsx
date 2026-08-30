import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Choose Your Chaos',
  description: 'Learn how Choose Your Chaos handles your data, cookies, authentication, and privacy.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 leading-relaxed">
      <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">PRIVACY POLICY</h1>
      <p className="text-xs text-neutral-500 mb-8">Last Updated: August 2026</p>

      <div className="space-y-6 text-sm text-neutral-300">
        <section>
          <h2 className="text-lg font-bold text-white mb-2">1. Overview</h2>
          <p>
            Welcome to Choose Your Chaos ("we", "our", or "the platform"). We respect your privacy and are committed to protecting the personal data of our users. This policy outlines how information is collected, used, and safeguarded during gameplay.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
            <li><strong>Account Data:</strong> Email address, username, display name, and avatar when you sign up via Supabase Auth.</li>
            <li><strong>Gameplay & Session Data:</strong> Either/Or votes, Truth/Dare completions, Judge Me cases, comments, reactions, XP progression, and multiplayer room match scores.</li>
            <li><strong>Technical Data:</strong> IP addresses, browser types, and device information collected automatically for security, fraud prevention, and session persistence.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">3. How Information Is Used</h2>
          <p>
            Your information is used strictly to power game sessions, calculate server-authoritative progression (XP and levels), display public leaderboards, facilitate real-time multiplayer rooms, and moderate user-generated content.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">4. Third-Party Services & Advertising</h2>
          <p>
            We may partner with third-party service providers, including authentication infrastructure (Supabase) and advertising partners (such as Google AdSense). These providers may use cookies or web beacons to serve advertisements based on your prior visits to this or other websites.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">5. User Choices & Rights</h2>
          <p>
            You may review and edit your profile information at any time via your account settings. For data deletion inquiries, please contact our support team.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">6. Contact Information</h2>
          <p>
            If you have questions regarding this Privacy Policy, please reach out via our <a href="/contact" className="text-yellow-400 underline">Contact Page</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
