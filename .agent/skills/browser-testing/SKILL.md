---
name: browser-testing
description: Test the actual web application in a browser after changes. Use for UI, navigation, authentication, forms, multiplayer, responsive design, and regression testing.
---

# Browser Testing

## Goal
Verify the real application instead of assuming the code works.

## Test
- Start the development server if needed.
- Open the affected page.
- Test the main user flow.
- Test buttons, links, forms, loading, success, and error states.
- Check browser console for unexpected errors.

## Responsive
Check:
- 375px
- 390px
- 768px
- 1024px
- Desktop

Check for overflow, overlapping elements, broken layouts, unreadable text, and unusable touch targets.

## Multiplayer
When applicable:
1. Open two browser sessions.
2. Create a room in session 1.
3. Join from session 2.
4. Verify both sessions receive correct realtime updates.
5. Test joining and leaving.
6. Test refresh/reconnect.
7. Check for duplicate events and stale state.

## Authentication
When applicable:
- Test logged-out state.
- Test logged-in state.
- Test protected routes.
- Test logout.
- Test refresh while authenticated.
- Never expose credentials or secrets.

## Completion
Do not claim a feature works unless the relevant browser flow was tested.

Report:
- Tests performed
- Passed
- Failed
- Console errors
- Remaining issues
