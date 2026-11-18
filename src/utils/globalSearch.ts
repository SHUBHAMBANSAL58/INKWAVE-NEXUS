import Fuse from 'fuse.js';
import {
  AgentTask,
  Community,
  KnowledgeGraphNode,
  LibraryItem,
  Post,
} from '../types';

export type SearchEntityKind = 'task' | 'knowledge' | 'post';

export interface GlobalSearchDocument {
  id: string;
  kind: SearchEntityKind;
  title: string;
  subtitle: string;
  body: string;
  tags: string[];
  badge: string;
  entityId: string;
  targetView: 'nexus-core' | 'knowledge-graph' | 'library' | 'feed' | 'communities';
  postRef?: Post;
  nodeId?: string;
}

export interface GlobalSearchResult extends GlobalSearchDocument {
  score: number;
}

export interface GlobalSearchOutput {
  results: GlobalSearchResult[];
  grouped: Record<SearchEntityKind, GlobalSearchResult[]>;
  totalCount: number;
}

export interface BuildGlobalSearchInput {
  tasks: AgentTask[];
  posts: Post[];
  knowledgeNodes?: KnowledgeGraphNode[];
  libraryItems?: LibraryItem[];
  communities?: Community[];
}

export function buildGlobalSearchDocuments(input: BuildGlobalSearchInput): GlobalSearchDocument[] {
  const docs: GlobalSearchDocument[] = [];

  for (const task of input.tasks) {
    if (task.archived) continue;
    docs.push({
      id: `task:${task.id}`,
      kind: 'task',
      title: task.title,
      subtitle: `${task.priority.toUpperCase()} • ${task.status.replace('_', ' ')}${task.projectFolder ? ` • ${task.projectFolder}` : ''}`,
      body: task.prompt,
      tags: [
        ...(task.tags || []),
        task.category,
        task.status,
        task.projectFolder,
      ].filter((v): v is string => typeof v === 'string' && v.trim().length > 0),
      badge: 'Task',
      entityId: task.id,
      targetView: 'nexus-core',
    });
  }

  for (const node of input.knowledgeNodes || []) {
    docs.push({
      id: `kg:${node.id}`,
      kind: 'knowledge',
      title: node.label,
      subtitle: `Knowledge Graph • ${node.type.toUpperCase()} • ${node.group}`,
      body: `Semantic node (${node.group}) with ${node.connections.length} connections`,
      tags: [node.type, node.group, 'knowledge base', 'graph'],
      badge: 'Knowledge Base',
      entityId: node.id,
      nodeId: node.id,
      targetView: 'knowledge-graph',
    });
  }

  for (const item of input.libraryItems || []) {
    if (!item.post) continue;
    docs.push({
      id: `lib:${item.id}`,
      kind: 'knowledge',
      title: item.post.title,
      subtitle: `Saved Vault • ${item.collection} • by ${item.post.author.name}`,
      body: `${item.note || ''} ${item.post.excerpt || ''}`.trim(),
      tags: [item.collection, ...(item.post.tags || []), 'library', 'saved'],
      badge: 'Vault Article',
      entityId: item.post.id,
      postRef: item.post,
      targetView: 'library',
    });
  }

  for (const post of input.posts) {
    docs.push({
      id: `post:${post.id}`,
      kind: 'post',
      title: post.title,
      subtitle: `${post.author.name} • ${post.category} • ${post.readingTime} min read`,
      body: `${post.excerpt} ${post.content.slice(0, 320)}`,
      tags: [...post.tags, post.category, post.author.name, post.author.username],
      badge: 'Community Post',
      entityId: post.id,
      postRef: post,
      targetView: 'feed',
    });
  }

  for (const community of input.communities || []) {
    docs.push({
      id: `comm:${community.id}`,
      kind: 'post',
      title: community.name,
      subtitle: `Community World • ${community.membersCount.toLocaleString()} members`,
      body: community.description,
      tags: [...community.topics, 'community', community.slug],
      badge: 'Community',
      entityId: community.id,
      targetView: 'communities',
    });
  }

  return docs;
}

export function searchGlobalContent(
  documents: GlobalSearchDocument[],
  query: string,
  options: { category?: SearchEntityKind | 'all'; limit?: number } = {}
): GlobalSearchOutput {
  const trimmed = query.trim();
  const category = options.category ?? 'all';
  const limit = options.limit ?? 12;

  const emptyGrouped: Record<SearchEntityKind, GlobalSearchResult[]> = {
    task: [],
    knowledge: [],
    post: [],
  };

  if (!trimmed) {
    return {
      results: [],
      grouped: emptyGrouped,
      totalCount: 0,
    };
  }

  const scopedDocs =
    category === 'all' ? documents : documents.filter((doc) => doc.kind === category);

  const fuse = new Fuse(scopedDocs, {
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.4,
    minMatchCharLength: 2,
    keys: [
      { name: 'title', weight: 0.45 },
      { name: 'tags', weight: 0.25 },
      { name: 'subtitle', weight: 0.15 },
      { name: 'body', weight: 0.15 },
    ],
  });

  const hits = fuse.search(trimmed, { limit });
  const results: GlobalSearchResult[] = hits.map((hit) => ({
    ...hit.item,
    score: hit.score ?? 0,
  }));

  const grouped: Record<SearchEntityKind, GlobalSearchResult[]> = {
    task: [],
    knowledge: [],
    post: [],
  };

  for (const r of results) {
    grouped[r.kind].push(r);
  }

  return {
    results,
    grouped,
    totalCount: results.length,
  };
}
