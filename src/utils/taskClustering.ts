import { AgentTask, TaskPriority } from '../types';

export interface ProjectCluster {
  id: string;
  name: string;
  description: string;
  color: string;
  taskIds: string[];
}

const DEFAULT_FOLDERS: { id: string; name: string; description: string; color: string; keywords: string[] }[] = [
  {
    id: 'folder-systems',
    name: 'Architecture & Systems Core',
    description: 'Underlying infrastructure, microservices, API contracts, and vector memory topologies.',
    color: 'from-sky-500 to-blue-600',
    keywords: ['api', 'architecture', 'backend', 'system', 'database', 'vector', 'cache', 'server', 'service', 'contract', 'memory', 'benchmark', 'node', 'drizzle'],
  },
  {
    id: 'folder-design',
    name: 'Editorial & Design Systems',
    description: 'Typography tokens, UI micro-interactions, dark cosmic themes, and reader layouts.',
    color: 'from-purple-500 to-indigo-600',
    keywords: ['ui', 'ux', 'design', 'typography', 'theme', 'scale', 'token', 'component', 'modal', 'screen', 'layout', 'css', 'kerning', 'visualizer'],
  },
  {
    id: 'folder-security',
    name: 'Autonomous Security & Verification',
    description: 'Zero-knowledge proofs, attack surface modeling, and automated test pipelines.',
    color: 'from-emerald-500 to-teal-600',
    keywords: ['security', 'auth', 'test', 'verification', 'audit', 'cryptographic', 'zk', 'attestation', 'threat', 'firewall', 'rules', 'rbac'],
  },
  {
    id: 'folder-creator',
    name: 'Creator Tools & Personal Workflows',
    description: 'Author identity analytics, publishing goals, streak counters, and community ideation.',
    color: 'from-amber-500 to-orange-600',
    keywords: ['creator', 'personal', 'publishing', 'streak', 'radar', 'dna', 'goal', 'habit', 'reading', 'writer', 'community', 'draft'],
  },
];

/**
 * Suggests project cluster assignment for a given task based on keyword matches and category
 */
export function determineTaskFolder(task: AgentTask): string {
  if (task.projectFolder) return task.projectFolder;

  const content = `${task.title} ${task.prompt} ${task.category || ''} ${task.tags?.join(' ') || ''}`.toLowerCase();

  let highestScore = 0;
  let bestFolderName = DEFAULT_FOLDERS[0].name;

  for (const folder of DEFAULT_FOLDERS) {
    let score = 0;
    for (const kw of folder.keywords) {
      if (content.includes(kw)) {
        score += 1;
      }
    }
    if (folder.name.toLowerCase().includes(task.category || '')) {
      score += 2;
    }
    if (score > highestScore) {
      highestScore = score;
      bestFolderName = folder.name;
    }
  }

  return bestFolderName;
}

/**
 * Automatically clusters unassigned tasks into semantic project folders
 */
export function autoClusterTasks(tasks: AgentTask[]): AgentTask[] {
  return tasks.map((task) => {
    if (task.projectFolder) return task;
    return {
      ...task,
      projectFolder: determineTaskFolder(task),
    };
  });
}

/**
 * Analyzes task text to infer sentiment mood (calm, focused, complex, urgent)
 */
export function analyzeTaskSentiment(
  title: string,
  prompt: string,
  priority: TaskPriority = 'medium'
): 'calm' | 'focused' | 'complex' | 'urgent' {
  const combined = `${title} ${prompt}`.toLowerCase();

  if (priority === 'high' || combined.includes('critical') || combined.includes('urgent') || combined.includes('asap') || combined.includes('immediate')) {
    return 'urgent';
  }
  if (combined.includes('benchmark') || combined.includes('cryptographic') || combined.includes('algorithm') || combined.includes('distributed') || combined.includes('deep-dive')) {
    return 'complex';
  }
  if (combined.includes('refactor') || combined.includes('design') || combined.includes('write') || combined.includes('implement')) {
    return 'focused';
  }
  return 'calm';
}

/**
 * Parses natural language date phrases like "by Friday at 5pm", "tomorrow", or "next week"
 */
