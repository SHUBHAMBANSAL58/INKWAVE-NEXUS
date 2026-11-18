import test from 'node:test';
import assert from 'node:assert/strict';
import {
  THEME_STORAGE_KEY,
  DARK_THEME_CLASS,
  LIGHT_THEME_CLASS,
  getInitialTheme,
  saveThemePreference,
  applyThemeClasses,
  normalizeStoredTheme,
} from './themeManager';

function createMemoryStorage(initial: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

function createFakeClassList(initial: string[] = []) {
  const set = new Set<string>(initial);
  return {
    add(...tokens: string[]) {
      tokens.forEach((t) => set.add(t));
    },
    remove(...tokens: string[]) {
      tokens.forEach((t) => set.delete(t));
    },
    contains(token: string) {
      return set.has(token);
    },
    values() {
      return Array.from(set);
    },
  };
}

test('normalizeStoredTheme handles light, dark, and class strings', () => {
  assert.equal(normalizeStoredTheme('light'), 'light');
  assert.equal(normalizeStoredTheme('light-theme'), 'light');
  assert.equal(normalizeStoredTheme('DARK'), 'dark');
  assert.equal(normalizeStoredTheme('dark-theme'), 'dark');
  assert.equal(normalizeStoredTheme('unknown'), null);
  assert.equal(normalizeStoredTheme(null), null);
});

test('getInitialTheme and saveThemePreference persist and restore cleanly', () => {
  const storage = createMemoryStorage();
  assert.equal(getInitialTheme(storage), 'dark');

  assert.equal(saveThemePreference('light', storage), true);
  assert.equal(storage.getItem(THEME_STORAGE_KEY), 'light');
  assert.equal(getInitialTheme(storage), 'light');

  assert.equal(saveThemePreference('dark', storage), true);
  assert.equal(getInitialTheme(storage), 'dark');
});

test('applyThemeClasses switches dark-theme and light-theme mutually exclusively on body and root', () => {
  const body = { classList: createFakeClassList(['dark-theme']) };
  const root = { classList: createFakeClassList() };

  const lightApplied = applyThemeClasses('light', body, root);
  assert.equal(lightApplied, LIGHT_THEME_CLASS);
  assert.equal(body.classList.contains(LIGHT_THEME_CLASS), true);
  assert.equal(body.classList.contains(DARK_THEME_CLASS), false);
  assert.equal(root.classList.contains(LIGHT_THEME_CLASS), true);

  const darkApplied = applyThemeClasses('dark', body, root);
  assert.equal(darkApplied, DARK_THEME_CLASS);
  assert.equal(body.classList.contains(DARK_THEME_CLASS), true);
  assert.equal(body.classList.contains(LIGHT_THEME_CLASS), false);
  assert.equal(root.classList.contains(DARK_THEME_CLASS), true);
  assert.equal(root.classList.contains(LIGHT_THEME_CLASS), false);
});
