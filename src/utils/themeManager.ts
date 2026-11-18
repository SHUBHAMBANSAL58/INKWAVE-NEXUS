export type ThemeMode = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'inkwave_nexus_theme_v1';
export const DARK_THEME_CLASS = 'dark-theme';
export const LIGHT_THEME_CLASS = 'light-theme';

export function themeToCssClass(theme: ThemeMode): typeof DARK_THEME_CLASS | typeof LIGHT_THEME_CLASS {
  return theme === 'light' ? LIGHT_THEME_CLASS : DARK_THEME_CLASS;
}

export function normalizeStoredTheme(rawValue: string | null | undefined): ThemeMode | null {
  if (!rawValue) return null;
  const normalized = rawValue.trim().toLowerCase();
  if (normalized === 'light' || normalized === LIGHT_THEME_CLASS) return 'light';
  if (normalized === 'dark' || normalized === DARK_THEME_CLASS) return 'dark';
  return null;
}

export function getInitialTheme(storage: Pick<Storage, 'getItem'> | null = null): ThemeMode {
  try {
    const targetStorage = storage ?? (typeof window !== 'undefined' ? window.localStorage : null);
    if (!targetStorage) return 'dark';
    const primary = normalizeStoredTheme(targetStorage.getItem(THEME_STORAGE_KEY));
    if (primary) return primary;
    const legacy = normalizeStoredTheme(targetStorage.getItem('theme'));
    if (legacy) return legacy;
    return 'dark';
  } catch {
    return 'dark';
  }
}

export function saveThemePreference(
  theme: ThemeMode,
  storage: Pick<Storage, 'setItem'> | null = null
): boolean {
  try {
    const targetStorage = storage ?? (typeof window !== 'undefined' ? window.localStorage : null);
    if (!targetStorage) return false;
    targetStorage.setItem(THEME_STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
}

export interface ClassListLike {
  add: (...tokens: string[]) => void;
  remove: (...tokens: string[]) => void;
}

export function applyThemeClasses(
  theme: ThemeMode,
  bodyEl: { classList: ClassListLike } | null = typeof document !== 'undefined' ? document.body : null,
  rootEl: { classList: ClassListLike } | null = typeof document !== 'undefined' ? document.documentElement : null
): typeof DARK_THEME_CLASS | typeof LIGHT_THEME_CLASS {
  const activeClass = themeToCssClass(theme);
  const inactiveClass = theme === 'light' ? DARK_THEME_CLASS : LIGHT_THEME_CLASS;

  if (bodyEl?.classList) {
    bodyEl.classList.remove(inactiveClass);
    bodyEl.classList.add(activeClass);
  }
  if (rootEl?.classList) {
    rootEl.classList.remove(inactiveClass);
    rootEl.classList.add(activeClass);
  }

  return activeClass;
}
