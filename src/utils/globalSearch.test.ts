import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGlobalSearchDocuments,
  searchGlobalContent,
} from './globalSearch';
import {
  INITIAL_AGENT_TASKS,
  INITIAL_COMMUNITIES,
  INITIAL_KNOWLEDGE_NODES,
  INITIAL_POSTS,
} from '../mockData';

const sampleDocs = buildGlobalSearchDocuments({
  tasks: INITIAL_AGENT_TASKS,
  posts: INITIAL_POSTS,
  knowledgeNodes: INITIAL_KNOWLEDGE_NODES,
  communities: INITIAL_COMMUNITIES,
  libraryItems: [
    {
      id: 'lib-test-1',
      userId: INITIAL_POSTS[0].authorId,
      postId: INITIAL_POSTS[0].id,
      post: INITIAL_POSTS[0],
      note: 'Reference notes on semantic multi-agent RAG handoffs',
      collection: 'Architecture',
      createdAt: '2026-11-08',
    },
  ],
});

test('buildGlobalSearchDocuments indexes tasks, knowledge base entries, and community posts', () => {
  assert.ok(sampleDocs.some((d) => d.kind === 'task'));
  assert.ok(sampleDocs.some((d) => d.kind === 'knowledge'));
  assert.ok(sampleDocs.some((d) => d.kind === 'post'));
  assert.ok(!sampleDocs.some((d) => d.title.includes('Nonexistent')));
});

test('searchGlobalContent returns empty output for blank queries', () => {
  const empty = searchGlobalContent(sampleDocs, '   ');
  assert.equal(empty.totalCount, 0);
  assert.equal(empty.results.length, 0);
});

test('searchGlobalContent fuzzy matches tasks even with minor typos via Fuse.js', () => {
  const res = searchGlobalContent(sampleDocs, 'knwoledge graph visualizr', { category: 'task' });
  assert.ok(res.results.length >= 1, 'Expected fuzzy match on task title');
  assert.equal(res.results[0].kind, 'task');
  assert.equal(res.results[0].entityId, 'task-live-1');
  assert.equal(res.results[0].targetView, 'nexus-core');
});

test('searchGlobalContent matches across knowledge base and community posts', () => {
  const res = searchGlobalContent(sampleDocs, 'multi-agent');
  assert.ok(res.grouped.knowledge.length >= 1, 'Expected Knowledge Base hits');
  assert.ok(res.grouped.post.length >= 1, 'Expected Community Post hits');
});

test('searchGlobalContent respects category filter', () => {
  const knowledgeOnly = searchGlobalContent(sampleDocs, 'design', { category: 'knowledge' });
  assert.ok(knowledgeOnly.results.length >= 1);
  assert.ok(knowledgeOnly.results.every((r) => r.kind === 'knowledge'));
});
