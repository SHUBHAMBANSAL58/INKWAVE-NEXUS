import test from 'node:test';
import assert from 'node:assert/strict';
import {
  determineTaskFolder,
  autoClusterTasks,
  analyzeTaskSentiment,
  parseNaturalLanguageDeadline,
  smartSortTasks,
  getDailyDigestTasks,
  buildFocusBlockInsights,
} from './taskClustering';
import { AgentTask } from '../types';

test('TaskClustering: determineTaskFolder categorizes based on domain keywords', () => {
  const backendTask: Partial<AgentTask> = {
    title: 'Distributed Vector Memory API Contracts',
    prompt: 'Implement OpenAPI microservice endpoint specification.',
    category: 'engineering',
  };
  assert.equal(determineTaskFolder(backendTask as AgentTask), 'Architecture & Systems Core');

  const designTask: Partial<AgentTask> = {
    title: 'Fluid Typography Scale & Color Tokens',
    prompt: 'Design WCAG AA dark cosmic theme styling.',
    category: 'creative',
  };
  assert.equal(determineTaskFolder(designTask as AgentTask), 'Editorial & Design Systems');

  const securityTask: Partial<AgentTask> = {
    title: 'Zero-Knowledge Attestation Proofs',
    prompt: 'Run security audit and verification against firewall rules.',
    category: 'research',
  };
  assert.equal(determineTaskFolder(securityTask as AgentTask), 'Autonomous Security & Verification');
});

test('TaskClustering: autoClusterTasks applies folders to unassigned tasks while preserving manual folders', () => {
  const tasks: Partial<AgentTask>[] = [
    { id: '1', title: 'API Microservice', prompt: 'Server logic', category: 'engineering' },
    { id: '2', title: 'Custom App', prompt: 'Prompt', projectFolder: 'My Custom Project' },
  ];

  const clustered = autoClusterTasks(tasks as AgentTask[]);
  assert.equal(clustered[0].projectFolder, 'Architecture & Systems Core');
  assert.equal(clustered[1].projectFolder, 'My Custom Project');
});

test('TaskClustering: analyzeTaskSentiment identifies mood correctly', () => {
  assert.equal(analyzeTaskSentiment('Emergency fix', 'System down ASAP', 'high'), 'urgent');
  assert.equal(analyzeTaskSentiment('Benchmark Cache', 'Run distributed benchmark algorithms', 'medium'), 'complex');
  assert.equal(analyzeTaskSentiment('Refactor UI', 'Design smooth transitions', 'medium'), 'focused');
  assert.equal(analyzeTaskSentiment('Review notes', 'Read community feedback', 'low'), 'calm');
});

test('TaskClustering: parseNaturalLanguageDeadline extracts dates and cleans input string', () => {
  const parsedTomorrow = parseNaturalLanguageDeadline('Finish report tomorrow');
  assert.equal(parsedTomorrow.cleanedText, 'Finish report');
  assert.ok(parsedTomorrow.dueDate !== undefined);

  const parsedFriday = parseNaturalLanguageDeadline('Implement auth by Friday at 5pm');
  assert.equal(parsedFriday.cleanedText, 'Implement auth');
  assert.ok(parsedFriday.dueDate !== undefined);

  const plainText = parseNaturalLanguageDeadline('Write documentation');
  assert.equal(plainText.cleanedText, 'Write documentation');
  assert.equal(plainText.dueDate, undefined);
});

test('TaskClustering: smartSortTasks sorts by priority and urgency weighting', () => {
  const tLow: Partial<AgentTask> = { id: 'low', priority: 'low', status: 'pending' };
  const tHigh: Partial<AgentTask> = { id: 'high', priority: 'high', status: 'building' };
  const tMed: Partial<AgentTask> = { id: 'med', priority: 'medium', status: 'planning' };

  const sorted = smartSortTasks([tLow as AgentTask, tHigh as AgentTask, tMed as AgentTask]);
  assert.equal(sorted[0].id, 'high');
  assert.equal(sorted[1].id, 'med');
  assert.equal(sorted[2].id, 'low');
});

test('TaskClustering: getDailyDigestTasks includes critical and high unfinished non-archived tasks', () => {
  const tasks: Partial<AgentTask>[] = [
    { id: 'c1', title: 'Outage', priority: 'critical', status: 'pending' },
    { id: 'h1', title: 'Deploy', priority: 'high', status: 'building' },
    { id: 'done', title: 'Done', priority: 'critical', status: 'completed' },
    { id: 'arch', title: 'Archived', priority: 'high', status: 'pending', archived: true },
    { id: 'low1', title: 'Minor', priority: 'low', status: 'pending' },
  ];

  const digest = getDailyDigestTasks(tasks as AgentTask[]);
  assert.deepEqual(
    digest.map((t) => t.id),
    ['c1', 'h1']
  );
});

test('TaskClustering: buildFocusBlockInsights computes metrics and recommended focus blocks', () => {
  const tasks: Partial<AgentTask>[] = [
    { id: '1', title: 'API Contract', priority: 'critical', status: 'pending', category: 'engineering', estimatedHours: 2, focusTimeSeconds: 1800 },
    { id: '2', title: 'Wait on 1', priority: 'high', status: 'pending', blockedByTaskIds: ['1'], estimatedHours: 1 },
    { id: '3', title: 'Finish Docs', priority: 'low', status: 'pending', estimatedHours: 1 },
    { id: '4', title: 'Shipped Task', priority: 'medium', status: 'completed', estimatedHours: 2 },
  ];

  const insights = buildFocusBlockInsights(tasks as AgentTask[]);
  assert.equal(insights.unblockedHighPriorityCount, 1);
  assert.equal(insights.blockedCount, 1);
  assert.equal(insights.completionRate, 25);
  assert.ok(insights.recommendedBlocks.length >= 2);
});

