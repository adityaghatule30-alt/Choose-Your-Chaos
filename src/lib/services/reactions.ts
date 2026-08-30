/**
 * Deterministic template-based reaction system
 * Designed to provide contextual funny reactions without requiring external AI APIs.
 */

interface ReactionParams {
  choice: 'A' | 'B'
  percentChosen: number
  humorLevel?: 'light' | 'sarcastic' | 'dark'
  categorySlug?: string
}

export function generateVoteReaction({
  choice,
  percentChosen,
  humorLevel = 'sarcastic',
}: ReactionParams): string {
  // If user picked the massive majority choice (> 75%)
  if (percentChosen >= 75) {
    const majorityReactions = [
      "You went with the hive mind. At least you won't perish alone. 🐑",
      "Safe play! The internet agrees with your lack of adventurous spirit. 😂",
      "Overwhelming majority approved. Normalcy achieved. 🤝",
      "Bro played it as safe as a fixed deposit. Respect. 🏦",
    ]
    return majorityReactions[Math.floor(Math.random() * majorityReactions.length)]
  }

  // If user picked a controversial / chaotic minority choice (< 30%)
  if (percentChosen <= 30) {
    const chaoticReactions = [
      "You looked at both options and chose unadulterated violence. 💀",
      "A true agent of chaos! You belong in a watchlist. 🔥",
      "Only the bravest (or most unhinged) would click that. 😭",
      "Bold choice. Very bold. Enjoy your isolated throne. 👑",
    ]
    return chaoticReactions[Math.floor(Math.random() * chaoticReactions.length)]
  }

  // Balanced split (31% - 74%)
  if (humorLevel === 'dark') {
    const darkReactions = [
      "Grim dilemma, satisfactory chaos quotient. ☠️",
      "Moral compass: successfully recalibrated to question marks. 🧭",
      "Nobody wins here, but at least you took a stand. ⚡",
    ]
    return darkReactions[Math.floor(Math.random() * darkReactions.length)]
  }

  const standardReactions = [
    "Bro made a decisive move. Respect. 😂",
    "Calculated chaos. Exactly what we wanted to see. 🎯",
    "The room is split, but your allegiance is sealed. ⚔️",
    "Hard-hitting choice. Living dangerously today, aren't we? 🔥",
  ]
  return standardReactions[Math.floor(Math.random() * standardReactions.length)]
}
