import { AgentTask, BlueprintTaskItem, TaskBlueprint, TaskCategory, TaskPriority } from '../types';

export const INITIAL_TASK_BLUEPRINTS: TaskBlueprint[] = [
  {
    id: 'blueprint-fullstack-mesh',
    name: 'Full-Stack Autonomous Rollout',
    description: 'End-to-end multi-agent pipeline spanning system design, API contracts, frontend components, and automated verification.',
    category: 'engineering',
    isCustom: false,
    createdAt: '2026-11-01T00:00:00.000Z',
    authorName: 'NEXUS Architecture Guild',
    tasks: [
      {
        title: 'Core Architecture & API Contract Specification',
        prompt: 'Formulate OpenAPI specification, data schemas, and idempotent error handling contracts for microservices.',
        priority: 'high',
        category: 'engineering',
        estimatedHours: 8,
        recurrence: 'none',
      },
      {
        title: 'Design System Tokens & Responsive UI Mockup',
        prompt: 'Build accessible UI components with Tailwind CSS tokens, WCAG AA compliance, and dark cosmic theme styling.',
        priority: 'high',
        category: 'creative',
        estimatedHours: 6,
        recurrence: 'none',
        blockedByIndices: [0], // Blocked by Architecture Spec
      },
      {
        title: 'Distributed Service Implementation & DB Migrations',
        prompt: 'Implement server endpoints, schema migrations with Drizzle ORM, and safe optimistic cache synchronization.',
        priority: 'high',
        category: 'engineering',
        estimatedHours: 12,
        recurrence: 'none',
        blockedByIndices: [0, 1], // Blocked by Architecture and UI Design
      },
      {
        title: 'Automated Test Harness & Load Verification',
        prompt: 'Write unit tests, simulated stress testing suites, and verify zero regressions with 100% pass criteria.',
        priority: 'critical',
        category: 'engineering',
        estimatedHours: 6,
        recurrence: 'none',
        blockedByIndices: [2], // Blocked by Implementation
      },
    ],
  },
  {
    id: 'blueprint-ai-research',
    name: 'AI Model Benchmark & Fine-Tuning',
    description: 'Systematic workflow for evaluating LLM reasoning, synthesizing prompt adapters, and stress-testing context retention.',
    category: 'research',
    isCustom: false,
    createdAt: '2026-11-02T00:00:00.000Z',
    authorName: 'Cosmic Cognitive Labs',
    tasks: [
      {
        title: 'Problem Definition & Dataset Curation',
        prompt: 'Define evaluation rubrics, synthesize gold-standard question-answer pairs, and clean reference corpus.',
        priority: 'high',
        category: 'research',
        estimatedHours: 10,
        recurrence: 'none',
      },
      {
        title: 'Prompt Distillation & Multimodal Strategy',
        prompt: 'Benchmark token efficiency, streaming latencies, and function-calling schemas across candidate model checkpoints.',
        priority: 'medium',
        category: 'research',
        estimatedHours: 8,
        recurrence: 'none',
        blockedByIndices: [0],
      },
      {
        title: 'Zero-Leak Memory & Context Retention Stress Test',
        prompt: 'Execute simulated 50-turn agent conversations to verify vector buffer pruning and zero-leak session state.',
        priority: 'high',
        category: 'engineering',
        estimatedHours: 8,
        recurrence: 'weekly',
        blockedByIndices: [1],
      },
    ],
  },
  {
    id: 'blueprint-design-system',
    name: 'Cosmic UI/UX Design System Rollout',
    description: 'Establish design tokens, interactive components, responsive micro-interactions, and accessibility standards.',
    category: 'creative',
    isCustom: false,
    createdAt: '2026-11-03T00:00:00.000Z',
    authorName: 'Stellar Design Studio',
    tasks: [
      {
        title: 'Fluid Typography Scale & High-Contrast Palettes',
        prompt: 'Establish WCAG AA color tokens across Deep Space Dark and Sepia modes with responsive font clamps.',
        priority: 'high',
        category: 'creative',
        estimatedHours: 6,
        recurrence: 'none',
      },
      {
        title: 'Interactive Component Library & Micro-Interactions',
        prompt: 'Develop modal dialogs, drawer panels, drag-and-drop kanban cards, and smooth CSS transitions.',
        priority: 'medium',
        category: 'creative',
        estimatedHours: 8,
        recurrence: 'none',
        blockedByIndices: [0],
      },
      {
        title: 'Screen Reader & Keyboard Accessibility Audit',
        prompt: 'Validate ARIA labels, focus-visible indicators, keyboard shortcuts, and contrast ratios.',
        priority: 'medium',
        category: 'engineering',
        estimatedHours: 4,
        recurrence: 'none',
        blockedByIndices: [1],
      },
    ],
  },
  {
    id: 'blueprint-security-hardening',
    name: 'Security & Zero-Knowledge Verification',
    description: 'Rigorous security evaluation including attack surface mapping, RBAC rule enforcement, and cryptographic proofs.',
    category: 'work',
    isCustom: false,
    createdAt: '2026-11-04T00:00:00.000Z',
    authorName: 'Security & Safety Guild',
    tasks: [
      {
        title: 'Threat Modeling & Attack Surface Review',
        prompt: 'Analyze input validation attack vectors, CSRF risks, iframe boundaries, and Firestore security rules.',
        priority: 'critical',
        category: 'work',
        estimatedHours: 8,
        recurrence: 'none',
      },
      {
        title: 'Zero-Knowledge Cryptographic Attestation Engine',
        prompt: 'Implement Ed25519 creator signature verification to attest to publishing content provenance.',
        priority: 'high',
        category: 'engineering',
        estimatedHours: 10,
        recurrence: 'none',
        blockedByIndices: [0],
      },
      {
        title: 'Automated Penetration & Boundary Verification',
        prompt: 'Execute fuzzing runs on API routes, verify rate limiting, and confirm zero secret exposure.',
        priority: 'high',
        category: 'work',
        estimatedHours: 6,
        recurrence: 'monthly',
        blockedByIndices: [1],
      },
    ],
  },
  {
    id: 'blueprint-creator-sprint',
    name: 'Personal Creator Sprint & Publication',
    description: 'Weekly publishing roadmap covering research ideation, long-form draft synthesis, and audience engagement telemetry.',
    category: 'personal',
    isCustom: false,
    createdAt: '2026-11-05T00:00:00.000Z',
    authorName: 'Alex Vance',
    tasks: [
      {
        title: 'Weekly Topic Discovery & Community Ideation',
        prompt: 'Curate trending topics from community discussions and summarize key thesis statements.',
        priority: 'medium',
        category: 'personal',
        estimatedHours: 4,
        recurrence: 'weekly',
      },
      {
        title: 'Deep-Dive Article Draft & Rich Media Visuals',
        prompt: 'Synthesize 2,000-word technical essay with interactive code snippets and generative artwork.',
        priority: 'high',
        category: 'creative',
        estimatedHours: 8,
        recurrence: 'weekly',
        blockedByIndices: [0],
      },
      {
        title: 'Reader Discussion Moderation & Performance Review',
        prompt: 'Respond to technical questions in comment threads and review Recharts reader telemetry.',
        priority: 'low',
        category: 'work',
        estimatedHours: 3,
        recurrence: 'weekly',
        blockedByIndices: [1],
      },
    ],
  },
];

