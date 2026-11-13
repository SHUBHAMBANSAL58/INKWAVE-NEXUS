import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveKeyboardShortcut } from './keyboardShortcuts';
import { saveToCache, loadFromCache, queueOfflineMutation, CACHE_KEYS } from './offlineStorage';

test('Keyboard Shortcuts: resolves Ctrl+1..0 navigation correctly', () => {
  assert.deepEqual(resolveKeyboardShortcut('0', true, false, false), { type: 'NAVIGATE', view: 'landing' });
  assert.deepEqual(resolveKeyboardShortcut('1', true, false, false), { type: 'NAVIGATE', view: 'feed' });
  assert.deepEqual(resolveKeyboardShortcut('2', true, false, false), { type: 'NAVIGATE', view: 'nexus-core' });
  assert.deepEqual(resolveKeyboardShortcut('3', false, true, false), { type: 'NAVIGATE', view: 'constellation' }); // metaKey
  assert.deepEqual(resolveKeyboardShortcut('4', true, false, false), { type: 'NAVIGATE', view: 'creator-deck' });
  assert.deepEqual(resolveKeyboardShortcut('7', true, false, false), { type: 'NAVIGATE', view: 'knowledge-graph' });
});

test('Keyboard Shortcuts: triggers NOVA via Ctrl+J and Pomodoro via Ctrl+Shift+P or Alt+P', () => {
  assert.deepEqual(resolveKeyboardShortcut('j', true, false, false), { type: 'TOGGLE_NOVA' });
  assert.deepEqual(resolveKeyboardShortcut('J', false, true, false), { type: 'TOGGLE_NOVA' });
  assert.deepEqual(resolveKeyboardShortcut('p', true, false, false, true, false), { type: 'TOGGLE_POMODORO' });
  assert.deepEqual(resolveKeyboardShortcut('p', false, false, false, false, true), { type: 'TOGGLE_POMODORO' });
});

test('Keyboard Shortcuts: prevents plain keystrokes when typing in an input element', () => {
  // If user types '1' or 'j' into an input without Ctrl/Cmd, it should NOT trigger a shortcut
  assert.equal(resolveKeyboardShortcut('1', false, false, true), null);
  assert.equal(resolveKeyboardShortcut('j', false, false, true), null);
  assert.equal(resolveKeyboardShortcut('?', false, false, true), null);

  // But Ctrl+2 in an input should still switch to Nexus
  assert.deepEqual(resolveKeyboardShortcut('2', true, false, true), { type: 'NAVIGATE', view: 'nexus-core' });
});

test('Offline Storage: safely persists, loads, and queues mutations in mock storage', () => {
  const mockStorageMap = new Map<string, string>();
  const mockStorage: any = {
    getItem: (k: string) => mockStorageMap.get(k) || null,
    setItem: (k: string, v: string) => mockStorageMap.set(k, v),
  };

  const samplePosts = [{ id: 'p1', title: 'Offline Post' }];
  const saved = saveToCache('test_key', samplePosts, mockStorage);
  assert.equal(saved, true);

  const loaded = loadFromCache('test_key', [], mockStorage);
  assert.deepEqual(loaded, samplePosts);

  // Queue offline actions
  const queue1 = queueOfflineMutation({ type: 'LIKE_POST', payload: { postId: 'p1' } }, mockStorage);
  assert.equal(queue1.length, 1);
  assert.equal(queue1[0].type, 'LIKE_POST');

  const queue2 = queueOfflineMutation({ type: 'BOOKMARK_POST', payload: { postId: 'p1' } }, mockStorage);
  assert.equal(queue2.length, 2);
});
