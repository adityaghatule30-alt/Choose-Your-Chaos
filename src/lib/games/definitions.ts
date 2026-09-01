export type GameMode =
  | 'either_or'
  | 'mind_reader'
  | 'worst_answer'
  | 'whos_lying'
  | 'imposter'
  | 'guess_player'
  | 'chain_reaction'
  | 'two_truths'
  | 'caption_chaos'

export interface GameDefinition {
  id: GameMode
  title: string
  subtitle: string
  description: string
  iconName: string
  badge: string
  accentColor: string
  minPlayers: number
  maxPlayers: number
  supportsAI: boolean
}

export const GAME_DEFINITIONS: Record<GameMode, GameDefinition> = {
  either_or: {
    id: 'either_or',
    title: '🎮 EITHER / OR',
    subtitle: 'Binary Dilemmas & Global Votes',
    description: 'Vote on impossible scenarios. Reveal squad percentages and deterministic witty reactions.',
    iconName: 'Play',
    badge: 'CLASSIC MULTIPLAYER',
    accentColor: 'yellow',
    minPlayers: 2,
    maxPlayers: 10,
    supportsAI: true,
  },
  mind_reader: {
    id: 'mind_reader',
    title: '🧠 MIND READER',
    subtitle: 'Predict Their Choice',
    description: 'Predict what the spotlight player will choose. Prove you actually know your squad.',
    iconName: 'Sparkles',
    badge: 'PSYCHOLOGICAL PREDICTION',
    accentColor: 'purple',
    minPlayers: 2,
    maxPlayers: 10,
    supportsAI: true,
  },
  worst_answer: {
    id: 'worst_answer',
    title: '💀 WORST ANSWER WINS',
    subtitle: 'Unhinged Comedy Showdown',
    description: 'Submit the worst, most chaotic response to a normal situation. Funniest disaster wins.',
    iconName: 'Skull',
    badge: 'DARK COMEDY',
    accentColor: 'red',
    minPlayers: 2,
    maxPlayers: 10,
    supportsAI: true,
  },
  whos_lying: {
    id: 'whos_lying',
    title: "🕵️ WHO'S LYING?",
    subtitle: 'Deception & Spotting Cap',
    description: 'Everyone answers the dilemma. One answer is secretly completely fabricated. Spot the lie.',
    iconName: 'ShieldAlert',
    badge: 'BLUFFING & SOCIAL DEDUCTION',
    accentColor: 'orange',
    minPlayers: 2,
    maxPlayers: 10,
    supportsAI: true,
  },
  imposter: {
    id: 'imposter',
    title: '🎭 IMPOSTER',
    subtitle: 'Find The Secret Outsider',
    description: 'Everyone receives the exact same prompt, except for one secret imposter. Vote them out.',
    iconName: 'UserCheck',
    badge: 'HIDDEN ROLE',
    accentColor: 'pink',
    minPlayers: 3,
    maxPlayers: 10,
    supportsAI: true,
  },
  guess_player: {
    id: 'guess_player',
    title: '👀 GUESS THE PLAYER',
    subtitle: 'Anonymous Confessions',
    description: 'Everyone submits an anonymous response. Guess who in the room wrote which confession.',
    iconName: 'Eye',
    badge: 'ANONYMOUS REVEAL',
    accentColor: 'indigo',
    minPlayers: 2,
    maxPlayers: 10,
    supportsAI: true,
  },
  chain_reaction: {
    id: 'chain_reaction',
    title: '🧨 CHAIN REACTION',
    subtitle: 'Collaborative Story Mayhem',
    description: 'Each player adds one chaotic sentence to build a wild squad story before Chaos AI writes the ending.',
    iconName: 'Flame',
    badge: 'STORY BUILDER',
    accentColor: 'amber',
    minPlayers: 2,
    maxPlayers: 10,
    supportsAI: true,
  },
  two_truths: {
    id: 'two_truths',
    title: '🃏 TWO TRUTHS, ONE CHAOS',
    subtitle: '3 Statements, 1 Fake',
    description: 'A player shares 3 wild statements. Two are true, one is pure fiction. Find the chaos.',
    iconName: 'HelpCircle',
    badge: 'TRIVIA & LIES',
    accentColor: 'emerald',
    minPlayers: 2,
    maxPlayers: 10,
    supportsAI: true,
  },
  caption_chaos: {
    id: 'caption_chaos',
    title: '📸 CAPTION CHAOS',
    subtitle: 'Meme & Situation Captions',
    description: 'Get a chaotic real-life scenario and write the funniest caption. Group votes for the crown.',
    iconName: 'Camera',
    badge: 'MEME JURY',
    accentColor: 'cyan',
    minPlayers: 2,
    maxPlayers: 10,
    supportsAI: true,
  },
}