/**
 * Validates blueprint parameters.
 */
export function validateBlueprintInput(
  name: string,
  description: string,
  tasks: BlueprintTaskItem[]
): { valid: boolean; error?: string } {
  if (!name || name.trim().length < 3) {
    return { valid: false, error: 'Blueprint name must be at least 3 characters.' };
  }
  if (!description || description.trim().length < 5) {
    return { valid: false, error: 'Blueprint description must be at least 5 characters.' };
  }
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return { valid: false, error: 'Blueprint must contain at least one task.' };
  }

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    if (!t.title || t.title.trim().length === 0) {
      return { valid: false, error: `Task #${i + 1} is missing a title.` };
    }
    if (!t.prompt || t.prompt.trim().length === 0) {
      return { valid: false, error: `Task #${i + 1} is missing an objective prompt.` };
    }
  }

  return { valid: true };
}

/**
 * Instantiates a TaskBlueprint into real AgentTasks with resolved blockedByTaskIds.
 */
export function instantiateBlueprint(
  blueprint: TaskBlueprint,
  creatorId: string = 'user-alex-vance',
  timestamp: string = new Date().toISOString()
): AgentTask[] {
  // Pre-generate unique IDs for each task in this instantiation
  const taskIds = blueprint.tasks.map((_, idx) => `task-bp-${Date.now()}-${idx + 1}`);

  const createdTasks: AgentTask[] = blueprint.tasks.map((item, idx) => {
    // Resolve dependency indices to actual task IDs
    const blockedByTaskIds: string[] = [];
    if (Array.isArray(item.blockedByIndices)) {
      item.blockedByIndices.forEach((depIdx) => {
        if (depIdx >= 0 && depIdx < taskIds.length && depIdx !== idx) {
          blockedByTaskIds.push(taskIds[depIdx]);
        }
      });
    }

    const newTask: AgentTask = {
      id: taskIds[idx],
      title: item.title,
      prompt: item.prompt,
      status: 'pending',
      priority: item.priority || 'medium',
      category: item.category || blueprint.category || 'work',
      recurrence: item.recurrence || 'none',
      blockedByTaskIds,
      estimatedHours: item.estimatedHours || 6,
      orderIndex: idx,
      activeAgent: 'planner',
      creatorId,
      createdAt: timestamp,
      updatedAt: timestamp,
      retryCount: 0,
      approvalRequired: true,
      logs: [
        {
          id: `log-bp-${Date.now()}-${idx + 1}`,
          timestamp,
          agent: 'orchestrator',
          action: 'INSTANTIATED_FROM_BLUEPRINT',
          details: `Task instantiated from "${blueprint.name}" blueprint workflow. Initialized in pending status.${
            blockedByTaskIds.length > 0 ? ` Blocked by ${blockedByTaskIds.length} prerequisite task(s).` : ''
          }`,
          status: 'info',
        },
      ],
    };

    return newTask;
  });

  return createdTasks;
}

