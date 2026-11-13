import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidTransition, processAgentHandoff, validateTaskInput } from './orchestrator';
import { calculateReadingTime, extractTableOfContents } from './readingTime';
import { calculateCreatorDNA, synthesizeCreatorTwinSample } from './creatorDna';
import { AgentTask, Post } from '../types';

test('Orchestrator: validates legal and illegal state transitions', () => {
  assert.equal(isValidTransition('pending', 'planning'), true);
  assert.equal(isValidTransition('planning', 'designing'), true);
  assert.equal(isValidTransition('designing', 'building'), true);
  assert.equal(isValidTransition('building', 'testing'), true);
  assert.equal(isValidTransition('testing', 'awaiting_approval'), true);
  assert.equal(isValidTransition('awaiting_approval', 'completed'), true);

  // Illegal jump
  assert.equal(isValidTransition('pending', 'completed'), false);
  assert.equal(isValidTransition('completed', 'planning'), false);
});

test('Orchestrator: manages handoff pipeline and retry circuit breaker', () => {
  const dummyTask: AgentTask = {
    id: 'task-1',
    title: 'Test Feature',
    prompt: 'Implement a new real-time graph visualization',
    status: 'testing',
    priority: 'high',
    activeAgent: 'tester',
    creatorId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    retryCount: 0,
    approvalRequired: true,
    logs: [],
  };

  // Test passed -> awaiting approval
  const passResult = processAgentHandoff(dummyTask, true);
  assert.equal(passResult.nextStatus, 'awaiting_approval');
  assert.equal(passResult.requiresApproval, true);

  // Test failed, retry 0 -> send back to builder
  const failResult1 = processAgentHandoff(dummyTask, false);
  assert.equal(failResult1.nextStatus, 'building');
  assert.equal(failResult1.nextAgent, 'builder');

  // Test failed when retryCount >= MAX_TESTER_RETRIES -> circuit breaker fails task
  const failedMaxTask: AgentTask = { ...dummyTask, retryCount: 2 };
  const circuitBreakerResult = processAgentHandoff(failedMaxTask, false);
  assert.equal(circuitBreakerResult.nextStatus, 'failed');
  assert.equal(circuitBreakerResult.logAction, 'ORCHESTRATION_CIRCUIT_BREAKER');
});

test('Orchestrator: validates task inputs correctly', () => {
  assert.equal(validateTaskInput('', '').valid, false);
  assert.equal(validateTaskInput('Hi', 'Short').valid, false);
  assert.equal(
    validateTaskInput('Build Notifications System', 'Create real-time notification toaster and bell dropdown').valid,
    true
  );
});

test('ReadingTime: accurately computes words, minutes and extracts headings', () => {
  const content = `
# Executive Overview
This is a comprehensive article exploring the frontiers of decentralized autonomous agents and social publishing networks.

## Architecture Fundamentals
The system leverages reactive event streaming and multi-agent coordination.

### Performance & Reliability
Latency is minimized through distributed edge caching and smart state hydrations.
  `;

  const reading = calculateReadingTime(content);
  assert.ok(reading.words > 15);
  assert.equal(reading.minutes >= 1, true);

  const toc = extractTableOfContents(content);
  assert.equal(toc.length, 3);
  assert.equal(toc[0].text, 'Executive Overview');
  assert.equal(toc[0].level, 1);
  assert.equal(toc[1].text, 'Architecture Fundamentals');
  assert.equal(toc[1].level, 2);
  assert.equal(toc[2].text, 'Performance & Reliability');
  assert.equal(toc[2].level, 3);
});

test('CreatorDNA: computes consistency and radar profiles', () => {
  const mockPosts: Post[] = [
    {
      id: 'p1',
      authorId: 'u-1',
      author: {} as any,
      title: 'Neural Networks in Production',
      slug: 'neural-networks-in-production',
      content: '```ts\nconst model = load();\n``` In this post we analyze latency and performance metrics?',
      excerpt: 'Post excerpt',
      tags: ['AI', 'Architecture'],
      category: 'Engineering',
      readingTime: 3,
      wordCount: 150,
      publishedAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z',
      visibility: 'public',
      likesCount: 12,
      commentsCount: 3,
      bookmarksCount: 4,
      viewsCount: 120,
    },
  ];

  const dna = calculateCreatorDNA('u-1', mockPosts);
  assert.equal(dna.userId, 'u-1');
  assert.ok(dna.consistencyScore >= 20);
  assert.ok(dna.dominantTopics.length > 0);
  assert.ok(dna.styleRadar.technicalDepth >= 60);
});

test('CreatorDNA: synthesizeCreatorTwinSample reflects signature phrases and filters banned cliches', () => {
  const sample = synthesizeCreatorTwinSample(
    {
      tone: 'analytical',
      creativityLevel: 80,
      concisenessLevel: 60,
      technicalDepthLevel: 90,
      activeVoicePreference: true,
      bannedCliches: ['delve into', 'game-changer'],
      signaturePhrases: ['systems telemetry'],
      customDirective: 'Use crisp invariants',
    },
    'Zero-Trust Agents (a game-changer)'
  );
  assert.ok(sample.includes('systems telemetry'));
  assert.equal(sample.toLowerCase().includes('game-changer'), false);
  assert.ok(sample.includes('Use crisp invariants'));
});

