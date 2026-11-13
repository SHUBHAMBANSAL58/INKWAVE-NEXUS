import test from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeCSVField,
  exportTasksToJSON,
  exportTasksToCSV,
} from './taskExport';
import { AgentTask } from '../types';

const SAMPLE_TASKS: AgentTask[] = [
  {
    id: 'task-101',
    title: 'Autonomous Knowledge Graph, "Force-Directed"',
    prompt: 'Implement physics simulation;\nsupport node filtering and edge highlights.',
    status: 'completed',
    priority: 'high',
    category: 'engineering',
    recurrence: 'weekly',
    estimatedHours: 12,
    focusTimeSeconds: 1500,
    blockedByTaskIds: ['task-100'],
    collaborators: [
      { id: 'user-1', name: 'Dr. Elena Vance', avatar: 'avatar1.jpg', role: 'lead' },
      { id: 'user-2', name: 'Marcus Chen', avatar: 'avatar2.jpg', role: 'contributor' },
    ],
    activeAgent: 'tester',
    creatorId: 'alexvance',
    createdAt: '2026-11-08T10:00:00Z',
    updatedAt: '2026-11-08T12:00:00Z',
    retryCount: 0,
    approvalRequired: true,
    approvedBy: 'Alex Vance',
    logs: [],
  },
  {
    id: 'task-102',
    title: 'Plain Task',
    prompt: 'Simple prompt without special symbols.',
    status: 'pending',
    priority: 'low',
    category: 'personal',
    activeAgent: 'planner',
    creatorId: 'alexvance',
    createdAt: '2026-11-08T13:00:00Z',
    updatedAt: '2026-11-08T13:00:00Z',
    retryCount: 0,
    approvalRequired: false,
    logs: [],
  },
];

test('TaskExport: escapeCSVField correctly handles null, plain, comma, quotes and newlines', () => {
  assert.equal(escapeCSVField(null), '');
  assert.equal(escapeCSVField(undefined), '');
  assert.equal(escapeCSVField('Simple'), 'Simple');
  assert.equal(escapeCSVField('Hello, World'), '"Hello, World"');
  assert.equal(escapeCSVField('Quote "Here"'), '"Quote ""Here"""');
  assert.equal(escapeCSVField('Line 1\nLine 2'), '"Line 1\nLine 2"');
  assert.equal(escapeCSVField('Semi;Colon'), '"Semi;Colon"');
});

test('TaskExport: exportTasksToJSON outputs valid parsable JSON backup with metadata', () => {
  const jsonStr = exportTasksToJSON(SAMPLE_TASKS);
  assert.ok(typeof jsonStr === 'string');

  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.version, '1.0');
  assert.equal(parsed.totalTasks, 2);
  assert.equal(parsed.tasks.length, 2);
  assert.equal(parsed.tasks[0].id, 'task-101');
  assert.equal(parsed.tasks[0].collaborators.length, 2);
});

test('TaskExport: exportTasksToCSV creates RFC 4180 compliant CSV table', () => {
  const csvStr = exportTasksToCSV(SAMPLE_TASKS);
  assert.ok(typeof csvStr === 'string');

  const lines = csvStr.split('\r\n');
  assert.ok(lines.length >= 3); // Header + 2 rows

  // Check header
  assert.ok(lines[0].startsWith('Task ID,Title,Prompt,Status,Priority'));
  assert.ok(lines[0].includes('Assignees / Collaborators'));

  // Check row 1 with escaped quotes & commas
  assert.ok(lines[1].includes('task-101'));
  assert.ok(lines[1].includes('""Force-Directed""'));
  assert.ok(lines[1].includes('Dr. Elena Vance (lead); Marcus Chen (contributor)'));
  assert.ok(lines[1].includes('task-100'));

  // Check row 2 unassigned
  assert.ok(lines[2].includes('task-102'));
  assert.ok(lines[2].includes('Unassigned'));
});

test('TaskExport: handles empty task list gracefully', () => {
  const emptyCSV = exportTasksToCSV([]);
  const lines = emptyCSV.split('\r\n');
  assert.equal(lines.length, 1); // Only header row

  const emptyJSON = exportTasksToJSON([]);
  const parsed = JSON.parse(emptyJSON);
  assert.equal(parsed.totalTasks, 0);
  assert.deepEqual(parsed.tasks, []);
});
