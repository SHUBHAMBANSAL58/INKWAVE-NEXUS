# INKWAVE NEXUS — Cosmic Edition

An AI-powered social publishing platform and multi-agent task orchestration workspace built with React 19, TypeScript, Express, Gemini (`@google/genai`), PostgreSQL (Drizzle ORM), and Firebase (Authentication & Firestore).

---

## Core Capabilities

- **Social Publishing & Discovery (`FeedView`, `EditorView`, `ArticleReaderModal`, `LibraryView`)**: Publish technical and creative articles, calculate reading times and tables of contents, toggle dark/light themes, and save posts to a persistent Read-Later library with `localStorage` offline support.
- **NEXUS CORE Multi-Agent Orchestration (`NexusCoreView`, `TaskKanbanBoard`, `TaskTimelineView`, `NexusFlowVisualizer`)**:
  - Four-stage autonomous agent pipeline (`PLANNER` → `DESIGNER` → `BUILDER` → `TESTER`) with human-in-the-loop approval/rejection controls.
  - **Circular Subtask Progress Rings (`SubtaskProgressRing`)**: Dynamic SVG progress rings on every task card computing completion ratios (`completed / total`), percentage, and semantic completion status.
  - **Global Quick-Add Floating Dock (`GlobalQuickAddModal`)**: Bottom-right floating action button accessible across all views to create tasks with Title, Objective/Notes, Priority (`low`, `medium`, `high`, `critical`), Category, and Tag selection (presets + custom tags).
  - **Blocking Dependencies, Recurrence & Blueprints**: Enforce prerequisite task blocking, recurring task regeneration (`daily`, `weekly`, `monthly`), reusable workflow blueprints (`TaskTemplatesModal`), and interactive D3 force-directed dependency graphs (`NexusFlowVisualizer`).
  - **Focus & Collaboration**: Linked Pomodoro focus timer (`PomodoroFocusTimer`), Web Audio ambient sound engine (`ambientAudio.ts`), collaborator assignment (`ShareTaskModal` backed by Firestore), voice-to-task dictation, and JSON/CSV backup export.
- **NOVA Assistant & Gemini AI Studio (`NovaAssistant`, `CosmicAiStudioView`)**: Multi-turn Gemini chat with optional Google Search / Google Maps grounding, voice input/output, audio transcription, image/video/music endpoints, and inspectable memory items.
- **3D & Graph Visualizations**: D3 force-directed task flow (`NexusFlowVisualizer`), SVG Knowledge Graph (`KnowledgeGraphView`), Creator DNA 5-axis radar (`CreatorDnaView`), Recharts analytics (`AnalyticsView`), and Three.js spatial views (`ConstellationView`, `CosmicGameView`).

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, D3.js, Recharts, Three.js, Canvas Confetti
- **Backend**: Express (`server.ts` serving API routes and Vite dev middleware on port 3000)
- **AI Integration**: `@google/genai` (with autonomous deterministic fallbacks when `GEMINI_API_KEY` is omitted)
- **Databases & Auth**:
  - PostgreSQL via Drizzle ORM (`src/db/schema.ts`, `src/db/index.ts`)
  - Firebase Auth & Cloud Firestore (`firebase-applet-config.json`, `firebase-blueprint.json`, `firestore.rules`)
- **Testing**: Node's built-in test runner executed via `tsx --test`

---

## Project Structure

```text
├── server.ts                  # Express API + Vite dev middleware / production static host
├── index.html                 # HTML entry point & Google Fonts
├── firestore.rules            # Firestore RBAC & schema validation security rules
├── firebase-blueprint.json    # Firestore data model blueprint
├── src/
│   ├── App.tsx                # Root workspace router, mobile nav, & Quick-Add/NOVA dock
│   ├── types.ts               # Shared TypeScript domain interfaces
│   ├── mockData.ts            # Seed users, posts, communities, tasks, & knowledge graph
│   ├── context/
│   │   └── AppContext.tsx     # Global state, offline cache sync, & API orchestration
│   ├── db/                    # Drizzle PostgreSQL schema & pool configuration
│   ├── components/
│   │   ├── Common/            # GlobalQuickAddModal, KeyboardShortcutsModal, OfflineIndicator
│   │   ├── NexusCore/         # NexusCoreView, SubtaskProgressRing, Kanban, Timeline, D3 Flow
│   │   ├── Nova/              # NOVA floating assistant drawer
│   │   ├── AIStudio/          # Gemini multi-modal studio
│   │   └── ...                # Feed, Editor, Communities, KnowledgeGraph, CreatorDNA, Analytics
│   └── utils/                 # Pure decoupled logic + *.test.ts unit test suites
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Environment Setup
Copy `.env.example` to `.env` and supply variables as needed:
- `GEMINI_API_KEY` *(optional)* — Enables live Gemini API responses in `/api/nova/chat`, `/api/ai/studio`, `/api/ai/chat`, `/api/ai/transcribe`, `/api/ai/generate-image`, `/api/ai/generate-video`, and `/api/ai/generate-music`. Without it, endpoints use deterministic local fallbacks.
- `SQL_HOST`, `SQL_USER`, `SQL_PASSWORD`, `SQL_DB_NAME` *(optional)* — PostgreSQL connection credentials for `src/db/index.ts`.
- `APP_URL` *(optional)* — Public runtime URL.

### Commands

```bash
# Install dependencies
npm install

# Run full-stack development server (Express + Vite on port 3000)
npm run dev

# Type-check with TypeScript
npm run lint

# Run unit tests
npm test

# Build frontend production bundle
npm run build
```

---

## Known Architectural Notes & Limitations

- **Hybrid Persistence**: Posts, tasks, and blueprints created in `server.ts` currently live in server process memory alongside client `localStorage` caching (`src/utils/offlineStorage.ts`), while chat sessions (`gemini_chats`) use Drizzle/PostgreSQL and task shares/contacts/blueprints integrate with Firestore (`firestore.rules`). Restarting `server.ts` resets in-memory arrays unless backed by browser `localStorage` or Firestore.
- **No Unauthenticated Public Write Access in Firestore**: `firestore.rules` enforces `request.auth != null` and ownership checks (`ownerId == request.auth.uid`) across all collections.
