import { AgentTask, RecurrenceFrequency, TaskPriority, TaskCategory } from '../types';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Calculates the next execution ISO date string based on frequency
 */
export function calculateNextRunDate(
  frequency: RecurrenceFrequency,
  baseDate: Date = new Date()
): string | null {
  if (frequency === 'none') return null;

  const next = new Date(baseDate.getTime());
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      return null;
  }
  return next.toISOString();
}

/**
 * Regenerates an AgentTask when marked completed if it is configured for recurrence
 */
export function regenerateRecurringTask(
  completedTask: AgentTask,
  generatedAt: Date = new Date()
): AgentTask | null {
  if (!completedTask.recurrence || completedTask.recurrence === 'none') {
    return null;
  }

  const nextDueDate = calculateNextRunDate(completedTask.recurrence, generatedAt);
  const newTaskId = `task-rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const parentId = completedTask.recurrenceParentId || completedTask.id;

  const regeneratedSubtasks = completedTask.subtasks?.map((st, idx) => ({
    ...st,
    id: `sub-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
    completed: false,
    createdAt: generatedAt.toISOString(),
  }));

  const regenerated: AgentTask = {
    id: newTaskId,
    title: completedTask.title,
    prompt: completedTask.prompt,
    status: 'pending',
    priority: completedTask.priority,
    category: completedTask.category || 'work',
    recurrence: completedTask.recurrence,
    recurrenceParentId: parentId,
    nextRunDate: nextDueDate || undefined,
    dueDate: nextDueDate || undefined,
    estimatedHours: completedTask.estimatedHours,
    tags: completedTask.tags ? [...completedTask.tags] : undefined,
    projectFolder: completedTask.projectFolder,
    collaborators: completedTask.collaborators ? [...completedTask.collaborators] : undefined,
    assignees: completedTask.assignees ? [...completedTask.assignees] : undefined,
    subtasks: regeneratedSubtasks,
    sentimentMood: completedTask.sentimentMood,
    orderIndex: 0,
    activeAgent: 'planner',
    creatorId: completedTask.creatorId,
    createdAt: generatedAt.toISOString(),
    updatedAt: generatedAt.toISOString(),
    retryCount: 0,
    approvalRequired: completedTask.approvalRequired ?? true,
    logs: [
      {
        id: `log-${Date.now()}-rec`,
        timestamp: generatedAt.toISOString(),
        agent: 'orchestrator',
        action: 'RECURRING_TASK_REGENERATED',
        details: `Auto-regenerated from recurring parent (${parentId}) with ${completedTask.recurrence} cadence. Next run scheduled for ${nextDueDate ? new Date(nextDueDate).toLocaleDateString() : 'immediate'}.`,
        status: 'info',
      },
    ],
  };

  return regenerated;
}

/**
 * Persists a regenerated recurring task to Firestore and local storage
 */
export async function persistRecurringTaskToFirestore(task: AgentTask): Promise<void> {
  const LOCAL_TASKS_KEY = 'inkwave_nexus_recurring_tasks';
  try {
    const raw = localStorage.getItem(LOCAL_TASKS_KEY);
    const list: AgentTask[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify([task, ...list]));
  } catch (err) {
    console.warn('[LocalCache] Failed to store recurring task in localStorage:', err);
  }

  // Persist to Firestore tasks collection
  const path = 'tasks';
  try {
    await setDoc(doc(db, path, task.id), {
      ...task,
      isRecurringInstance: true,
      persistedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Firestore] Recurring task saved locally; Firestore sync deferred:', err);
  }
}
