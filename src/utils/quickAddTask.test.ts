import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeTag,
  addQuickTag,
  toggleQuickTag,
  removeQuickTag,
  validateQuickAddForm,
} from './quickAddTask.ts';

test('quickAddTask: normalizeTag strips hashes, collapses whitespace, and caps length', () => {
  assert.equal(normalizeTag('  ##Frontend   UI '), 'Frontend UI');
  assert.equal(normalizeTag('   '), '');
  assert.equal(normalizeTag('VeryLongTagNameExceedingTwentyFourChars').length, 24);
});

test('quickAddTask: addQuickTag, toggleQuickTag, and removeQuickTag prevent duplicates', () => {
  let tags = addQuickTag([], 'API');
  tags = addQuickTag(tags, 'api');
  assert.deepEqual(tags, ['API']);

  tags = toggleQuickTag(tags, 'Design');
  assert.deepEqual(tags, ['API', 'Design']);

  tags = toggleQuickTag(tags, 'api');
  assert.deepEqual(tags, ['Design']);

  tags = removeQuickTag(tags, 'design');
  assert.deepEqual(tags, []);
});

test('quickAddTask: validateQuickAddForm rejects short titles and normalizes valid submissions', () => {
  const invalid = validateQuickAddForm({
    title: 'Hi',
    description: '',
    priority: 'high',
    tags: ['API'],
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.error);

  const validMinimal = validateQuickAddForm({
    title: '  Audit OAuth callback route  ',
    description: '',
    priority: 'critical',
    tags: ['#Security', 'API', 'security'],
  });
  assert.equal(validMinimal.valid, true);
  assert.equal(validMinimal.normalized?.title, 'Audit OAuth callback route');
  assert.equal(validMinimal.normalized?.priority, 'critical');
  assert.deepEqual(validMinimal.normalized?.tags, ['Security', 'API']);
  assert.ok(validMinimal.normalized?.prompt.includes('Audit OAuth callback route'));

  const validFull = validateQuickAddForm({
    title: 'Ship release dashboard',
    description: 'Build metrics panel and verify responsive breakpoints.',
    priority: 'medium',
    category: 'engineering',
    tags: ['Frontend'],
  });
  assert.equal(validFull.valid, true);
  assert.equal(validFull.normalized?.category, 'engineering');
  assert.equal(validFull.normalized?.prompt, 'Build metrics panel and verify responsive breakpoints.');
});
