import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSubtaskProgress, generateInitialsAvatarDataUri } from './subtaskProgress.ts';
import { TaskSubtask } from '../types.ts';

test('calculateSubtaskProgress: handles undefined and empty subtasks cleanly', () => {
  const emptyUndefined = calculateSubtaskProgress(undefined);
  assert.equal(emptyUndefined.completed, 0);
  assert.equal(emptyUndefined.total, 0);
  assert.equal(emptyUndefined.percentage, 0);
  assert.equal(emptyUndefined.status, 'empty');
  assert.equal(emptyUndefined.strokeDashoffset, emptyUndefined.circumference);

  const emptyArray = calculateSubtaskProgress([]);
  assert.equal(emptyArray.total, 0);
  assert.equal(emptyArray.percentage, 0);
  assert.equal(emptyArray.status, 'empty');
});

test('calculateSubtaskProgress: computes partial progress ratio and SVG dashoffset accurately', () => {
  const subtasks: TaskSubtask[] = [
    { id: '1', title: 'Step 1', completed: true },
    { id: '2', title: 'Step 2', completed: false },
    { id: '3', title: 'Step 3', completed: true },
    { id: '4', title: 'Step 4', completed: false },
  ];

  const metrics = calculateSubtaskProgress(subtasks, 40, 4);
  assert.equal(metrics.completed, 2);
  assert.equal(metrics.total, 4);
  assert.equal(metrics.ratio, 0.5);
  assert.equal(metrics.percentage, 50);
  assert.equal(metrics.status, 'in_progress');
  assert.equal(metrics.radius, 18);
  assert.ok(Math.abs(metrics.strokeDashoffset - metrics.circumference * 0.5) < 0.0001);
});

test('calculateSubtaskProgress: marks 100% subtasks as complete with zero dashoffset', () => {
  const subtasks: TaskSubtask[] = [
    { id: '1', title: 'Design', completed: true },
    { id: '2', title: 'Build', completed: true },
    { id: '3', title: 'Verify', completed: true },
  ];

  const metrics = calculateSubtaskProgress(subtasks);
  assert.equal(metrics.completed, 3);
  assert.equal(metrics.total, 3);
  assert.equal(metrics.percentage, 100);
  assert.equal(metrics.status, 'complete');
  assert.ok(Math.abs(metrics.strokeDashoffset) < 0.0001);
});

test('generateInitialsAvatarDataUri: builds valid inline SVG avatar data URI', () => {
  const uri = generateInitialsAvatarDataUri('Alex Vance');
  assert.ok(uri.startsWith('data:image/svg+xml;utf8,'));
  assert.ok(decodeURIComponent(uri).includes('AV'));
});
