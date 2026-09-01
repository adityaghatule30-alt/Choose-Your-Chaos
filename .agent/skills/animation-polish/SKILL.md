---
name: animation-polish
description: Improve UI animations, transitions, micro-interactions, and motion design while keeping the application fast, responsive, accessible, and consistent.
---

# Animation Polish

## Goal

Make Choose Your Chaos feel polished, energetic, responsive, and fun without sacrificing performance.

## Core Rules

- Inspect existing animations before changing them.
- Preserve the existing visual identity.
- Prefer subtle, purposeful motion over excessive animation.
- Do not add animations everywhere.
- Do not introduce unnecessary animation libraries.
- Reuse the project's existing animation system when possible.
- Keep interactions responsive.
- Never block important user actions because of an animation.

## Micro-interactions

Improve where appropriate:
- button hover
- button press
- card hover
- card selection
- navigation transitions
- menu open/close
- modal appearance
- copy/share feedback
- answer selection
- voting
- game results
- player joining
- player leaving
- loading states
- success states
- error states

## Game Experience

Prioritize motion for:
- question transitions
- countdown timers
- answer selection
- answer reveal
- score changes
- winner announcements
- chaos score
- player reactions
- multiplayer state changes

Animations should make the game feel alive without slowing gameplay.

## Performance

Prefer:
- CSS transforms
- opacity
- GPU-friendly properties

Avoid unnecessary animation of:
- width
- height
- top
- left
- box-shadow
- expensive filters

Avoid:
- animation loops that run continuously without purpose
- excessive particles
- large DOM animation trees
- expensive JavaScript animation calculations
- animations that trigger layout repeatedly

Do not create memory leaks or unnecessary timers.

## Timing

Use short, natural durations for UI interactions.

Prefer:
- quick feedback for buttons
- slightly longer transitions for page/section changes
- staggered animation only when it improves visual hierarchy

Do not make basic interactions feel slow.

## Accessibility

Respect:

`prefers-reduced-motion`

When reduced motion is enabled:
- minimize non-essential motion
- remove large movement
- preserve essential feedback
- keep the interface usable

## Mobile

Animations must remain smooth on mobile.

Check:
- 375px
- 390px
- 412px
- desktop

Avoid animations that cause:
- scrolling problems
- accidental taps
- layout jumps
- excessive battery/CPU usage

## Multiplayer

Animations must never delay realtime state updates.

Realtime state should update immediately.

Animate the visual transition AFTER the state changes.

Do not use animation delays as synchronization mechanisms.

## Consistency

Use a consistent motion language across:
- buttons
- cards
- navigation
- modals
- game screens
- results
- notifications

Avoid every component having completely different animation behavior.

## Testing

Use the browser-testing skill after meaningful animation changes.

Check:
- animation smoothness
- interaction responsiveness
- mobile performance
- no layout shifts
- no console errors
- no broken interactions
- reduced-motion behavior

## Rules For AI

Before adding an animation ask:

1. Does it improve usability or game feel?
2. Is it necessary?
3. Can CSS handle it?
4. Will it remain smooth on mobile?
5. Could it interfere with interaction?
6. Does it respect reduced motion?

If the answer is no, do not add the animation.

## Completion

Report:
- animations improved
- interactions improved
- performance considerations
- mobile testing
- reduced-motion testing
- files changed
- remaining issues
