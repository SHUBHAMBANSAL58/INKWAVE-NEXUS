# INKWAVE NEXUS — Engineering Interview Preparation

Grounded in the real architecture and engineering tradeoffs in this codebase.

---

## 1. System Architecture Pitch (60 Seconds)
> "INKWAVE NEXUS is a full-stack TypeScript application combining a social publishing workspace with a multi-agent task orchestration system (`NEXUS CORE`). A single Express server (`server.ts`) serves REST endpoints—including `@google/genai` integrations for multi-modal AI—and mounts Vite middleware in dev mode. On the frontend, React 19 and `AppContext` manage optimistic UI updates, `localStorage` offline caching, and integrations with D3.js, Recharts, Three.js, PostgreSQL via Drizzle ORM, and Firebase Auth/Firestore."

---

## 2. Key Technical Decisions & Tradeoffs

### Why decouple `src/utils/*` from React components?
- **Problem**: SVG ring math (`calculateSubtaskProgress`), tag deduplication (`quickAddTask`), dependency blocking checks (`isTaskBlocked`), and natural-language deadline parsing (`parseNaturalLanguageDeadline`) are easy to get subtly wrong when buried inside JSX event handlers.
- **Decision**: Extract pure TypeScript functions into `src/utils/` with zero DOM/React dependencies and pair each module with a `node:test` file (`*.test.ts`).
- **Payoff**: Fast unit tests via `tsx --test` caught an edge case in `normalizeTag` (leading whitespace before `#` characters) immediately before UI integration.

### Why use SVG `stroke-dashoffset` for the Circular Subtask Progress Ring?
- **Alternative**: CSS `conic-gradient` or third-party charting libraries per task card.
- **Decision**: A minimal two-circle `<svg>` with `strokeDasharray={circumference}` and `strokeDashoffset={circumference * (1 - ratio)}` rotated `-90deg`.
- **Payoff**: Zero extra bundle weight, crisp vector scaling at any DPI, smooth CSS transitions on `stroke-dashoffset`, and full screen-reader accessibility via `role="progressbar"` and `aria-valuenow`.

### Why consolidate bottom-right floating actions into one dock?
- **Problem**: Adding a `'Global Quick-Add'` floating button next to `'Summon NOVA'` and a fixed mobile `<nav>` bar creates z-index and coordinate collisions on small viewports.
- **Decision**: Stack both buttons in a single `fixed bottom-20 md:bottom-6 right-4 md:right-6` flex column (`flex-col items-end gap-2.5`) and offset minimized widgets (`PomodoroFocusTimer`) horizontally.
- **Payoff**: Guaranteed zero overlap across mobile (`390x844`) and desktop (`1440x900`) viewports.

### Why keep Gemini API calls on the Express backend (`server.ts`)?
- **Security**: Prevents exposing `GEMINI_API_KEY` in client bundles.
- **Resilience**: Endpoints check `if (aiClient)` and fall back gracefully to deterministic local responses when an API key is absent or upstream calls fail.

---

## 3. Common Interview Questions About This Codebase

1. **How do you prevent stale `localStorage` data from hiding newly added fields on seeded tasks?**
   - In `AppContext.tsx`, initial state merges cached `task-live-*` tasks with `INITIAL_AGENT_TASKS` so missing `subtasks` or `tags` properties backfill cleanly without overwriting user-created tasks.
2. **How did you fix non-reactive Pomodoro focus time updates?**
   - Previously `NexusCoreView` mutated `target.focusTimeSeconds` directly, which bypassed React state reconciliation and `localStorage` persistence. Moving updates into `updateTaskFocusTime` in `AppContext` guarantees immutable state updates.
3. **How does Firestore security enforce multi-tenant safety?**
   - `firestore.rules` starts with a global deny-all rule and validates `request.auth != null`, document ID format (`isValidId`), allowed field keys (`hasOnly`), field types/lengths, and ownership (`request.auth.uid == resource.data.userId` / `ownerId`).
4. **What would you refactor next to scale this for production?**
   - Persist `tasksStore` and `postsStore` (currently in-memory arrays in `server.ts`) directly into PostgreSQL tables via Drizzle ORM (`src/db/schema.ts`), and split large views like `NexusCoreView.tsx` into smaller feature subcomponents (`TaskFilterBar`, `TaskCard`, `TaskDetailInspector`) to improve maintainability and code splitting.
