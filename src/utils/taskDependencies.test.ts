import test from 'node:test';
import assert from 'node:assert/strict';
import { isTaskBlocked, formatBlockingPrerequisites, wouldCreateDependencyCycle } from './taskDependencies.ts';
import { AgentTask } from '../types.ts';

test('TaskDependencies: identifies blocked tasks when prerequisite is pending', () => {
  const prereqTask: AgentTask = {
    id: 'task-prereq-1',
    title: 'Database Architecture Plan',
    prompt: 'Design relational schema.',
    status: 'building',
    priority: 'high',
    activeAgent: 'builder',
    creatorId: 'alex',
    createdAt: '2026-11-10T10:00:00Z',
    updatedAt: '2026-11-10T11:00:00Z',
    retryCount: 0,
    approvalRequired: true,
    logs: [],
  };

  const dependentTask: AgentTask = {
    id: 'task-dependent-1',
    title: 'Implement API Routes',
    prompt: 'Hook up controllers to schema.',
    status: 'pending',
    priority: 'high',
    blockedByTaskIds: ['task-prereq-1'],
    activeAgent: 'planner',
    creatorId: 'alex',
    createdAt: '2026-11-10T10:00:00Z',
    updatedAt: '2026-11-10T11:00:00Z',
    retryCount: 0,
    approvalRequired: true,
    logs: [],
  };

  const check = isTaskBlocked(dependentTask, [prereqTask, dependentTask]);
  assert.equal(check.isBlocked, true);
  assert.equal(check.blockingTasks.length, 1);
  assert.equal(check.blockingTasks[0].id, 'task-prereq-1');
  assert.equal(formatBlockingPrerequisites(check.blockingTasks), 'Blocked by: Database Architecture Plan');
});

test('TaskDependencies: unblocks task when prerequisite is completed', () => {
  const completedPrereq: AgentTask = {
    id: 'task-prereq-1',
    title: 'Database Architecture Plan',
    prompt: 'Design relational schema.',
    status: 'completed',
    priority: 'high',
    activeAgent: 'tester',
    creatorId: 'alex',
    createdAt: '2026-11-10T10:00:00Z',
    updatedAt: '2026-11-10T11:00:00Z',
    retryCount: 0,
    approvalRequired: true,
    logs: [],
  };

  const dependentTask: AgentTask = {
    id: 'task-dependent-1',
    title: 'Implement API Routes',
    prompt: 'Hook up controllers to schema.',
    status: 'pending',
    priority: 'high',
    blockedByTaskIds: ['task-prereq-1'],
    activeAgent: 'planner',
    creatorId: 'alex',
    createdAt: '2026-11-10T10:00:00Z',
    updatedAt: '2026-11-10T11:00:00Z',
    retryCount: 0,
    approvalRequired: true,
    logs: [],
  };

  const check = isTaskBlocked(dependentTask, [completedPrereq, dependentTask]);
  assert.equal(check.isBlocked, false);
  assert.equal(check.blockingTasks.length, 0);
  assert.equal(formatBlockingPrerequisites(check.blockingTasks), '');
});

test('TaskDependencies: returns not blocked when task has no dependencies', () => {
  const standaloneTask: AgentTask = {
    id: 'task-standalone',
    title: 'Independent Research',
    prompt: 'Explore LLM streaming.',
    status: 'pending',
    priority: 'low',
    activeAgent: 'planner',
    creatorId: 'alex',
    createdAt: '2026-11-10T10:00:00Z',
    updatedAt: '2026-11-10T11:00:00Z',
    retryCount: 0,
    approvalRequired: true,
    logs: [],
  };

  const check = isTaskBlocked(standaloneTask, [standaloneTask]);
  assert.equal(check.isBlocked, false);
  assert.equal(check.blockingTasks.length, 0);
});

test('TaskDependencies: wouldCreateDependencyCycle prevents self-links and multi-hop cycles', () => {
  const tA: AgentTask = {
    id: 'a',
    title: 'A',
    prompt: 'A',
    status: 'pending',
    priority: 'medium',
    activeAgent: 'planner',
    creatorId: 'u1',
    createdAt: '',
    updatedAt: '',
    retryCount: 0,
    approvalRequired: true,
    logs: [],
  };
  const tB: AgentTask = { ...tA, id: 'b', title: 'B', blockedByTaskIds: ['a'] };
  const tC: AgentTask = { ...tA, id: 'c', title: 'C', blockedByTaskIds: ['b'] };
  const list = [tA, tB, tC];

  assert.equal(wouldCreateDependencyCycle(list, 'a', 'a'), true);
  assert.equal(wouldCreateDependencyCycle(list, 'c', 'a'), true); // adding A blockedBy C creates A->C->B->A cycle
  assert.equal(wouldCreateDependencyCycle(list, 'b', 'a'), true);
  assert.equal(wouldCreateDependencyCycle(list, 'a', 'c'), false); // valid DAG edge
});

