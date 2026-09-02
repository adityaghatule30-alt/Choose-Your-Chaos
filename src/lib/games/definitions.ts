export type GameMode =
  | 'pick_for_me'
  | 'either_or'
  | 'mind_reader'
  | 'two_truths'

export interface GameDefinition {
  id: GameMode
  title: string
  subtitle: string
  description: string
  shortDescription: string
  iconName: string
  badge: string
  accentColor: string
  minPlayers: number
  maxPlayers: number
  supportsAI: boolean
}

export const GAME_DEFINITIONS: Record<GameMode, GameDefinition> = {
  pick_for_me: {
    id: 'pick_for_me',
    title: '😭 PICK FOR ME',
    subtitle: 'Predict Your Friend’s Choice',
    description: 'Take turns predicting what the other player will choose. +20 PTS for every correct prediction.',
    shortDescription: 'Predict your friend’s choice.',
    iconName: 'UserCheck',
    badge: '2-PLAYER PREDICTION',
    accentColor: 'pink',
    minPlayers: 2,
    maxPlayers: 2,
    supportsAI: true,
  },
  either_or: {
    id: 'either_or',
    title: '🎮 EITHER / OR',
    subtitle: 'Binary Dilemmas & Global Votes',
    description: 'Vote on impossible scenarios. Reveal squad percentages and deterministic witty reactions.',
    shortDescription: 'Vote on impossible dilemmas.',
    iconName: 'Play',
    badge: 'CLASSIC MULTIPLAYER',
    accentColor: 'yellow',
    minPlayers: 2,
    maxPlayers: 10,
    supportsAI: true,
  },
  mind_reader: {
    id: 'mind_reader',
    title: '🔮 MIND READER',
    subtitle: 'Predict Their Choice',
    description: 'Predict what the spotlight player will choose. Prove you actually know your squad.',
    shortDescription: "Predict the target's choice.",
    iconName: 'Sparkles',
    badge: 'PSYCHOLOGICAL PREDICTION',
    accentColor: 'purple',
    minPlayers: 2,
    maxPlayers: 10,
    supportsAI: true,
  },
  two_truths: {
    id: 'two_truths',
    title: '🃏 TWO TRUTHS, ONE CHAOS',
    subtitle: '3 Statements, 1 Fake',
    description: 'A player shares 3 wild statements. Two are true, one is pure fiction. Find the chaos.',
    shortDescription: 'Find the fake statement.',
    iconName: 'HelpCircle',
    badge: 'TRIVIA & LIES',
    accentColor: 'emerald',
    minPlayers: 2,
    maxPlayers: 10,
    supportsAI: true,
  },
}
