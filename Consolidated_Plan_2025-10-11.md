# Consolidated Plan — Recommendations, Findings, Patches, and Phases (2025-10-11)

## Scope
This document consolidates the review outcomes: key recommendations, prioritized findings, prepared patch files, and a phased plan to implement fixes and features safely.

## Goals
- Improve security and RLS correctness
- Standardize logging and DX
- Document environment for smooth onboarding
- Provide a safe rollout and rollback plan

## Summary of Recommendations
- Standardize logging via `src/lib/logger.ts` for auth/admin flows
- Ensure admin roles are seeded before status checks on client
- Normalize `past_vignettes` RLS audience for consistency
- Add `.env.example` to document required environment variables
- Keep using env-based Supabase client configuration (already present)

## Prioritized Findings (ID → summary → patch)
- F-01: Admin seeding not invoked before role check → `PATCHES/01-medium-security-admin-seed-before-check.patch`
- F-02: Console logs in auth/admin flows vs centralized logger → `PATCHES/02-medium-dx-logger-authcallback.patch`
- F-03: Missing `.env.example` → created `.env.example` (no patch needed)
- F-04: Inconsistent RLS audience for `past_vignettes` → `PATCHES/03-medium-rls-past-vignettes-audience.patch`
- F-05: `adminView` localStorage not user-scoped → optional follow-up (small code edit)

## Patch Files and Application
Patches are staged under `PATCHES/` and designed to be applied with `git apply` from the repo root.
- 01: `git apply PATCHES/01-medium-security-admin-seed-before-check.patch`
- 02: `git apply PATCHES/02-medium-dx-logger-authcallback.patch`
- 03: `git apply PATCHES/03-medium-rls-past-vignettes-audience.patch`

Note: Patch 03 creates a new migration file to normalize RLS; run migrations after applying.
