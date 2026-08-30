const CHAOS_AI_COMMENTS = [
  "That answer came WAY too quickly. 👀",
  "Nobody is asking the important question.",
  "I'm starting to think they have something to hide. 💀",
  "The sweat drops are visible through the screen. 💦",
  "Absolute cap detected. Recalibrating lie detector... 🤖",
  "Bro answered like a politician facing a corruption scandal. 💼",
  "That hesitated pause spoke 10,000 words. 🧐",
  "The room went dead silent. We need a court judge here! ⚖️",
  "Wildest confession of 2026. Taking notes for the dossier. 📝",
  "I would have used a skip on that one. Respect the boldness though! 🔥",
]

export function getRandomChaosAIComment(): string {
  return CHAOS_AI_COMMENTS[Math.floor(Math.random() * CHAOS_AI_COMMENTS.length)]
}

// Only trigger Chaos AI commentary ~35% of the time to keep it unpredictable
export function shouldTriggerChaosAI(): boolean {
  return Math.random() < 0.35
}
