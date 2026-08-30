# Choose Your Chaos 🎮💀

Choose Your Chaos is an interactive, mobile-first social party game platform built for impossible dilemmas, daring truths, merciless court trials, and real-time multiplayer lobbies with friends.

---

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS & Lucide Icons
- **Backend & Database**: PostgreSQL on Supabase with Row Level Security (RLS)
- **Auth & Realtime**: `@supabase/ssr` & Supabase Realtime Channels
- **AI Content Engine**: Google Gemini API with validation, deduplication, quality, and safety pipeline
- **Progression**: Server-Authoritative PostgreSQL RPC functions for XP, levels, and achievements
- **Deployment Target**: Vercel

---

## 🛠️ Key Game Modes

1. **Either / Or Dilemmas** (`/play`): Vote on hilarious and thought-provoking scenarios. Reveal global community percentage distributions and earn deterministic XP rewards.
2. **Truth or Dare** (`/truth-or-dare`): Pick your poison across Easy, Medium, or Chaos difficulty modes with server-backed completion verification.
3. **Judge Me Court** (`/judge-me`): File real-life situations and watch the jury deliver verdicts (`Not Guilty`, `Guilty`, `Absolutely Criminal`) with comments and reaction badges.
4. **Multiplayer Friend Rooms** (`/rooms`): Create private lobbies, enter 6-character room codes (`CHAOS7`), lock in secret votes, and reveal squad choices simultaneously with live Chaos Champion podiums.
5. **Progression & Leaderboards** (`/profile`, `/leaderboard`, `/achievements`): Track your continuous level curve, unhackable XP balances, and hall of chaos achievement badges.
6. **Staff Overwatch & Moderation** (`/admin`): Complete administrative suite for candidate content review, court case moderation, community report resolution, and user role management.

---

## ⚙️ Environment Configuration

Create a `.env.local` file in your root directory based on the following template:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key

# Server-Only AI Content Generator
GEMINI_API_KEY=your-gemini-api-key

# Optional: Google AdSense (Production Monetization)
NEXT_PUBLIC_ADSENSE_PUB_ID=ca-pub-XXXXXXXXXXXXXXXX
```

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Production Build
```bash
npm run build
npm start
```

---

## 🛡️ Security & Privacy

- **Row Level Security**: All 19 database tables are protected by PostgreSQL RLS.
- **Server-Authoritative Progression**: XP, Chaos Scores, and Level advances are calculated within PostgreSQL RPC functions.
- **Secret Hygiene**: Zero leakage of service role keys or Gemini API keys to client bundles.
- **Rate Limiting**: Integrated sliding-window rate limiters on high-frequency write endpoints.
- **HTTP Security Headers**: Enforces `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, and `Permissions-Policy`.
