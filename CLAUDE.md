# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package manager

This project uses **pnpm** exclusively. Never use npm or yarn.

## Commands

```bash
pnpm dev          # Vite dev server on http://localhost:5173 (strict port)
pnpm build        # format + lint + test:ci + vite build
pnpm test         # vitest in watch mode
pnpm test:ci      # vitest single run (no watch)
pnpm lint         # ESLint
pnpm lint:css     # Stylelint
pnpm format       # Prettier (writes in place)
pnpm run-checks   # format + lint + lint:css + test:ci (same as pre-commit)
pnpm storybook    # Storybook on :6006
pnpm generate     # da generate (scaffold components/reducers)
```

To run a single test file: `pnpm test src/path/to/file.test.ts`

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

### Utils

The `src/utils` folder contains a variety of utility functions, organized in category files. Use the existing util functions before you write any new functions when implementing features.

Any time you need to write a utility function that holds logic for a component, put it in the `src/utils` folder. Try to add it to an existing file if it makes sense. Otherwise, create a new file. Do not put complex logic in component files.

### Models

Model enums and interfaces can be found in `src/models`. Always define new enums and interfaces here. Do not put new enums/interfaces inside component files.

Do your best to use existing models before creating new ones.

### Styling

All CSS classes should use nesting. When creating a new CSS file, do not put every new class as a top-level class. Nest classes the same way the components are nested in the component file.

When using colors, always reference existing variable colors defined in the @src/styles/variables.css file. Ask for permission before creating new colors or referencing color codes in CSS files.
