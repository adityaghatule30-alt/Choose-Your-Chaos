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