export function parseNaturalLanguageDeadline(text: string): { cleanedText: string; dueDate?: string } {
  if (!text) return { cleanedText: '' };

  const lower = text.toLowerCase();
  const now = new Date();
  let targetDate: Date | null = null;
  let matchedPhrase = '';

  if (lower.includes('tomorrow')) {
    targetDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    targetDate.setHours(17, 0, 0, 0);
    matchedPhrase = 'tomorrow';
  } else if (lower.includes('next week')) {
    targetDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    targetDate.setHours(17, 0, 0, 0);
    matchedPhrase = 'next week';
  } else if (lower.includes('by friday') || lower.includes('this friday')) {
    const day = now.getDay();
    const daysUntilFriday = (5 - day + 7) % 7 || 7;
    targetDate = new Date(now.getTime() + daysUntilFriday * 24 * 60 * 60 * 1000);
    targetDate.setHours(17, 0, 0, 0);
    matchedPhrase = lower.includes('this friday') ? 'this friday' : 'by friday';
  } else if (lower.includes('by monday') || lower.includes('next monday')) {
    const day = now.getDay();
    const daysUntilMonday = (1 - day + 7) % 7 || 7;
    targetDate = new Date(now.getTime() + daysUntilMonday * 24 * 60 * 60 * 1000);
    targetDate.setHours(17, 0, 0, 0);
    matchedPhrase = lower.includes('next monday') ? 'next monday' : 'by monday';
  }

  let cleaned = text;
  if (matchedPhrase) {
    const regex = new RegExp(`\\b${matchedPhrase}(\\s+at\\s+\\d+(pm|am)?)?\\b`, 'gi');
    cleaned = cleaned.replace(regex, '').replace(/\s{2,}/g, ' ').trim();
  }

  return {
    cleanedText: cleaned,
    dueDate: targetDate ? targetDate.toISOString() : undefined,
  };
}

/**
 * AI-powered / heuristic smart sort ordering tasks by urgency, priority, deadline, and dependencies
 */
export function smartSortTasks(tasks: AgentTask[]): AgentTask[] {
  const priorityWeight: Record<TaskPriority, number> = {
    critical: 400,
    high: 300,
    medium: 200,
    low: 100,
  };

  const statusWeight: Record<string, number> = {
    building: 50,
    planning: 40,
    awaiting_approval: 35,
    pending: 20,
    completed: -500,
    cancelled: -600,
  };

  return [...tasks].sort((a, b) => {
    let scoreA = priorityWeight[a.priority] || 200;
    let scoreB = priorityWeight[b.priority] || 200;

    scoreA += statusWeight[a.status] || 0;
    scoreB += statusWeight[b.status] || 0;

    // Prefer unblocked tasks
    if (a.blockedByTaskIds && a.blockedByTaskIds.length > 0) scoreA -= 25;
    if (b.blockedByTaskIds && b.blockedByTaskIds.length > 0) scoreB -= 25;

    // Prefer tasks with close due dates
    if (a.dueDate) {
      const diffA = new Date(a.dueDate).getTime() - Date.now();
      if (diffA > 0 && diffA < 86400000 * 2) scoreA += 50;
    }
    if (b.dueDate) {
      const diffB = new Date(b.dueDate).getTime() - Date.now();
      if (diffB > 0 && diffB < 86400000 * 2) scoreB += 50;
    }

    return scoreB - scoreA;
  });
}

export interface FocusBlockRecommendation {
  id: string;
  label: string;
  windowHint: string;
  durationMinutes: number;
  taskIds: string[];
  taskTitles: string[];
  rationale: string;
}

export interface FocusBlockInsights {
  unblockedHighPriorityCount: number;
  blockedCount: number;
  totalEstimatedHours: number;
  completionRate: number;
  averageFocusMinutes: number;
  recommendedBlocks: FocusBlockRecommendation[];
}

/**
 * Aggregates unfinished critical and high priority tasks for the Daily Digest modal/banner
 */
