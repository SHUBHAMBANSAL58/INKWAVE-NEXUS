import { TaskSubtask } from '../types';

export type SubtaskProgressStatus = 'empty' | 'in_progress' | 'complete';

export interface SubtaskProgressMetrics {
  completed: number;
  total: number;
  ratio: number;
  percentage: number;
  size: number;
  strokeWidth: number;
  center: number;
  radius: number;
  circumference: number;
  strokeDashoffset: number;
  status: SubtaskProgressStatus;
}

/**
 * Pure geometry and completion calculator for circular SVG subtask progress rings.
 */
export function calculateSubtaskProgress(
  subtasks?: TaskSubtask[],
  size = 36,
  strokeWidth = 3.5
): SubtaskProgressMetrics {
  const list = Array.isArray(subtasks) ? subtasks : [];
  const total = list.length;
  const completed = list.filter((s) => Boolean(s.completed)).length;
  const ratio = total > 0 ? Math.min(1, Math.max(0, completed / total)) : 0;
  const percentage = Math.round(ratio * 100);

  const safeSize = Math.max(16, size);
  const safeStroke = Math.min(safeSize / 3, Math.max(1.5, strokeWidth));
  const center = safeSize / 2;
  const radius = (safeSize - safeStroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - ratio);

  let status: SubtaskProgressStatus = 'empty';
  if (total > 0 && completed === total) {
    status = 'complete';
  } else if (completed > 0) {
    status = 'in_progress';
  }

  return {
    completed,
    total,
    ratio,
    percentage,
    size: safeSize,
    strokeWidth: safeStroke,
    center,
    radius,
    circumference,
    strokeDashoffset,
    status,
  };
}

/**
 * Generates a deterministic inline SVG data-URI avatar using a user's initials.
 * Eliminates broken external avatar URLs for custom collaborators and offline mode.
 */
export function generateInitialsAvatarDataUri(name: string): string {
  const clean = (name || 'U').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : clean.slice(0, 2).toUpperCase();

  let hash = 0;
  for (let i = 0; i < clean.length; i += 1) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palettes = [
    ['#0284c7', '#4f46e5'],
    ['#0891b2', '#2563eb'],
    ['#7c3aed', '#0ea5e9'],
    ['#059669', '#0284c7'],
  ];
  const [c1, c2] = palettes[Math.abs(hash) % palettes.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="80" height="80" rx="40" fill="url(#g)"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="28" font-weight="700">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
