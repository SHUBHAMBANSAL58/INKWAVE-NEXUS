import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTaskShareInput, formatGoogleChatMessage } from './taskSharing';

test('TaskSharing: validates required fields and legal roles', () => {
  assert.equal(validateTaskShareInput('', 'user-1', 'alex@inkwave.io', 'collaborator').valid, false);
  assert.equal(validateTaskShareInput('task-1', '', 'alex@inkwave.io', 'collaborator').valid, false);
  assert.equal(validateTaskShareInput('task-1', 'user-1', 'invalid-email', 'collaborator').valid, false);
  assert.equal(validateTaskShareInput('task-1', 'user-1', 'alex@inkwave.io', 'invalid_role').valid, false);

  assert.equal(validateTaskShareInput('task-1', 'user-1', 'alex@inkwave.io', 'collaborator').valid, true);
  assert.equal(validateTaskShareInput('task-1', 'user-1', 'elena@inkwave.io', 'reviewer').valid, true);
  assert.equal(validateTaskShareInput('task-1', 'user-1', 'marcus@inkwave.io', 'observer').valid, true);
});

test('TaskSharing: formats Google Chat message with deep link', () => {
  const result = formatGoogleChatMessage(
    'Quantum Mesh Protocol',
    'task-401',
    'Dr. Vance',
    'reviewer',
    'https://inkwave.io'
  );

  assert.equal(result.title, 'Task Invitation: Quantum Mesh Protocol');
  assert.match(result.text, /Dr\. Vance has invited you to collaborate as a REVIEWER/);
  assert.equal(result.link, 'https://inkwave.io/#nexus-task-401');
});
