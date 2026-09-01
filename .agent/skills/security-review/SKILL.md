---
name: security-review
description: Review the application for security vulnerabilities, especially authentication, authorization, Supabase, RLS, secrets, API access, input validation, and client-side exposure.
---

# Security Review

## Goal
Find security vulnerabilities before they reach production.

## Authentication
Check:
- Authentication flows.
- Protected routes.
- Session handling.
- Logout behavior.
- Password reset flows.
- Unauthorized access attempts.

## Authorization
Check:
- Users can only access their own data.
- Admin functionality is properly protected.
- Server-side authorization is enforced.
- Client-side checks are not treated as security boundaries.

## Supabase
Check:
- Row Level Security is enabled where required.
- RLS policies prevent unauthorized reads, inserts, updates, and deletes.
- Service-role keys are never exposed to the browser.
- Database queries do not trust client-provided user IDs.
- Sensitive database operations are protected.

## Secrets
Search for:
- API keys.
- Passwords.
- Tokens.
- Service-role keys.
- Private credentials.
- Secrets committed to source code.

Never expose secrets through frontend code or public environment variables.

## Input Validation
Check:
- User input is validated.
- Unexpected values are rejected safely.
- User-generated content cannot execute arbitrary scripts.
- URLs and redirects are validated where applicable.

## API Security
Check:
- Sensitive endpoints require authorization.
- Requests cannot manipulate another user's data.
- Rate limiting is considered for abuse-prone actions.
- Error responses do not expose sensitive information.

## Multiplayer / Realtime
Check:
- Players cannot modify another player's protected data.
- Room access is properly controlled.
- Realtime events do not leak private information.
- Client messages cannot bypass authorization.
- Race conditions cannot be abused to corrupt state.

## Frontend
Check:
- No secrets are bundled into client-side JavaScript.
- Dangerous HTML rendering is avoided or sanitized.
- Sensitive information is not stored unnecessarily in localStorage.
- Authentication state is handled safely.

## Dependencies
Check for:
- Known vulnerable packages.
- Unnecessary dependencies.
- Outdated security-sensitive packages.

Use the project's existing package manager and audit tools when available.

## Deployment
Check:
- Production environment variables.
- Vercel configuration.
- Debug information.
- Source maps or logs that could expose sensitive information.
- Security-sensitive configuration.

## Rules
- Do not modify code during the review unless explicitly asked.
- Do not weaken existing security controls to make functionality work.
- Treat client-side validation as convenience, not authorization.
- Never claim the application is secure; report findings and remaining risks.

## Report

For every finding provide:
- Severity: Critical / High / Medium / Low
- Location
- Problem
- Why it matters
- Recommended fix

If no issue is found in an area, say so explicitly.