/**
 * Creates a TaskBlueprint definition from a list of AgentTasks.
 */
export function createBlueprintFromTasks(
  name: string,
  description: string,
  category: TaskCategory,
  tasks: AgentTask[],
  authorName: string = 'Alex Vance',
  authorId: string = 'user-alex-vance'
): TaskBlueprint {
  const idMap = new Map<string, number>();
  tasks.forEach((t, idx) => {
    idMap.set(t.id, idx);
  });

  const blueprintTasks: BlueprintTaskItem[] = tasks.map((t) => {
    const blockedByIndices: number[] = [];
    if (t.blockedByTaskIds && Array.isArray(t.blockedByTaskIds)) {
      t.blockedByTaskIds.forEach((depId) => {
        const mappedIdx = idMap.get(depId);
        if (mappedIdx !== undefined) {
          blockedByIndices.push(mappedIdx);
        }
      });
    }

    return {
      title: t.title,
      prompt: t.prompt,
      priority: t.priority,
      category: t.category || category,
      estimatedHours: t.estimatedHours || 8,
      recurrence: t.recurrence || 'none',
      blockedByIndices: blockedByIndices.length > 0 ? blockedByIndices : undefined,
    };
  });

  return {
    id: `blueprint-${Date.now()}`,
    name,
    description,
    category,
    tasks: blueprintTasks,
    isCustom: true,
    createdAt: new Date().toISOString(),
    authorName,
    authorId,
  };
}
