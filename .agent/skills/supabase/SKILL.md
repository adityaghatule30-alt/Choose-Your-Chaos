---
name: supabase
description: Safely develop and review Supabase database, authentication, Row Level Security, and realtime functionality.
---

# Supabase Development Skill

## Core Rule
Inspect the existing Supabase implementation before making changes.

Do not rewrite working database, authentication, or realtime logic unnecessarily.

Prefer small, focused changes.

## Database
- Inspect the existing schema before creating or changing tables.
- Reuse existing tables and relationships when appropriate.
- Use migrations for schema changes.
- Add appropriate indexes for frequently queried columns.
- Avoid unnecessary database queries.
- Select only the data required by the feature.

## Row Level Security
- Check whether RLS is enabled on affected tables.
- Never disable RLS simply to make functionality work.
- Review SELECT, INSERT, UPDATE, and DELETE policies.
- Ensure users cannot access or modify another user's protected data.
- Never trust user IDs supplied by the client for authorization.
- Authorization must be enforced by the database or trusted server-side logic.

## Authentication
- Preserve the existing authentication flow.
- Handle session loading correctly.
- Handle expired sessions.
- Protect authenticated functionality.
- Do not expose authentication tokens or secrets.
- Do not introduce new verification requirements unless explicitly requested.

## Realtime
When using Supabase Realtime:
- Clean up subscriptions when components unmount.
- Prevent duplicate subscriptions.
- Prevent duplicate event handling.
- Handle reconnects.
- Handle connection failures.
- Avoid stale state.
- Verify that realtime events respect authorization and RLS.

## Security
Never expose:
- Supabase service-role keys
- Private API keys
- Database passwords
- Server secrets

Only public client configuration may be used in frontend code.

## Error Handling
Handle:
- Database errors
- Authentication errors
- Network failures
- Empty results
- Permission failures
- Realtime connection failures

Never silently ignore important Supabase errors.

## Performance
- Avoid unnecessary database requests.
- Avoid fetching large datasets when pagination or limits are sufficient.
- Avoid repeatedly creating realtime subscriptions.
- Use efficient queries.
- Consider indexes for frequently filtered or sorted columns.

## Changes
Before changing Supabase:
1. Inspect the existing implementation.
2. Identify affected tables, policies, queries, and components.
3. Make the smallest safe change.
4. Test the affected functionality.
5. Check authentication and authorization.
6. Check for regressions.

## Completion
Do not claim a Supabase feature works unless it has been tested.

Report:
- Database changes
- RLS changes
- Authentication changes
- Realtime changes
- Tests performed
- Remaining risks or issues
