import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateNextRunDate, regenerateRecurringTask } from './taskRecurrence.ts';
import { AgentTask } from '../types.ts';

test('TaskRecurrence: calculates accurate next run dates for daily, weekly, and monthly', () => {
  const baseDate = new Date('2026-11-10T12:00:00Z');

  // Daily: +1 day
  const daily = calculateNextRunDate('daily', baseDate);
  assert.ok(daily);
  assert.equal(new Date(daily).toISOString().slice(0, 10), '2026-11-11');

  // Weekly: +7 days
  const weekly = calculateNextRunDate('weekly', baseDate);
  assert.ok(weekly);
  assert.equal(new Date(weekly).toISOString().slice(0, 10), '2026-11-17');

  // Monthly: +1 month
  const monthly = calculateNextRunDate('monthly', baseDate);
  assert.ok(monthly);
  assert.equal(new Date(monthly).toISOString().slice(0, 10), '2026-12-10');

  // None: returns null
  const none = calculateNextRunDate('none', baseDate);
  assert.equal(none, null);
});

test('TaskRecurrence: correctly regenerates a recurring task upon completion', () => {
  const completedTask: AgentTask = {
    id: 'task-test-orig',
    title: 'Daily System Health Check',
    prompt: 'Verify all database replicas and memory topologies.',
    status: 'completed',
    priority: 'high',
    category: 'engineering',
    recurrence: 'daily',
    activeAgent: 'tester',
    creatorId: 'user-alex',
    createdAt: '2026-11-10T08:00:00Z',
    updatedAt: '2026-11-10T10:00:00Z',
    retryCount: 1,
    approvalRequired: true,
    logs: [],
  };

  const regenerated = regenerateRecurringTask(completedTask, new Date('2026-11-10T10:00:00Z'));
  assert.ok(regenerated);
  assert.notEqual(regenerated.id, completedTask.id);
  assert.equal(regenerated.title, completedTask.title);
  assert.equal(regenerated.status, 'pending');
  assert.equal(regenerated.priority, 'high');
  assert.equal(regenerated.category, 'engineering');
  assert.equal(regenerated.recurrence, 'daily');
  assert.equal(regenerated.recurrenceParentId, 'task-test-orig');
  assert.equal(regenerated.activeAgent, 'planner');
  assert.equal(regenerated.retryCount, 0);
  assert.ok(regenerated.dueDate);
  assert.equal(new Date(regenerated.dueDate).toISOString().slice(0, 10), '2026-11-11');
  assert.equal(regenerated.logs.length, 1);
  assert.equal(regenerated.logs[0].action, 'RECURRING_TASK_REGENERATED');
});

test('TaskRecurrence: ignores non-recurring tasks', () => {
  const nonRecurringTask: AgentTask = {
    id: 'task-once',
    title: 'One-off migration',
    prompt: 'Migrate legacy schema.',
    status: 'completed',
    priority: 'medium',
    category: 'work',
    recurrence: 'none',
    activeAgent: 'tester',
    creatorId: 'user-alex',
    createdAt: '2026-11-10T08:00:00Z',
    updatedAt: '2026-11-10T10:00:00Z',
    retryCount: 0,
    approvalRequired: false,
    logs: [],
  };

  const result = regenerateRecurringTask(nonRecurringTask);
  assert.equal(result, null);
});

test('TaskRecurrence: preserves tags, projectFolder, and resets subtasks on regenerated task', () => {
  const completedWithMeta: AgentTask = {
    id: 'task-meta',
    title: 'Weekly Digest',
    prompt: 'Compile release metrics',
    status: 'completed',
    priority: 'medium',
    category: 'work',
    recurrence: 'weekly',
    tags: ['metrics', 'ops'],
    projectFolder: 'Architecture & Systems Core',
    subtasks: [
      { id: 's1', title: 'Export logs', completed: true },
      { id: 's2', title: 'Write summary', completed: true },
    ],
    activeAgent: 'tester',
    creatorId: 'user-alex',
    createdAt: '2026-11-10T08:00:00Z',
    updatedAt: '2026-11-10T10:00:00Z',
    retryCount: 0,
    approvalRequired: true,
    logs: [],
  };

  const regenerated = regenerateRecurringTask(completedWithMeta, new Date('2026-11-10T10:00:00Z'));
  assert.ok(regenerated);
  assert.deepEqual(regenerated.tags, ['metrics', 'ops']);
  assert.equal(regenerated.projectFolder, 'Architecture & Systems Core');
  assert.equal(regenerated.subtasks?.length, 2);
  assert.equal(regenerated.subtasks?.[0].completed, false);
  assert.equal(regenerated.subtasks?.[1].completed, false);
});

