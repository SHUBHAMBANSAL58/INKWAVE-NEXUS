import { TaskCollaborator, AgentTask } from '../types';

export const DEFAULT_TEAM_COLLABORATORS: TaskCollaborator[] = [
  {
    id: 'user-elena-vance',
    name: 'Dr. Elena Vance',
    email: 'elena.vance@inkwave.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'lead',
  },
  {
    id: 'user-marcus-chen',
    name: 'Marcus Chen',
    email: 'marcus.chen@inkwave.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    role: 'contributor',
  },
  {
    id: 'user-sarah-connor',
    name: 'Sarah Connor',
    email: 'sarah.connor@cyberdyne-research.org',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    role: 'reviewer',
  },
  {
    id: 'user-devon-miles',
    name: 'Devon Miles',
    email: 'devon.miles@flag-foundation.ai',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    role: 'contributor',
  },
  {
    id: 'user-sophia-lin',
    name: 'Sophia Lin',
    email: 'sophia@sophiacodes.design',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    role: 'reviewer',
  },
];

/**
 * Returns the effective collaborators for a task, checking both `collaborators` and `assignees` arrays
 */
export function getTaskCollaborators(task: AgentTask | Partial<AgentTask>): TaskCollaborator[] {
  if (Array.isArray(task.collaborators) && task.collaborators.length > 0) {
    return task.collaborators;
  }
  if (Array.isArray(task.assignees) && task.assignees.length > 0) {
    return task.assignees;
  }
  return [];
}

/**
 * Adds a collaborator to an existing list without duplicates (matching by ID or email)
 */
export function addCollaborator(
  current: TaskCollaborator[] = [],
  collaborator: TaskCollaborator
): TaskCollaborator[] {
  const existingIdx = current.findIndex(
    (c) => c.id === collaborator.id || (collaborator.email && c.email === collaborator.email)
  );

  const prepared: TaskCollaborator = {
    ...collaborator,
    assignedAt: collaborator.assignedAt || new Date().toISOString(),
    role: collaborator.role || 'contributor',
  };

  if (existingIdx !== -1) {
    // Update existing collaborator
    const updated = [...current];
    updated[existingIdx] = prepared;
    return updated;
  }

  return [...current, prepared];
}

/**
 * Removes a collaborator by ID or email
 */
export function removeCollaborator(
  current: TaskCollaborator[] = [],
  collaboratorIdOrEmail: string
): TaskCollaborator[] {
  return current.filter(
    (c) => c.id !== collaboratorIdOrEmail && c.email !== collaboratorIdOrEmail
  );
}

/**
 * Formats a clean human-readable list of collaborators for exports and tooltips
 */
export function formatCollaboratorsSummary(collaborators: TaskCollaborator[] = []): string {
  if (!collaborators || collaborators.length === 0) return 'Unassigned';
  return collaborators
    .map((c) => `${c.name}${c.role ? ` (${c.role})` : ''}`)
    .join('; ');
}
