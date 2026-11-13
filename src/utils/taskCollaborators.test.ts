import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_TEAM_COLLABORATORS,
  getTaskCollaborators,
  addCollaborator,
  removeCollaborator,
  formatCollaboratorsSummary,
} from './taskCollaborators';
import { AgentTask, TaskCollaborator } from '../types';

test('TaskCollaborators: getTaskCollaborators falls back gracefully between collaborators and assignees', () => {
  const dummyCollaborator: TaskCollaborator = {
    id: 'user-1',
    name: 'Ada Lovelace',
    avatar: 'https://example.com/ada.jpg',
    role: 'lead',
  };

  const taskWithCollaborators = {
    collaborators: [dummyCollaborator],
  } as Partial<AgentTask>;
  assert.equal(getTaskCollaborators(taskWithCollaborators).length, 1);
  assert.equal(getTaskCollaborators(taskWithCollaborators)[0].name, 'Ada Lovelace');

  const taskWithAssignees = {
    assignees: [dummyCollaborator],
  } as Partial<AgentTask>;
  assert.equal(getTaskCollaborators(taskWithAssignees).length, 1);
  assert.equal(getTaskCollaborators(taskWithAssignees)[0].name, 'Ada Lovelace');

  const emptyTask = {} as Partial<AgentTask>;
  assert.deepEqual(getTaskCollaborators(emptyTask), []);
});

test('TaskCollaborators: addCollaborator prevents duplicates and updates existing entries', () => {
  const memberA: TaskCollaborator = {
    id: 'user-a',
    name: 'Alan Turing',
    email: 'alan@bletchley.org',
    avatar: 'https://example.com/alan.jpg',
    role: 'contributor',
  };
  const memberB: TaskCollaborator = {
    id: 'user-b',
    name: 'Grace Hopper',
    email: 'grace@navy.mil',
    avatar: 'https://example.com/grace.jpg',
    role: 'reviewer',
  };

  let list = addCollaborator([], memberA);
  assert.equal(list.length, 1);
  assert.equal(list[0].id, 'user-a');

  list = addCollaborator(list, memberB);
  assert.equal(list.length, 2);

  // Re-adding with updated role should update in place
  const updatedA: TaskCollaborator = { ...memberA, role: 'lead' };
  list = addCollaborator(list, updatedA);
  assert.equal(list.length, 2);
  assert.equal(list.find((c) => c.id === 'user-a')?.role, 'lead');
});

test('TaskCollaborators: removeCollaborator removes member by id or email', () => {
  const list: TaskCollaborator[] = [
    { id: '1', name: 'Devon', email: 'devon@test.com', avatar: 'img1' },
    { id: '2', name: 'Sophia', email: 'sophia@test.com', avatar: 'img2' },
  ];

  const afterRemoveId = removeCollaborator(list, '1');
  assert.equal(afterRemoveId.length, 1);
  assert.equal(afterRemoveId[0].id, '2');

  const afterRemoveEmail = removeCollaborator(list, 'sophia@test.com');
  assert.equal(afterRemoveEmail.length, 1);
  assert.equal(afterRemoveEmail[0].id, '1');
});

test('TaskCollaborators: formatCollaboratorsSummary outputs human-readable summary', () => {
  assert.equal(formatCollaboratorsSummary([]), 'Unassigned');

  const formatted = formatCollaboratorsSummary([
    { id: '1', name: 'Elena', avatar: 'a', role: 'lead' },
    { id: '2', name: 'Marcus', avatar: 'b', role: 'contributor' },
  ]);
  assert.equal(formatted, 'Elena (lead); Marcus (contributor)');
});
