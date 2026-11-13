import { AgentTask } from '../types';

/**
 * Determines whether a task is blocked by one or more unfinished prerequisite tasks
 */
export function isTaskBlocked(
  task: AgentTask,
  allTasks: AgentTask[]
): { isBlocked: boolean; blockingTasks: AgentTask[] } {
  if (!task.blockedByTaskIds || task.blockedByTaskIds.length === 0) {
    return { isBlocked: false, blockingTasks: [] };
  }

  const taskMap = new Map<string, AgentTask>();
  allTasks.forEach((t) => taskMap.set(t.id, t));

  const blockingTasks: AgentTask[] = [];
  for (const depId of task.blockedByTaskIds) {
    const prerequisite = taskMap.get(depId);
    if (prerequisite && prerequisite.status !== 'completed') {
      blockingTasks.push(prerequisite);
    }
  }

  return {
    isBlocked: blockingTasks.length > 0,
    blockingTasks,
  };
}

/**
 * Formats a list of blocking prerequisite task titles for UI tooltips and alert badges
 */
export function formatBlockingPrerequisites(blockingTasks: AgentTask[]): string {
  if (blockingTasks.length === 0) return '';
  if (blockingTasks.length === 1) return `Blocked by: ${blockingTasks[0].title}`;
  return `Blocked by: ${blockingTasks.map((t) => t.title).join(', ')}`;
}

/**
 * Checks whether adding `prereqId` as a blocker of `dependentId` would create
 * a circular dependency cycle or self-dependency.
 */
export function wouldCreateDependencyCycle(
  tasks: AgentTask[],
  prereqId: string,
  dependentId: string
): boolean {
  if (!prereqId || !dependentId) return false;
  if (prereqId === dependentId) return true;

  const taskMap = new Map<string, AgentTask>();
  for (const t of tasks) {
    taskMap.set(t.id, t);
  }

  // BFS/DFS walking upward from prereqId through its blockedByTaskIds.
  // If we can reach dependentId from prereqId, then adding dependentId -> blockedBy -> prereqId creates a cycle.
  const visited = new Set<string>();
  const stack: string[] = [prereqId];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    if (currentId === dependentId) return true;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const currentTask = taskMap.get(currentId);
    if (currentTask?.blockedByTaskIds) {
      for (const parentId of currentTask.blockedByTaskIds) {
        if (!visited.has(parentId)) {
          stack.push(parentId);
        }
      }
    }
  }

  return false;
}

