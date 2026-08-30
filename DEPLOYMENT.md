# Choose Your Chaos — Production Deployment Guide 🚀

This document outlines the step-by-step procedure for deploying **Choose Your Chaos** to **Vercel** with the connected **Supabase** production database.

---

## 1. Production Supabase Verification

Verify that your production Supabase project is active:
- **Project Ref**: `qagmshbmcbqydchdvizt`
- **Database Tables**: 19 tables with Row Level Security (RLS) active.
- **RPC Functions**:
  - `submit_question_vote`
  - `complete_truth_dare`
  - `submit_judge_vote`
  - `join_room_by_code`
  - `start_room_game`
  - `submit_room_answer`
  - `reveal_room_round`
  - `advance_room_round`

---

## 2. Production Environment Variables (Vercel)

Configure the following environment variables in your Vercel Project Settings (**Settings > Environment Variables**):

| Variable Name | Environment | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production & Preview | `https://qagmshbmcbqydchdvizt.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production & Preview | Your Supabase public anonymous key |
| `GEMINI_API_KEY` | Production & Preview (Server-Only) | Google Gemini API key for AI content generation |
| `NEXT_PUBLIC_ADSENSE_PUB_ID` | Production (Optional) | `ca-pub-XXXXXXXXXXXXXXXX` (when Google AdSense is approved) |

---

## 3. Deploying to Vercel

1. Push your Git repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: production release v1"
   git push origin main
   ```
2. In the [Vercel Dashboard](https://vercel.com/new), select **Import Project** from your GitHub repository.
3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Add the required Environment Variables listed above.
5. Click **Deploy**.

---

## 4. Post-Deployment Verification Checklist

After the Vercel build succeeds:
- [ ] **Home & Navigation**: Verify landing page, mode selector, and footer navigation.
- [ ] **Authentication Flow**: Test signup, email/password login, session persistence, and logout.
- [ ] **Either / Or Game** (`/play`): Vote on a question, verify percentage reveal, deterministic reaction, and `+5 XP` increment.
- [ ] **Truth or Dare** (`/truth-or-dare`): Toggle Truth/Dare modes, select Easy/Medium/Chaos difficulty, complete challenge, and verify `+XP`.
- [ ] **Judge Me Court** (`/judge-me`): Browse feed by Trending/New/Controversial, submit a case, deliver a verdict, post comments, and toggle reactions.
- [ ] **Multiplayer Rooms** (`/rooms`): Create a room lobby, join with a second browser/device using room code, lock in secret votes, and test simultaneous reveal.
- [ ] **Progression & Profile** (`/profile`, `/leaderboard`, `/achievements`): Check dynamic level progression bar, achievements unlock progress, and leaderboard rankings.
- [ ] **Staff Overwatch** (`/admin`): Verify staff telemetry, content review queue, report center, and user role manager (blocked for standard users).
- [ ] **Public Legal Pages**: Verify `/about`, `/faq`, `/contact`, `/privacy`, `/terms`, and `/cookie-policy`.
- [ ] **SEO & Indexing**: Check `/robots.txt` and `/sitemap.xml`.

---

## 5. Rollback Strategy

If an unexpected production incident occurs:
1. In the Vercel Deployments dashboard, find the previous stable deployment.
2. Click the three dots `...` and select **Instant Rollback**.
3. Traffic will instantly route to the prior build without downtime.
