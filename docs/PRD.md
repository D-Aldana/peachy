# Peachy — Product Requirements Document

2026-09-16 · @Someone

## Overview

Peachy is a mobile-first workout logging app for lifters who want to record sets, reps, and weight in real time between sets, without app friction slowing down the workout. Most fitness apps front-load structure (programs, templates, exercise libraries with videos) that gets in the way when someone just wants to tap in a number and move on. Peachy strips that away: open the app, add an exercise by name, log sets as you do them, and see whether you're trending up or down against your own history — no account, no setup, no coach.

The product's core bet is that immediate, low-friction logging plus a simple improvement signal (are you doing better than last time?) is enough to keep someone coming back, without the overhead of a full training-program app.

## Goals & Success Metrics

**Product goals**

- Make in-workout logging fast enough to use one-handed, between sets, without breaking focus
- Give users a clear, honest signal of progress (or regression) on each exercise without manual math
- Require zero setup: no account creation, no exercise library to browse first

**Success metrics (post-launch)**

| Metric | What it tells us |
| --- | --- |
| Sets logged per active workout | Whether logging is fast enough that people log every set, not just some |
| Workouts finished vs. started | Whether the flow is smooth enough that people complete sessions instead of abandoning mid-workout |
| Weekly summary views per user | Whether the progress signal is compelling enough to check back |
| 4-week retention | Whether the app earns a repeat habit without accounts or notifications |
| % of exercises with a comparison badge (not "first time") | Whether the improvement-tracking feature has enough history to be useful |

No analytics/telemetry exist in the current build (see Non-Goals) — these metrics would require instrumentation to actually measure and are listed here as what "success" means, not as tracked today.

## Target Users & Use Cases

**Primary user:** someone who lifts weights regularly (2–5x/week) and currently tracks workouts informally — a phone Notes app, a paper notebook, or memory — and wants something faster than a spreadsheet but lighter than a full training-program app.

**Not the target user (for this version):** beginners who need guided programming or exercise instruction, coaches managing multiple clients, or anyone who wants cross-device sync or social features.

**Core use cases**

1. **Mid-set logging** — between sets of an exercise, quickly record reps and weight for the set just finished, without unlocking a complicated flow.
2. **Ad-hoc exercise entry** — the user does a mix of exercises that may change workout to workout; they need to add an exercise by typing its name rather than picking from a fixed list.
3. **"Am I improving?" check** — mid-workout or at the end of the week, the user wants a quick answer on whether they're getting stronger on the exercises they care about, without doing the math themselves.
4. **Weekly reflection** — at the end of the week, the user wants a short summary of what they did and how it compares to before, to decide what to focus on next week.

## Core User Flows

**1. Start a workout**

- User taps "Start workout" (or "Continue workout" if one is already in progress) on the home screen
- A new workout session begins immediately, timestamped, no other setup required

**2. Log an exercise and its sets**

- User types an exercise name into a free-text field (autocompletes against previously used exercise names)
- User adds the exercise, then for each set: sets reps and weight using stepper controls (or types the value directly), taps "Add set"
- Each logged set appears immediately in a running list under that exercise
- If this exercise has history, a reference line shows the last time it was done and a badge shows whether the current session is ahead, even, or behind

**3. Adjust or remove a set**

- User can remove an individual set from the current session if it was logged in error

**4. Finish a workout**

- User taps "Finish workout"
- Any exercises with zero logged sets are dropped silently (nothing to save)
- The workout is marked complete and timestamped; user returns to the home screen

**5. Cancel a workout**

- User can discard the entire in-progress session (e.g. started by accident)

**6. View weekly summary**

- From the home screen, user opens the weekly summary
- Sees: workouts completed this week, total sets, week streak, and a per-exercise breakdown showing whether performance this week is up, down, or flat versus the last time before this week each exercise was performed

## Feature Requirements (MVP)

**Workout logging**

- Start / continue / cancel / finish a single active workout at a time
- Add exercises by free-text name (case-insensitive matching against saved names)
- Log sets as (reps, weight) pairs; edit reps/weight before adding via stepper or direct entry
- Remove an individual set after logging
- Exercises with no sets are excluded automatically when a workout is finished

**Exercise memory**

