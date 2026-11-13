import { TaskCategory, TaskPriority } from '../types';

export const QUICK_ADD_PRESET_TAGS: string[] = [
  'Frontend',
  'API',
  'AI Agent',
  'Design',
  'Bugfix',
  'Docs',
  'Performance',
  'Security',
];

export const QUICK_ADD_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'critical'];

export interface QuickAddFormInput {
  title: string;
  description: string;
  priority: TaskPriority;
  category?: TaskCategory;
  tags: string[];
}

export interface QuickAddValidationResult {
  valid: boolean;
  error?: string;
  normalized?: {
    title: string;
    prompt: string;
    priority: TaskPriority;
    category: TaskCategory;
    tags: string[];
  };
}

/**
 * Normalizes a tag label by stripping leading '#' characters and collapsing whitespace.
 */
export function normalizeTag(raw: string): string {
  return raw
    .trim()
    .replace(/^#+/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 24);
}

/**
 * Adds a normalized tag while preventing case-insensitive duplicates and capping total tags.
 */
export function addQuickTag(existing: string[], candidate: string, maxTags = 8): string[] {
  const normalized = normalizeTag(candidate);
  if (!normalized) return existing;
  if (existing.length >= maxTags) return existing;
  const alreadyPresent = existing.some((t) => t.toLowerCase() === normalized.toLowerCase());
  if (alreadyPresent) return existing;
  return [...existing, normalized];
}

/**
 * Toggles a preset tag on or off cleanly.
 */
export function toggleQuickTag(existing: string[], tag: string, maxTags = 8): string[] {
  const normalized = normalizeTag(tag);
  if (!normalized) return existing;
  const exists = existing.some((t) => t.toLowerCase() === normalized.toLowerCase());
  if (exists) {
    return removeQuickTag(existing, normalized);
  }
  return addQuickTag(existing, normalized, maxTags);
}

/**
 * Removes a tag case-insensitively.
 */
export function removeQuickTag(existing: string[], tagToRemove: string): string[] {
  const target = normalizeTag(tagToRemove).toLowerCase();
  return existing.filter((t) => t.toLowerCase() !== target);
}

/**
 * Validates and normalizes Global Quick-Add task form submission.
 */
export function validateQuickAddForm(input: QuickAddFormInput): QuickAddValidationResult {
  const trimmedTitle = (input.title || '').trim();
  if (trimmedTitle.length < 3) {
    return {
      valid: false,
      error: 'Please enter a task title of at least 3 characters.',
    };
  }
  if (trimmedTitle.length > 140) {
    return {
      valid: false,
      error: 'Task title must be 140 characters or fewer.',
    };
  }

  const trimmedDescription = (input.description || '').trim();
  const resolvedPrompt =
    trimmedDescription.length >= 5
      ? trimmedDescription
      : `Quick-captured task objective: ${trimmedTitle}`;

  const priority = QUICK_ADD_PRIORITIES.includes(input.priority) ? input.priority : 'medium';
  const category: TaskCategory = input.category || 'work';
  const cleanedTags = (Array.isArray(input.tags) ? input.tags : []).reduce<string[]>(
    (acc, tag) => addQuickTag(acc, tag),
    []
  );

  return {
    valid: true,
    normalized: {
      title: trimmedTitle,
      prompt: resolvedPrompt,
      priority,
      category,
      tags: cleanedTags,
    },
  };
}
