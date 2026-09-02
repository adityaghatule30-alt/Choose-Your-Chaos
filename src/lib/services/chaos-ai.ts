import { GoogleGenAI } from '@google/genai'
import { generateVoteReaction } from './reactions'

interface ChaosRoastParams {
  situation: string
  optionA: string
  optionB: string
  choice: 'A' | 'B'
  percentChosen?: number
  playerName?: string
}

const SYSTEM_INSTRUCTION = `You are "Chaos AI" — a rude, witty, sarcastic, internet-native chaotic game master in the viral party game "Choose Your Chaos".

Your single job is to react to the player's specific decision with a short, contextual roast or commentary.

Rules:
1. Short & Punchy: 5 to 20 words target (hard max 30 words). Usually ONE sentence.
2. Contextual: You MUST roast the specific SITUATION and the PLAYER'S CHOICE. Never output generic filler like "That's crazy!" or "Interesting choice!".
3. Delivery Styles (vary naturally):
   - Savage roast of their decision
   - Mock breaking news headline ("BREAKING NEWS: Local idiot chooses...")
   - Dramatic courtroom verdict
   - Sarcastic observation / fake serious analysis
   - Absurd consequence
4. Playful Chaos: Roast the choice, the fictional logic, or consequences. NEVER attack protected traits (race, religion, gender, sexuality, disability).
5. Output format: Return strictly a valid JSON object:
{"reaction": "Your contextual roast text here 💀"}
`

export async function generateChaosAIRoast({
  situation,
  optionA,
  optionB,
  choice,
  percentChosen,
  playerName,
}: ChaosRoastParams): Promise<string> {
  const chosenOptionText = choice === 'A' ? optionA : optionB
  const unchosenOptionText = choice === 'A' ? optionB : optionA

  // Default local fallback reaction in case of timeout or API unavailability
  const fallbackReaction = generateVoteReaction({
    choice,
    percentChosen: percentChosen ?? 50,
  })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey.trim().length === 0) {
    return fallbackReaction
  }

  try {
    const ai = new GoogleGenAI({ apiKey })
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

    const prompt = `Game Context:
Player Name: ${playerName || 'Player'}
Situation / Dilemma: "${situation}"
Option A: "${optionA}"
Option B: "${optionB}"
Selected Choice: "${chosenOptionText}" (Option ${choice})
Rejected Choice: "${unchosenOptionText}"
${percentChosen !== undefined ? `Percentage of players who agree with this choice: ${percentChosen}%` : ''}

Generate 1 short, witty, contextual roast according to your system instruction.`

    // Set a strict 2.5 second timeout guard to avoid blocking game UI
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2500)

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.9,
          maxOutputTokens: 60,
        },
      })

      clearTimeout(timeoutId)

      const text = response.text?.trim()
      if (!text) return fallbackReaction

      const parsed = JSON.parse(text)
      if (parsed && typeof parsed.reaction === 'string' && parsed.reaction.trim().length > 0) {
        return parsed.reaction.trim()
      }

      return fallbackReaction
    } catch {
      clearTimeout(timeoutId)
      return fallbackReaction
    }
  } catch {
    return fallbackReaction
  }
}

export interface MatchResultParams {
  gameMode: string
  totalRounds: number
  pickForMeStats?: Array<{
    userId: string
    displayName: string
    correct: number
    total: number
    score: number
  }>
  playerScores: Array<{
    displayName: string
    score: number
  }>
}

export async function generateMatchResultReaction({
  gameMode,
  totalRounds,
  pickForMeStats,
  playerScores,
}: MatchResultParams): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY

  // Default smart fallbacks
  let fallback = "Match concluded in total chaos! 💀"
  if (gameMode === 'who_sent_this') {
    fallback = "The squad has spoken: your meme taste is officially on trial. 💀"
  } else if (gameMode === 'caption_battle') {
    fallback = "Elite comedy warfare. Some of those captions belong in a museum (or jail). 🏆"
  } else if (gameMode === 'pick_for_me') {
    const p1 = pickForMeStats?.[0]
    const p2 = pickForMeStats?.[1]
    if (p1 && p2) {
      if (p1.correct + p2.correct >= (totalRounds * 0.75)) {
        fallback = "You know each other frighteningly well. Please use this telepathic power responsibly. 💀"
      } else if (p1.correct + p2.correct <= (totalRounds * 0.25)) {
        fallback = "You two have officially proven that friendship does not equal psychic ability. 😭"
      } else {
        fallback = "Decent predictions, but there are still dark chaotic secrets between you two. 👁️"
      }
    }
  }

  if (!apiKey || apiKey.trim().length === 0) {
    return fallback
  }

  try {
    const ai = new GoogleGenAI({ apiKey })
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

    let contextDetails = `Game Mode: ${gameMode}\nTotal Rounds: ${totalRounds}\n`
    if (gameMode === 'pick_for_me' && pickForMeStats) {
      contextDetails += `Prediction Accuracy:\n${pickForMeStats.map(p => `- ${p.displayName}: ${p.correct}/${p.total} correct predictions (${p.score} PTS)`).join('\n')}`
    } else {
      contextDetails += `Players: ${playerScores.map(p => `${p.displayName} (${p.score} PTS)`).join(', ')}`
    }

    const prompt = `You are Chaos AI — a witty, sarcastic game master.
The 2-player match just finished.

Game Result Data:
${contextDetails}

Generate EXACTLY ONE sentence (5 to 25 words max) roasting or reacting to their actual match statistics.
Rules:
- Be playful, witty, slightly rude, and highly contextual to their exact match score / accuracy.
- Return strictly valid JSON: {"reaction": "your roast here 💀"}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2500)

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.9,
          maxOutputTokens: 60,
        },
      })

      clearTimeout(timeoutId)
      const text = response.text?.trim()
      if (!text) return fallback

      const parsed = JSON.parse(text)
      if (parsed && typeof parsed.reaction === 'string' && parsed.reaction.trim().length > 0) {
        return parsed.reaction.trim()
      }
      return fallback
    } catch {
      clearTimeout(timeoutId)
      return fallback
    }
  } catch {
    return fallback
  }
}

