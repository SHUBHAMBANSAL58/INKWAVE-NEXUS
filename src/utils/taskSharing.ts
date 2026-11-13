export interface TaskShareValidationResult {
  valid: boolean;
  error?: string;
}

export function validateTaskShareInput(
  taskId: string,
  ownerId: string,
  inviteeEmail: string,
  role: string
): TaskShareValidationResult {
  if (!taskId || taskId.trim().length === 0) {
    return { valid: false, error: 'Task ID is required' };
  }
  if (!ownerId || ownerId.trim().length === 0) {
    return { valid: false, error: 'Owner ID is required' };
  }
  if (!inviteeEmail || !inviteeEmail.includes('@') || !inviteeEmail.includes('.')) {
    return { valid: false, error: 'Valid invitee email address is required' };
  }
  if (!['collaborator', 'reviewer', 'observer'].includes(role)) {
    return { valid: false, error: 'Invalid collaboration role specified' };
  }
  return { valid: true };
}

export function formatGoogleChatMessage(
  taskTitle: string,
  taskId: string,
  inviterName: string,
  role: string,
  appUrl: string
): { title: string; text: string; link: string } {
  const normalizedId = taskId.startsWith('task-') ? taskId.replace('task-', '') : taskId;
  const link = `${appUrl}/#nexus-task-${normalizedId}`;
  const text = `${inviterName} has invited you to collaborate as a ${role.toUpperCase()} on task "${taskTitle}" in INKWAVE NEXUS.`;
  return {
    title: `Task Invitation: ${taskTitle}`,
    text,
    link,
  };
}
