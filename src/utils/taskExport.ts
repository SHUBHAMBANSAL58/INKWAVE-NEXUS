import { AgentTask } from '../types';
import { getTaskCollaborators, formatCollaboratorsSummary } from './taskCollaborators';

export interface TaskBackupExport {
  version: string;
  appName: string;
  exportedAt: string;
  totalTasks: number;
  tasks: AgentTask[];
}

/**
 * Escapes a field according to RFC 4180 CSV specifications:
 * Any field containing commas, double quotes, or newlines is wrapped in double quotes,
 * and any internal double quotes are escaped by doubling them ("").
 */
export function escapeCSVField(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Serializes current tasks into a structured JSON backup string
 */
export function exportTasksToJSON(tasks: AgentTask[]): string {
  const backup: TaskBackupExport = {
    version: '1.0',
    appName: 'INKWAVE NEXUS CORE',
    exportedAt: new Date().toISOString(),
    totalTasks: tasks.length,
    tasks,
  };
  return JSON.stringify(backup, null, 2);
}

/**
 * Serializes current tasks into RFC 4180 compliant CSV format
 */
export function exportTasksToCSV(tasks: AgentTask[]): string {
  const headers = [
    'Task ID',
    'Title',
    'Prompt',
    'Status',
    'Priority',
    'Category',
    'Active Agent',
    'Estimated Hours',
    'Focus Time (Sec)',
    'Recurrence',
    'Assignees / Collaborators',
    'Blocked By Task IDs',
    'Approval Required',
    'Approved By',
    'Created At',
    'Updated At',
  ];

  const rows = tasks.map((task) => {
    const collabs = getTaskCollaborators(task);
    const collabSummary = formatCollaboratorsSummary(collabs);
    const blockedBy = Array.isArray(task.blockedByTaskIds) ? task.blockedByTaskIds.join('; ') : '';

    return [
      escapeCSVField(task.id),
      escapeCSVField(task.title),
      escapeCSVField(task.prompt),
      escapeCSVField(task.status),
      escapeCSVField(task.priority),
      escapeCSVField(task.category || 'work'),
      escapeCSVField(task.activeAgent),
      escapeCSVField(task.estimatedHours ?? 8),
      escapeCSVField(task.focusTimeSeconds ?? 0),
      escapeCSVField(task.recurrence || 'none'),
      escapeCSVField(collabSummary),
      escapeCSVField(blockedBy),
      escapeCSVField(task.approvalRequired ? 'true' : 'false'),
      escapeCSVField(task.approvedBy || ''),
      escapeCSVField(task.createdAt),
      escapeCSVField(task.updatedAt),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Triggers a client-side file download for backup data
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Generates and triggers local file backup for tasks in JSON or CSV format
 */
export function triggerTaskBackup(
  tasks: AgentTask[],
  format: 'json' | 'csv'
): { filename: string; format: string; count: number; sizeBytes: number } {
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `nexus-tasks-backup-${dateStr}.${format}`;

  let content = '';
  let mimeType = '';

  if (format === 'json') {
    content = exportTasksToJSON(tasks);
    mimeType = 'application/json';
  } else {
    content = exportTasksToCSV(tasks);
    mimeType = 'text/csv;charset=utf-8;';
  }

  downloadFile(content, filename, mimeType);

  return {
    filename,
    format,
    count: tasks.length,
    sizeBytes: new Blob([content]).size,
  };
}
