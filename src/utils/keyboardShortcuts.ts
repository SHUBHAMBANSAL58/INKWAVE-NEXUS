import { ActiveView } from '../context/AppContext';

export type ShortcutAction =
  | { type: 'NAVIGATE'; view: ActiveView }
  | { type: 'TOGGLE_NOVA' }
  | { type: 'TOGGLE_SEARCH' }
  | { type: 'TOGGLE_SHORTCUTS' }
  | { type: 'TOGGLE_THEME' }
  | { type: 'TOGGLE_POMODORO' };

export interface ShortcutDefinition {
  key: string;
  ctrlOrCmd: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: ShortcutAction;
}

export const SHORTCUTS: ShortcutDefinition[] = [
  { key: '0', ctrlOrCmd: true, description: 'Navigate to Cosmic Hero Landing', action: { type: 'NAVIGATE', view: 'landing' } },
  { key: '1', ctrlOrCmd: true, description: 'Navigate to Feed & Discover', action: { type: 'NAVIGATE', view: 'feed' } },
  { key: '2', ctrlOrCmd: true, description: 'Navigate to NEXUS CORE (4-Agents)', action: { type: 'NAVIGATE', view: 'nexus-core' } },
  { key: '3', ctrlOrCmd: true, description: 'Navigate to Idea Constellation 3D', action: { type: 'NAVIGATE', view: 'constellation' } },
  { key: '4', ctrlOrCmd: true, description: 'Navigate to Creator Command Deck', action: { type: 'NAVIGATE', view: 'creator-deck' } },
  { key: '5', ctrlOrCmd: true, description: 'Navigate to AI Creator Studio', action: { type: 'NAVIGATE', view: 'editor' } },
  { key: '6', ctrlOrCmd: true, description: 'Navigate to Community Worlds', action: { type: 'NAVIGATE', view: 'communities' } },
  { key: '7', ctrlOrCmd: true, description: 'Navigate to Knowledge Graph', action: { type: 'NAVIGATE', view: 'knowledge-graph' } },
  { key: '8', ctrlOrCmd: true, description: 'Navigate to Creator DNA', action: { type: 'NAVIGATE', view: 'creator-dna' } },
  { key: '9', ctrlOrCmd: true, description: 'Navigate to Personal Library', action: { type: 'NAVIGATE', view: 'library' } },
  { key: 'j', ctrlOrCmd: true, description: 'Trigger NOVA Assistant', action: { type: 'TOGGLE_NOVA' } },
  { key: 'k', ctrlOrCmd: true, description: 'Focus Search / Command Bar', action: { type: 'TOGGLE_SEARCH' } },
  { key: 't', ctrlOrCmd: true, description: 'Toggle Light / Dark Theme', action: { type: 'TOGGLE_THEME' } },
  { key: 'p', ctrlOrCmd: true, shift: true, description: 'Start / Pause Pomodoro Focus Timer', action: { type: 'TOGGLE_POMODORO' } },
  { key: '?', ctrlOrCmd: false, description: 'View Keyboard Shortcuts', action: { type: 'TOGGLE_SHORTCUTS' } },
];

/**
 * Pure evaluation function that resolves an incoming keydown event into a defined platform shortcut action.
 */
export function resolveKeyboardShortcut(
  key: string,
  ctrlKey: boolean,
  metaKey: boolean,
  isInputElement: boolean,
  shiftKey: boolean = false,
  altKey: boolean = false
): ShortcutAction | null {
  const hasModifier = ctrlKey || metaKey;
  const lowerKey = key.toLowerCase();

  // Alt+P toggles Pomodoro globally even outside Ctrl/Cmd
  if (altKey && !hasModifier && lowerKey === 'p') {
    return { type: 'TOGGLE_POMODORO' };
  }

  // If user is typing in an input or textarea, only trigger Ctrl/Cmd modified shortcuts
  if (isInputElement && !hasModifier) {
    return null;
  }

  // Check '?' without modifier
  if (!isInputElement && key === '?') {
    return { type: 'TOGGLE_SHORTCUTS' };
  }

  if (hasModifier) {
    if (shiftKey && lowerKey === 'p') return { type: 'TOGGLE_POMODORO' };
    if (lowerKey === '0') return { type: 'NAVIGATE', view: 'landing' };
    if (lowerKey === '1') return { type: 'NAVIGATE', view: 'feed' };
    if (lowerKey === '2') return { type: 'NAVIGATE', view: 'nexus-core' };
    if (lowerKey === '3') return { type: 'NAVIGATE', view: 'constellation' };
    if (lowerKey === '4') return { type: 'NAVIGATE', view: 'creator-deck' };
    if (lowerKey === '5') return { type: 'NAVIGATE', view: 'editor' };
    if (lowerKey === '6') return { type: 'NAVIGATE', view: 'communities' };
    if (lowerKey === '7') return { type: 'NAVIGATE', view: 'knowledge-graph' };
    if (lowerKey === '8') return { type: 'NAVIGATE', view: 'creator-dna' };
    if (lowerKey === '9') return { type: 'NAVIGATE', view: 'library' };
    if (lowerKey === 'c') return { type: 'NAVIGATE', view: 'ai-studio' };
    if (lowerKey === 'g') return { type: 'NAVIGATE', view: 'cosmic-game' };
    if (lowerKey === 'j') return { type: 'TOGGLE_NOVA' };
    if (lowerKey === 'k') return { type: 'TOGGLE_SEARCH' };
    if (lowerKey === 't') return { type: 'TOGGLE_THEME' };
  }

  return null;
}