export function getDailyDigestTasks(tasks: AgentTask[]): AgentTask[] {
  const rank: Record<TaskPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return tasks
    .filter(
      (t) =>
        !t.archived &&
        t.status !== 'completed' &&
        t.status !== 'cancelled' &&
        (t.priority === 'critical' || t.priority === 'high')
    )
    .sort((a, b) => {
      const pDiff = (rank[a.priority] ?? 9) - (rank[b.priority] ?? 9);
      if (pDiff !== 0) return pDiff;
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
}

/**
 * Computes actionable deep-work focus block suggestions from task completion history,
 * active priorities, blocking relationships, and logged focus time.
 */
export function buildFocusBlockInsights(tasks: AgentTask[]): FocusBlockInsights {
  const active = tasks.filter((t) => !t.archived);
  const completed = active.filter((t) => t.status === 'completed');
  const open = active.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');

  const completedIds = new Set(completed.map((t) => t.id));
  const isBlocked = (t: AgentTask) =>
    (t.blockedByTaskIds || []).some((id) => !completedIds.has(id) && active.some((x) => x.id === id));

  const blockedTasks = open.filter(isBlocked);
  const unblockedOpen = smartSortTasks(open.filter((t) => !isBlocked(t)));

  const unblockedHighPriority = unblockedOpen.filter(
    (t) => t.priority === 'critical' || t.priority === 'high'
  );

  const totalEstimatedHours = Number(
    open.reduce((sum, t) => sum + (t.estimatedHours || 1.5), 0).toFixed(1)
  );

  const completionRate =
    active.length > 0 ? Math.round((completed.length / active.length) * 100) : 0;

  const focusedTasks = active.filter((t) => (t.focusTimeSeconds || 0) > 0);
  const averageFocusMinutes =
    focusedTasks.length > 0
      ? Math.round(
          focusedTasks.reduce((s, t) => s + (t.focusTimeSeconds || 0), 0) /
            focusedTasks.length /
            60
        )
      : 25;

  const recommendedBlocks: FocusBlockRecommendation[] = [];

  if (unblockedHighPriority.length > 0) {
    const deepBatch = unblockedHighPriority.slice(0, 2);
    recommendedBlocks.push({
      id: 'block-deep-sprint',
      label: 'Peak Deep-Work Sprint',
      windowHint: 'Morning 09:00 – 10:30',
      durationMinutes: Math.min(90, Math.max(45, averageFocusMinutes * 2)),
      taskIds: deepBatch.map((t) => t.id),
      taskTitles: deepBatch.map((t) => t.title),
      rationale: `${deepBatch.length} unblocked ${deepBatch[0].priority}-priority task(s) ready for immediate execution.`,
    });
  }

  const complexOrEngineering = unblockedOpen.filter(
    (t) => t.sentimentMood === 'complex' || t.category === 'engineering' || t.category === 'research'
  );
  if (complexOrEngineering.length > 0) {
    const batch = complexOrEngineering.slice(0, 2);
    recommendedBlocks.push({
      id: 'block-architecture',
      label: 'Architecture & Synthesis Block',
      windowHint: 'Midday 13:30 – 14:45',
      durationMinutes: 75,
      taskIds: batch.map((t) => t.id),
      taskTitles: batch.map((t) => t.title),
      rationale: 'Groups cognitively dense research/engineering items to reduce context switching.',
    });
  }

  const quickWins = unblockedOpen.filter(
    (t) => t.priority === 'medium' || t.priority === 'low' || (t.estimatedHours || 2) <= 1.5
  );
  if (quickWins.length > 0) {
    const batch = quickWins.slice(0, 3);
    recommendedBlocks.push({
      id: 'block-momentum',
      label: 'Momentum Sweep',
      windowHint: 'Afternoon 16:00 – 16:45',
      durationMinutes: 45,
      taskIds: batch.map((t) => t.id),
      taskTitles: batch.map((t) => t.title),
      rationale: `Clears ${batch.length} smaller item(s) to boost velocity and close loops before EOD.`,
    });
  }

  return {
    unblockedHighPriorityCount: unblockedHighPriority.length,
    blockedCount: blockedTasks.length,
    totalEstimatedHours,
    completionRate,
    averageFocusMinutes,
    recommendedBlocks,
  };
}

