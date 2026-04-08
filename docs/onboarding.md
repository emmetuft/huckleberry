# Onboarding & User Persona

This document describes the onboarding flow and profile management system in Huckleberry. The goal is to gather rich context about each user so that AI agents can tailor their behavior, language, and recommendations accordingly.

---

## Overview

The persona system is a **living profile** — it is never truly "complete" and grows more useful over time. Rather than forcing a one-time setup wizard, the experience is designed around three distinct phases:

| Phase | Name               | Status         |
| ----- | ------------------ | -------------- |
| 1     | Quick Start        | ✅ Implemented |
| 2     | Profile Hub        | ✅ Implemented |
| 3     | Ambient Enrichment | 🔜 Planned     |

---

## What We Collect

The user persona captures the following information:

| Field                | Type                      | Description                                         |
| -------------------- | ------------------------- | --------------------------------------------------- |
| `role`               | string                    | Job title                                           |
| `level`              | RoleLevel enum            | Seniority level (Intern → C-Level)                  |
| `department`         | string                    | Department or business unit                         |
| `team`               | string                    | Team name                                           |
| `relationships`      | PersonaContact[]          | Key people and their relationship type              |
| `goals`              | string                    | Primary objective or goal                           |
| `focusAreas`         | string[]                  | Key professional focus areas                        |
| `strengths`          | string[]                  | Professional strengths                              |
| `weaknesses`         | string[]                  | Areas for growth                                    |
| `tools`              | string[]                  | Software and platforms used regularly               |
| `communicationStyle` | PersonaCommunicationStyle | Preferred response format, tone, and decision style |
| `domainKnowledge`    | string[]                  | Areas of deep expertise                             |

---

## Phase 1: Quick Start

**Route:** `/profile` (shown when `isNewUser && !onboardingCompleted`)

**Purpose:** A lightweight, guided first-run experience to capture the highest-signal persona data in roughly 2 minutes.

### Design principles

- **Non-blocking** — a "Skip for now" or "Continue later" option is always visible.
- **Progressive** — each step is focused on a single topic. Users are never overwhelmed.
- **Resumable** — tapping "Continue later" saves progress and marks onboarding as complete so the user isn't shown the flow again until they opt back in.

### Steps

#### Step 0 — Welcome

Introduces the profile concept. Two actions: **Let's go** (proceed) or **Skip for now** (dismiss, navigate to workspace).

#### Step 1 — What do you do?

Collects: `role`, `level`, `department`.

#### Step 2 — What are you working on?

Collects: `goals`, `focus areas` (tag-style input).

#### Step 3 — How do you like to work?

Collects: `tools` (tag-style input), `communicationStyle` (visual toggle cards for format, tone, and decision style).

#### Step 4 — Done

Displays a summary of captured data with actions to go to the workspace or view the full profile.

### State management

- `isNewUser: boolean` — hardcoded `true` for now; should eventually be derived from user identity or a backend flag.
- `onboardingCompleted: boolean` — set to `true` when the user finishes, skips, or clicks "Continue later". Persists in Redux (not yet persisted to backend).
- Both fields live in the `app` Redux slice.

### Data flow

Quick Start collects data in local component state and dispatches `saveUserPersona` on completion or "Continue later". The existing `/api/persona/:userId` endpoint is used.

---

## Phase 2: Profile Hub

**Route:** `/profile` (shown when `onboardingCompleted` is `true`)

**Purpose:** A permanent, always-accessible page for managing and enriching the full persona profile. Each section can be filled independently at any time.

### Layout

The hub shows a **progress ring** (percentage of sections with data) and a list of **section cards**, one per persona category. Each card shows:

- Section name and icon
- A one-line description
- A completion badge: **Complete** or **Not started**

Clicking a card expands it inline to reveal an editor for that section. Saving calls `saveUserPersona` with the updated persona.

### Sections

| Section key          | Label                | Fields edited                                       |
| -------------------- | -------------------- | --------------------------------------------------- |
| `role`               | Role & Identity      | role, level, department, team                       |
| `goals`              | Goals & Priorities   | goals, focusAreas                                   |
| `relationships`      | Team & Relationships | relationships (name, role, relationship type)       |
| `tools`              | Tools & Systems      | tools (tags)                                        |
| `communicationStyle` | Communication Style  | preferredFormat, tone, decisionStyle (toggle cards) |
| `domainKnowledge`    | Domain Knowledge     | domainKnowledge (tags)                              |

### Completion tracking

A section is considered **complete** if its primary data fields are non-empty. The `completedSections` array on the persona is updated whenever a section is saved, and is the source of truth for sections like `communicationStyle` where "complete" can't be inferred from data alone.

---

## Phase 3: Ambient Enrichment (Planned)

**Purpose:** The platform passively enriches the persona based on user behavior, without requiring explicit input.

### Planned patterns

- **Moment-triggered suggestions** — after a relevant agent interaction, the platform proposes updating a persona field (e.g., "I noticed you queried the Q3 campaign — want to add this as a project?"). User confirms or dismisses.
- **Conversation mining** — agent sessions are analyzed post-completion to surface persona signals. Suggestions queue up in a pending state and are shown non-intrusively (e.g., a dot on the profile nav icon).
- **Passive inference** — repeated patterns (data sources, team mentions, tools invoked) are tracked and used to auto-populate low-confidence fields with transparent sourcing.

### Key principles for Phase 3

- Always explain _why_ a suggestion is being made.
- Make it trivially easy to dismiss a suggestion.
- Never auto-apply inferred data without user confirmation.
- Surface pending suggestions in a dedicated review UI, not as interruptions.

---

## API Placeholder

Persona data is persisted via:

```
GET  /api/persona/:userId    — fetch user persona
POST /api/persona/:userId    — save full persona
```

These endpoints are defined in `src/services/storage.ts`. The backend API does not yet exist; the frontend falls back to default persona data when the fetch fails.

A future `PATCH /api/persona/:userId/section/:sectionKey` endpoint could enable more targeted section-level saves, reducing payload size and enabling conflict detection.

---

## File Map

```
src/
  models/interfaces/persona.ts       — Persona interface + supporting types
  constants/persona.ts               — defaultPersona + option lists
  reducers/app/slice.ts              — isNewUser, onboardingCompleted state
  reducers/app/actions.ts            — fetchUserPersona, saveUserPersona
  services/storage.ts                — API calls (placeholder)
  models/enums/appPage.ts            — AppPage.PROFILE enum + /profile path
  pages/platform/Profile/
    index.tsx                        — barrel export
    ProfilePage.tsx                  — route component, decides Quick Start vs Hub
    QuickStart.tsx                   — Phase 1 multi-step flow
    QuickStart.module.css
    ProfileHub.tsx                   — Phase 2 section-based hub
    ProfileHub.module.css
```
