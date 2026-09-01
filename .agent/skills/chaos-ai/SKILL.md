---
name: chaos-ai
description: Improve Choose Your Chaos AI-powered content generation, difficulty, variety, personalization, quality, and response speed while preventing repetitive or low-quality content.
---

# Chaos AI Skill

## Goal

Make Chaos AI generate situations that are:

- funny
- unpredictable
- difficult to choose
- short
- original
- relatable
- varied
- fast to generate
- appropriate for the game
- consistent with the Choose Your Chaos personality

The AI should feel like a chaotic game master, not a generic chatbot.

## Core Rules

Before changing AI behavior:
- Inspect the existing AI implementation.
- Inspect prompts.
- Inspect API routes.
- Inspect model configuration.
- Inspect how generated content is stored.
- Inspect existing question/content data.
- Preserve working functionality.

Do not replace the AI architecture unnecessarily.

## CONTENT LENGTH

Generated situations should be concise.

Target:
- 10–25 words for most situations.
- Maximum approximately 1–2 short sentences.

Avoid:
- long paragraphs
- unnecessary backstory
- repeated explanations
- redundant setup
- multiple unrelated scenarios

The player should understand the situation within a few seconds.

## OPTIONS

Generate two clearly different choices.

Target:
- approximately 5–10 words per option.

Options should:
- be immediately understandable
- create a genuine dilemma
- be funny or interesting
- not repeat the situation unnecessarily

Avoid options that are simply:
"Yes" vs "No"

unless the question specifically requires it.

## ANTI-REPETITION

Before generating new content, consider recently generated/used content when the existing architecture allows it.

Avoid:
- duplicate questions
- near-duplicate questions
- identical scenarios with different wording
- repeated punchlines
- repeated A/B choices
- repeated openings
- repeated characters/situations
- repeated jokes

Do not assume two questions are unique just because their wording differs.

Compare the underlying idea.

Example:

"Your crush sees your search history."

and

"Your crush finds your browser history."

These are the SAME scenario.

Do not generate both.

## VARIETY

Maintain variety across categories such as:

- school
- college
- work
- friendships
- relationships
- family
- money
- social media
- gaming
- food
- travel
- technology
- embarrassing situations
- absurd situations
- everyday life
- internet culture
- hypothetical situations

Do not overuse one category.

## CHAOS LEVEL

Support different levels of difficulty/chaos where the existing game supports it.

Example:

Level 1:
Easy / relatable

Level 2:
Difficult choice

Level 3:
Chaotic

Level 4:
Absolutely cursed

Higher difficulty should create harder decisions, not simply longer questions.

## PERSONALIZATION

If the application already knows safe user preferences or game context, use them to improve relevance.

Do not use sensitive personal information.

Do not expose private user data to the AI unnecessarily.

## GAME CONTEXT

The AI should understand the current game mode.

Do not generate:
- Truth-or-dare content for an Either/Or game
- relationship-specific content for unrelated modes
- long explanations where a quick choice is expected

Match generated content to the active game mode.

## HUMOR

Prioritize:
- unexpected combinations
- relatable situations
- absurd consequences
- clever choices
- playful chaos
- internet culture
- surprising twists

Avoid:
- repetitive meme phrases
- forced slang
- trying too hard to sound Gen-Z
- generic "Would you rather..." filler
- predictable choices

Short does not mean boring.

## QUALITY FILTER

Before returning generated content, evaluate:

1. Is it understandable immediately?
2. Is it genuinely a choice?
3. Are both options interesting?
4. Is it unique?
5. Is it short?
6. Is it funny/interesting?
7. Is it appropriate for the game?
8. Does it avoid repeating recent content?
9. Does it avoid unnecessary context?
10. Would a real player want to answer it?

Reject and regenerate weak content.

## DUPLICATE DETECTION

If the existing project has stored questions, use the existing database/search architecture to identify similar content where practical.

Prefer semantic similarity over exact string comparison.

Do not add an expensive similarity system unless it provides a real benefit.

Start with the simplest reliable approach supported by the existing architecture.

## AI RESPONSE FORMAT

When structured output is expected, return only the required fields.

Avoid unnecessary prose around generated game content.

For example:

{
  "situation": "...",
  "optionA": "...",
  "optionB": "..."
}

Follow the project's existing schema instead of inventing a new one.

## PERFORMANCE

AI generation should feel fast.

Inspect:
- unnecessary API calls
- duplicate generation requests
- repeated prompt construction
- unnecessarily large prompts
- excessive response tokens
- unnecessary database reads

Keep prompts concise while preserving quality.

Do not repeatedly send the entire question bank to the model.

Use targeted context where possible.

## CACHING

If appropriate for the existing architecture:
- reuse safe generated content
- avoid regenerating identical requests
- avoid duplicate concurrent generation

Do not cache personalized or sensitive responses incorrectly.

## ERROR HANDLING

Handle:
- AI API failures
- timeouts
- malformed AI responses
- rate limits
- invalid generated content
- empty responses

Never display raw AI/API errors to users if they expose internal details.

Provide a useful fallback.

## SAFETY

Do not generate content involving:
- instructions for wrongdoing
- dangerous activities
- targeted harassment
- private personal information
- sexual content involving minors
- self-harm encouragement
- hateful content

Keep the game chaotic without becoming unsafe.

## AI COST / TOKEN EFFICIENCY

Keep generation efficient.

- Use concise system prompts.
- Request only the fields needed.
- Avoid unnecessary conversation history.
- Avoid sending huge datasets.
- Limit output length.
- Avoid repeated generation attempts when possible.
- Cache/reuse safe content where appropriate.

Quality should remain high while minimizing unnecessary AI usage.

## TESTING

Use `browser-testing` for user-facing AI functionality.

Test:
- generation
- regeneration
- loading state
- error state
- malformed response handling
- mobile display
- long/short generated content
- duplicate prevention
- game-mode consistency

## FINAL REPORT

Report:
- AI behavior improved
- prompt improvements
- duplicate prevention
- content-quality improvements
- performance improvements
- token/cost improvements
- safety improvements
- files changed
- tests performed
- remaining issues