- Every exercise name entered is saved and offered as an autocomplete suggestion on future entries, most-recently-used first
- No fixed or pre-loaded exercise library — names are entirely user-defined

**Units**

- Global lb/kg toggle, switchable at any time
- All weights convert instantly and consistently across every screen when the unit is switched
- Weight is stored internally in a single canonical unit (kg) so repeated conversions don't cause drift

**Progress / improvement tracking**

- For each exercise in an active workout, compare against the most recent prior *completed* session containing that exercise
- Comparison logic (in priority order): (1) heavier best set than last time → "up"; (2) same best weight but more total volume than last time → "up"; (3) lower best weight or lower volume → "down"; (4) otherwise → "even"
- No prior session for that exercise → shown as a neutral "first time" state, not as regression
- Badge and reference line ("last time: N sets, best X") shown live as the user logs, updating as sets are added

**Weekly summary**

- Aggregates all workouts completed within the current calendar week (Monday–Sunday)
- Shows: workout count, total sets, week streak — consecutive calendar weeks with at least one finished workout; the current week doesn't break the streak until it ends
- Per exercise trained that week: total sets, best set, and an up/down/even badge compared to the last session of that exercise before the week started

**Persistence**

- All data (workouts, sets, exercise names, unit preference) persists locally on the device between sessions with no login
- No accounts, no cross-device sync in this version

## Data Model & Technical Notes

**Entities**

| Entity | Fields |
| --- | --- |
| Workout | id, startedAt, endedAt (null while active), exercises\[\] |
| Exercise entry | name (free text), sets\[\] |
| Set | reps (integer), weightKg (float, canonical storage unit) |
| App state | unit preference (lb/kg), list of previously used exercise names, active workout id |

**Unit handling:** weight is always stored internally in kilograms regardless of the display unit, and converted to lb/kg only at render time. This avoids compounding rounding errors from repeated unit conversion and keeps historical comparisons accurate even if the user switches units between sessions.

**Storage approach:** on-device app storage, scoped to that install only. This means: no login required, but also no recovery or sync if the app is deleted, its data is cleared, or the user switches devices.

**Platform:** a React Native app built with Expo (SDK 57) and TypeScript, targeting iOS and Android from a single codebase. Expo's web target is available for development but is not a primary platform.

## Design & Branding

**Name:** Peachy — chosen for a warm, encouraging personality ("feeling peachy") rather than the harder, gym-equipment tone of typical lifting apps.

**Visual identity**

- Deep cocoa-plum background with a peach-coral accent color, rather than the cream-and-terracotta or pure black-and-neon looks common to fitness/AI-generated apps
- Fraunces (a warm serif) for headings and numbers, paired with Inter for body text — giving the app a friendlier, less industrial feel than condensed sans-serif gym branding
- Italic serif wordmark in the accent color as the primary logo treatment

**Tone / UX principles**

- Fast and unobtrusive during logging: large tap targets, minimal steps between "finished a set" and "logged it"
- Encouraging rather than clinical when reporting progress: plain badges ("Heavier than last time") rather than raw percentages or charts
- No guilt-based framing for a down week — the app reports, it doesn't judge

## Non-Goals / Out of Scope (this version)

- User accounts, login, or authentication
- Cross-device sync or cloud backup of workout data
- A curated exercise library, instructional videos, or form guidance
- Pre-built training programs, periodization, or workout templates
- Social features (sharing, following, leaderboards)
- Rest timers between sets
- Analytics/telemetry instrumentation (the success metrics above describe what to measure later, not what's tracked now)
- Body-weight, measurements, or nutrition tracking

## Open Questions & Future Considerations

**Open questions**

- [ ] Should "improvement" ever weigh reps over weight (e.g. more reps at the same weight is a form of progress too), or is the current best-weight-then-volume priority the right default?
- [ ] What happens to exercise history if a user renames or fixes a typo in an exercise name — should past entries merge with the corrected name?
- [ ] Is local-only storage (no accounts) a permanent design choice, or a v1 simplification to revisit once there's usage signal?

**Future considerations (explicitly post-MVP)**

- Optional accounts + cross-device sync, once local-only usage validates the core loop
- Monthly or all-time views in addition to weekly summary
- Per-exercise history/detail view (a simple line of past sessions for one exercise)
- Rest timers, if users ask for them
- Export of raw data (CSV) for users who want their own analysis
