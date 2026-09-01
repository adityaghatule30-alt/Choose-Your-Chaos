# Choose Your Chaos — AI Development Rules

## Core Rule
Before changing anything, inspect the existing code and understand how the feature currently works.

Do not rewrite working functionality unnecessarily.
Prefer small, focused changes over large rewrites.
Reuse existing components, utilities, hooks, styles, and services whenever possible.

## Project Safety
- Do not delete working features without explicit permission.
- Do not change unrelated files.
- Do not replace the existing architecture unless necessary.
- Before modifying shared components, check where they are used.
- Preserve existing functionality while adding new features.

## Frontend
- Keep the UI responsive and mobile-first.
- Maintain the existing Choose Your Chaos visual style.
- Reuse existing design patterns.
- Keep animations smooth and lightweight.
- Avoid unnecessary dependencies.
- Handle loading, error, empty, and success states.
- Never leave broken buttons or dead UI elements.

## Backend
- Use the existing Supabase architecture.
- Never expose secret keys in frontend code.
- Never bypass Row Level Security.
- Validate user-controlled input.
- Handle database and network errors properly.
- Do not modify the database schema without a proper migration.

## Authentication
- Preserve the existing authentication flow.
- Do not introduce email verification or authentication steps unless explicitly requested.
- Handle logged-in and logged-out states correctly.

## Realtime / Multiplayer
- Clean up realtime subscriptions when components unmount.
- Handle reconnects and connection failures.
- Prevent duplicate event handling.
- Handle players joining and leaving safely.
- Avoid race conditions.

## Code Quality
- Prefer readable, maintainable code.
- Avoid duplicated logic.
- Keep components reasonably small.
- Use meaningful variable and function names.
- Remove unused imports and dead code.
- Do not add unnecessary abstractions.

## Testing
Before considering a feature complete:
1. Run the application.
2. Test the changed feature.
3. Check the browser console.
4. Check for build errors.
5. Check for TypeScript/ESLint errors if applicable.
6. Test important error states.
7. Test mobile responsiveness.
8. Make sure existing features still work.

## Before Finishing
Always report:
- What you changed.
- Which files you changed.
- Any issues discovered.
- Any tests performed.
- Anything that still needs attention.

## Important
If something is unclear, inspect the existing implementation before making assumptions.
Do not silently change requirements.
Do not claim something works unless it has been tested.
