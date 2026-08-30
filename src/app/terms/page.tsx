import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Choose Your Chaos',
  description: 'Terms and conditions governing the use of Choose Your Chaos.',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 leading-relaxed">
      <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">TERMS OF SERVICE</h1>
      <p className="text-xs text-neutral-500 mb-8">Last Updated: August 2026</p>

      <div className="space-y-6 text-sm text-neutral-300">
        <section>
          <h2 className="text-lg font-bold text-white mb-2">1. Agreement to Terms</h2>
          <p>
            By accessing or playing Choose Your Chaos, you agree to be bound by these Terms of Service. If you do not agree to these terms, please discontinue using the platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">2. Acceptable Use & Code of Conduct</h2>
          <p>
            Choose Your Chaos is a playful social game designed for fun. Users must never post or submit content that is:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-400 mt-2">
            <li>Dangerous, illegal, or promoting physical self-harm.</li>
            <li>Hate speech, harassing, defamatory, or threatening.</li>
            <li>Explicitly obscene, non-consensual, or infringing on intellectual property rights.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">3. User-Generated Content & Moderation</h2>
          <p>
            Users are solely responsible for situations, cases, and comments submitted to the platform. We reserve the right to review, moderate, remove, or ban accounts violating our safety standards without prior notice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">4. Disclaimers & Limitation of Liability</h2>
          <p>
            Choose Your Chaos is provided on an "AS IS" and "AS AVAILABLE" basis. While we strive to maintain uninterrupted uptime, we make no warranties regarding continuous availability or fitness for a particular purpose.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">5. Changes to Terms</h2>
          <p>
            We may update these terms periodically. Continued use of the platform constitutes acceptance of the revised terms.
          </p>
        </section>
      </div>
    </div>
  )
}
