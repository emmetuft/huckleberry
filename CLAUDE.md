# CLAUDE.md

## Overview

Huckleberry is an AI-native decision intelligence platform designed to help people and teams reason through complex problems, capture organizational knowledge, and collaborate with AI.

Rather than picturing a “jack of all trades” superstar employee, picture Huckleberry AS your business personified. It interacts with everyone in the company in different ways, based on their role and current work. It changes, grows, and matures with time. It understands your data deeply, but is still flexible when things change.

### Things that power Huckleberry

- Ontology for the business itself, so AI recognizes entities that could be ambiguous
- Connection between ontology entities and where we get the actual data from (connection to data sources)
- User persona (their role, their team, their goals, projects, skills, etc.)
- What “things” exist for the user to interact with (entities), like data sources, apps, chats, automations, agents, etc.
- A metric catalog, and how metrics are defined per user/team/department (ties into data readiness)
- Ability to connect to external data sources
- Short term memory
- Long term memory that grows with the user (remembering preferences, things already discussed, etc.)
- Ability to surface insights based on what other users are doing on the platform
- Ability to access the internet so insights stay relevant
- Ability to run background processes
- Permissions and data governance, so users cannot access anything they shouldn’t be able to (nor their agents)
- Ability to capture user feedback, so they can steer the AI to help the way they want it to
- Background process that cleans things up regularly (removing duplicates, managing decay rates on memories)
- Capturing which things are referenced most often/which things are most useful, to generate levels of confidence

## Commands

This project uses **pnpm** exclusively. Never use npm or yarn.

```bash
pnpm dev          # Vite dev server on http://localhost:5173 (strict port)
pnpm build        # format + lint + test:ci + vite build
pnpm test         # vitest in watch mode
pnpm test:ci      # vitest single run (no watch)
pnpm lint         # ESLint
pnpm lint:css     # Stylelint
pnpm format       # Prettier (writes in place)
pnpm run-checks   # format + lint + lint:css + test:ci (same as pre-commit)
```

TypeScript paths are rooted at `src/` — imports like `import { Foo } from 'components/Foo'` resolve without `./` prefix.

Environment variables are loaded from `.environment/` (not `.env`). All vars must be prefixed `DOMO_` to be exposed to the client via Vite.

## Architecture

### Routing split

Two route trees merged in `src/AppRouter.tsx`:

- **Public** (`src/pages/public/`) — unauthenticated marketing/auth pages rendered inside `PublicLayout`. Paths defined in `PublicPage` enum.
- **Platform** (`src/pages/platform/`) — authenticated app pages wrapped by `AuthGuard` → `PlatformLayout`. Paths defined in `AppPage` enum.

All route paths live in `src/models/enums/appPage.ts` (`publicRoutePaths`, `platformRoutePaths`). Add new routes there first, then in the relevant `routes.tsx`.

### Platform shell (`PlatformLayout`)

`src/components/layouts/PlatformLayout/PlatformLayout.tsx` is the outer shell for all authenticated pages. On mount with an identity it dispatches initial data fetches (persona, users, groups, sessions, AI models). It also:

- Syncs Redux `page` state on every route change via `getAppPageFromPath`
- Conditionally hides `PromptBar` on full-screen routes (home, agent chat, session, workspace canvas)

### State management

Redux store at `src/reducers/index.ts`. Slices use `createAppSlice` (a thin wrapper around RTK's `buildCreateSlice` that includes `asyncThunkCreator`).
Current slices: `app`, `agents`, `chat`, `datasource`, `metrics`, `ontology`, `people`, `toolkits`, `workspace`, `spaces`.

### Service layer

`src/services/` contains API clients that wrap `apiFetch`. Pattern: a module-level `const BASE = '/api/...'`, plain async functions, exported as a named object (e.g. `HuckleberryService`). Responses follow a `{ data: T }` envelope — use `handleResponse` from `src/utils/service.ts`.

AI streaming uses SSE via `src/services/agentStream.ts`. The Vite proxy disables buffering for `text/event-stream` responses so SSE works in dev without special config.

## Preferences

### Libraries

Use the following libraries when building components:

- antd for general components
- recharts for charts
- @phosphor-icons/react for all icons
- dayjs for all date utils

### Utils

The `src/utils` folder contains a variety of utility functions, organized in category files. Use the existing util functions before you write any new functions when implementing features.

Any time you need to write a utility function that holds logic for a component, put it in the `src/utils` folder. Try to add it to an existing file if it makes sense. Otherwise, create a new file. Do not put complex logic in component files.

### Models

Model enums and interfaces can be found in `src/models`. Always define new enums and interfaces here. Do not put new enums/interfaces inside component files.

Do your best to use existing models before creating new ones.

### Styling

All CSS classes should use nesting. When creating a new CSS file, do not put every new class as a top-level class. Nest classes the same way the components are nested in the component file.

When using colors, always reference existing variable colors defined in the @src/styles/variables.css file. Ask for permission before creating new colors or referencing color codes in CSS files.

Use other defined variables when possible, including variables for font sizing, spacing, and border radius.
