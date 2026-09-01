---
name: ui-ux-polish
description: Audit and improve the application's UI, UX, visual hierarchy, responsiveness, accessibility, consistency, and interaction design without unnecessary redesigns.
---

# UI / UX Polish

## Goal

Make Choose Your Chaos feel polished, intuitive, consistent, modern, and fun while preserving its existing identity and functionality.

## Core Rules

- Inspect the existing UI before changing it.
- Do not redesign the entire application unnecessarily.
- Preserve the existing visual identity.
- Prefer consistency over introducing new design patterns.
- Reuse existing components and styles.
- Do not add unnecessary dependencies.
- Make focused improvements with clear user benefit.

## Visual Hierarchy

Review:
- headings
- subtitles
- buttons
- cards
- labels
- icons
- important information
- secondary information

Ensure users can immediately understand:
1. Where they are.
2. What they can do.
3. What action is most important.
4. What happens next.

## Spacing

Check for:
- inconsistent padding
- inconsistent margins
- crowded sections
- excessive empty space
- inconsistent card spacing
- inconsistent button spacing
- poor vertical rhythm

Use the existing spacing system where possible.

## Typography

Check:
- font sizes
- font weights
- line heights
- text hierarchy
- readability
- long text wrapping
- mobile typography

Do not use too many font sizes or weights.

## Components

Review shared:
- buttons
- cards
- badges
- inputs
- modals
- navigation
- alerts
- loading states
- empty states

Ensure visually similar components behave consistently.

## Buttons

Every important button should clearly communicate:
- what it does
- whether it is available
- whether it is currently active
- whether an action is loading
- whether the action succeeded or failed

Check:
- hover
- active
- disabled
- loading
- focus
- mobile tap area

## Forms

Improve:
- labels
- placeholders
- validation
- error messages
- loading feedback
- success feedback
- keyboard usability

Do not rely only on placeholder text to explain an input.

## Navigation

Check:
- active page indication
- mobile navigation
- back navigation
- navigation consistency
- broken links
- confusing destinations

Users should always understand where they are.

## Game UX

Prioritize the actual gameplay experience.

Check:
- question visibility
- answer selection
- countdowns
- game state
- player state
- results
- scores
- winner states
- next-round actions

Important gameplay actions should be obvious and require minimal thinking.

## Multiplayer UX

Check:
- room creation
- room joining
- player list
- host indication
- ready state
- connection state
- reconnecting state
- player joining/leaving
- synchronized game state

Users should always understand:
- who is connected
- whose turn/action it is
- what they should do next
- whether the app is waiting

## Feedback

Every important user action should provide appropriate feedback.

Check:
- loading
- success
- failure
- copy confirmation
- vote confirmation
- joining room
- leaving room
- reconnecting
- offline state

Avoid unnecessary notifications.

## Responsive Design

Test:
- 320px
- 375px
- 390px
- 412px
- 768px
- desktop

Fix:
- overflow
- clipping
- overlapping elements
- broken grids
- unusable controls
- excessive scrolling
- awkward spacing

Do not simply hide overflowing content.

## Accessibility

Check:
- semantic HTML
- keyboard navigation
- visible focus
- accessible names
- icon-only buttons
- form labels
- color contrast
- reduced motion

Use ARIA only when necessary.

## Empty / Loading / Error States

Every important async screen should have intentional:
- loading state
- empty state
- error state
- retry behavior where appropriate

Avoid blank screens.

## Mobile UX

Prioritize:
- thumb-friendly controls
- large tap targets
- readable text
- minimal unnecessary scrolling
- clear primary actions
- stable layouts
- fast interactions

## Consistency

Do not create one-off styling when an existing component already solves the problem.

If multiple pages solve the same UI problem differently, prefer standardizing them.

## Performance

UI improvements must not unnecessarily increase:
- JavaScript
- bundle size
- DOM complexity
- network requests
- rendering cost

Coordinate with `animation-polish` for motion-related changes.

## Testing

Use `browser-testing` after meaningful UI/UX changes.

Check:
- desktop
- 375px mobile
- 390px mobile
- keyboard interaction where applicable
- browser console
- important user flows

## Rules For AI

Before changing a UI element ask:

1. Does this improve usability?
2. Is the hierarchy clear?
3. Is the interaction obvious?
4. Is the change consistent with the existing design?
5. Does it work on mobile?
6. Does it remain accessible?
7. Does it avoid unnecessary complexity?

If not, leave it unchanged.

## Completion

Report:
- UX problems found
- UI improvements
- responsive improvements
- accessibility improvements
- consistency improvements
- tests performed
- files changed
- remaining issues
