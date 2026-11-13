# INKWAVE NEXUS — Project Learning Guide

This guide explains the architecture, data flow, and engineering patterns actually implemented in this repository so you can navigate, modify, and extend the codebase confidently.

---

## 1. High-Level Architecture

INKWAVE NEXUS runs as a **single-server full-stack TypeScript application**:
- In **development** (`npm run dev` -> `tsx server.ts`), `server.ts` creates an Express server on port `3000`, mounts all REST `/api/*` endpoints, and attaches Vite's middleware (`vite.middlewares`) so frontend HMR/bundling and API requests share the same origin (`http://localhost:3000`).
- In **production** (`NODE_ENV=production`), `server.ts` serves the built `dist/` bundle statically and falls back to `dist/index.html` for client-side navigation.

---

## 2. State Management & Data Flow (`src/context/AppContext.tsx`)

Instead of scattering API calls and storage logic across every component, `AppContext` serves as the central client store:
1. **Hydration & Backfill**: Initializes `posts`, `tasks`, `blueprints`, `stories`, and `libraryItems` from `localStorage` via `loadFromCache()` (`src/utils/offlineStorage.ts`), falling back to `src/mockData.ts`. Built-in seeded tasks (`task-live-*`) backfill missing `subtasks`/`tags` fields if an older cache exists.
2. **Optimistic & Resilient Mutations**: Methods like `createTask`, `approveTask`, `toggleLikePost`, and `updateTaskStatus` update React state immediately (or queue offline mutations via `queueOfflineMutation`) and synchronize with Express `/api/*` endpoints.
3. **Immutable Updates**: Task edits (`toggleSubtask`, `updateTaskFocusTime`, `updateTaskPriority`, `linkTaskDependency`) return new task objects rather than mutating existing objects in place, ensuring React re-renders dependent views cleanly.

---

## 3. Core Feature Walkthroughs

### A. Circular Subtask Progress Ring (`SubtaskProgressRing` + `subtaskProgress.ts`)
- **Pure Logic (`src/utils/subtaskProgress.ts`)**: `calculateSubtaskProgress(subtasks, size, strokeWidth)` computes `completed`, `total`, `ratio`, `percentage`, SVG `circumference` ($2\pi r$), and `strokeDashoffset` ($C \cdot (1 - \text{ratio})$), plus semantic status (`empty`, `in_progress`, `complete`).
- **UI Component (`src/components/NexusCore/SubtaskProgressRing.tsx`)**: Renders a `-90deg` rotated SVG `<circle>` pair (background track + animated foreground arc) with `role="progressbar"` and `aria-valuenow` accessibility attributes.
- **Integration (`src/components/NexusCore/NexusCoreView.tsx`)**: Mounted on every task card and inside the Task Detail Subtasks tab. Whenever a user adds, toggles, or deletes a subtask, both the ring arc and percentage update automatically.

### B. Global Quick-Add Floating Dock (`GlobalQuickAddModal` + `quickAddTask.ts`)
- **Pure Logic (`src/utils/quickAddTask.ts`)**: Handles tag normalization (`normalizeTag`), case-insensitive deduplication (`addQuickTag`, `toggleQuickTag`, `removeQuickTag`), and submission validation (`validateQuickAddForm`).
- **UI Component (`src/components/Common/GlobalQuickAddModal.tsx`)**: Accessible modal (`role="dialog"`, Escape/backdrop close, auto-focused title input) supporting Priority (`low`, `medium`, `high`, `critical`), Category, and preset/custom Tag chips.
- **Mounting (`src/App.tsx`)**: Mounted inside a unified bottom-right floating dock (`fixed bottom-20 md:bottom-6 right-4 md:right-6`) stacked cleanly with `"Summon NOVA"`, clearing the mobile bottom navigation bar and displaying a confirmation toast with a shortcut to `NEXUS CORE`.

### C. Multi-Agent Pipeline & Dependency Engine
- **State Machine (`src/utils/orchestrator.ts`)**: Advances tasks sequentially (`pending` -> `planning` -> `designing` -> `building` -> `testing` -> `awaiting_approval` -> `completed`), generating structured deliverables (`plannerOutput`, `designerOutput`, `builderOutput`, `testerOutput`) at each handoff.
- **Dependency Guard (`src/utils/taskDependencies.ts`)**: `isTaskBlocked(task, allTasks)` checks `blockedByTaskIds` and blocks pipeline advancement until prerequisites reach `'completed'`.
- **D3 Graph (`src/components/NexusCore/NexusFlowVisualizer.tsx`)**: Visualizes task dependencies and lets users drag nodes, inspect edges, and adjust priorities.

---

## 4. Decoupled Pure-Logic Testing Pattern

A key architectural habit across `src/utils/` is separating deterministic business logic from React components:
- `subtaskProgress.ts` <-> `subtaskProgress.test.ts`
- `quickAddTask.ts` <-> `quickAddTask.test.ts`
- `taskDependencies.ts` <-> `taskDependencies.test.ts`
- `taskClustering.ts` <-> `taskClustering.test.ts`
- `taskRecurrence.ts` <-> `taskRecurrence.test.ts`
- `taskBlueprints.ts` <-> `taskBlueprints.test.ts`

Running `npm test` executes `tsx --test src/**/*.test.ts` directly in Node without needing browser mocks or DOM overhead.
