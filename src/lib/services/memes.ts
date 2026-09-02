export interface MemeItem {
  id: string
  url: string
  title: string
  subreddit: string
  author: string
  postLink: string
  ups?: number
  preview?: string[]
}

const FALLBACK_MEMES: MemeItem[] = [
  {
    id: 'fb-01',
    url: 'https://images.unsplash.com/photo-1534972195531-a756b1126f24?auto=format&fit=crop&w=800&q=80',
    title: 'When you fix a bug and create 15 new ones',
    subreddit: 'programmerhumor',
    author: 'ChaosMaster',
    postLink: 'https://reddit.com/r/programmerhumor',
    ups: 4200,
  },
  {
    id: 'fb-02',
    url: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=800&q=80',
    title: 'Me looking at my life choices at 3 AM',
    subreddit: 'me_irl',
    author: 'SleepyChaos',
    postLink: 'https://reddit.com/r/me_irl',
    ups: 8900,
  },
  {
    id: 'fb-03',
    url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
    title: 'When your friend says "trust me bro"',
    subreddit: 'memes',
    author: 'Doggomeme',
    postLink: 'https://reddit.com/r/memes',
    ups: 12500,
  },
  {
    id: 'fb-04',
    url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    title: 'Attending college lecture on 2 hours of sleep',
    subreddit: 'me_irl',
    author: 'CollegeSurvivor',
    postLink: 'https://reddit.com/r/me_irl',
    ups: 7600,
  },
  {
    id: 'fb-05',
    url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
    title: 'When the group project leader asks for your contribution',
    subreddit: 'memes',
    author: 'SlackerSquad',
    postLink: 'https://reddit.com/r/memes',
    ups: 15400,
  },
  {
    id: 'fb-06',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    title: 'Judging my friends silently in the WhatsApp group',
    subreddit: 'wholesomememes',
    author: 'CatJudge',
    postLink: 'https://reddit.com/r/wholesomememes',
    ups: 9200,
  },
  {
    id: 'fb-07',
    url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80',
    title: 'When the teacher makes eye contact during viva',
    subreddit: 'me_irl',
    author: 'VivaPanic',
    postLink: 'https://reddit.com/r/me_irl',
    ups: 11300,
  },
  {
    id: 'fb-08',
    url: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80',
    title: 'Me pretending I understood the plan',
    subreddit: 'memes',
    author: 'ChaosPup',
    postLink: 'https://reddit.com/r/memes',
    ups: 6700,
  },
]

let memeCache: MemeItem[] = []
let lastPrefetchTime = 0
const PREFETCH_INTERVAL = 30000

function isValidMemeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  const lower = url.toLowerCase()
  return (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.gif') ||
    lower.includes('i.redd.it') ||
    lower.includes('i.imgur.com')
  )
}

export async function prefetchMemes(): Promise<void> {
  const now = Date.now()
  if (memeCache.length > 5 && now - lastPrefetchTime < PREFETCH_INTERVAL) {
    return
  }

  lastPrefetchTime = now

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)

    const res = await fetch('https://meme-api.com/gimme/15', {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ChooseYourChaos/1.0',
      },
      cache: 'no-store',
    })

    clearTimeout(timeout)

    if (!res.ok) {
      console.warn('[MemeService] API response not ok:', res.status)
      return
    }

    const data = await res.json()
    const rawMemes: any[] = data.memes || (data.url ? [data] : [])

    const validMemes: MemeItem[] = rawMemes
      .filter((m) => m && !m.nsfw && !m.spoiler && isValidMemeUrl(m.url))
      .map((m) => ({
        id: m.postLink || `meme-${Math.random().toString(36).substring(2, 9)}`,
        url: m.url,
        title: m.title || 'Meme',
        subreddit: m.subreddit || 'memes',
        author: m.author || 'Anonymous',
        postLink: m.postLink || 'https://reddit.com',
        ups: m.ups || 0,
        preview: Array.isArray(m.preview) ? m.preview : undefined,
      }))

    if (validMemes.length > 0) {
      const existingIds = new Set(memeCache.map((m) => m.id))
      const newUnique = validMemes.filter((m) => !existingIds.has(m.id))
      memeCache = [...memeCache, ...newUnique].slice(-40)
    }
  } catch (err: any) {
    console.warn('[MemeService] Failed to prefetch memes from Reddit API:', err?.message || err)
  }
}

export async function getRandomMeme(usedIds: string[] = []): Promise<MemeItem> {
  if (memeCache.length < 5) {
    await prefetchMemes()
  }

  const unusedFromCache = memeCache.filter((m) => !usedIds.includes(m.id))

  if (unusedFromCache.length > 0) {
    const selected = unusedFromCache.shift()!
    memeCache = memeCache.filter((m) => m.id !== selected.id)
    return selected
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const res = await fetch('https://meme-api.com/gimme', {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ChooseYourChaos/1.0',
      },
      cache: 'no-store',
    })

    clearTimeout(timeout)

    if (res.ok) {
      const data = await res.json()
      if (data && !data.nsfw && !data.spoiler && isValidMemeUrl(data.url)) {
        return {
          id: data.postLink || `meme-${Math.random().toString(36).substring(2, 9)}`,
          url: data.url,
          title: data.title || 'Meme',
          subreddit: data.subreddit || 'memes',
          author: data.author || 'Anonymous',
          postLink: data.postLink || 'https://reddit.com',
          ups: data.ups || 0,
        }
      }
    }
  } catch {
    // API fallback
  }

  const unusedFallbacks = FALLBACK_MEMES.filter((m) => !usedIds.includes(m.id))
  if (unusedFallbacks.length > 0) {
    const idx = Math.floor(Math.random() * unusedFallbacks.length)
    return unusedFallbacks[idx]
  }

  const fallbackIdx = Math.floor(Math.random() * FALLBACK_MEMES.length)
  return FALLBACK_MEMES[fallbackIdx]
}
