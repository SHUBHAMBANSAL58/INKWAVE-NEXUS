import test from 'node:test';
import assert from 'node:assert/strict';
import { isPostInReadLater, toggleReadLaterItem, filterLibraryItems, READ_LATER_COLLECTION } from './readLater';
import { Post, LibraryItem } from '../types';

const mockPost: Post = {
  id: 'p-test-101',
  authorId: 'user-1',
  author: {
    id: 'user-1',
    name: 'Ada Lovelace',
    username: 'adalovelace',
    avatar: '',
    coverImage: '',
    bio: '',
    interests: [],
    skills: [],
    followersCount: 10,
    followingCount: 5,
    isVerified: true,
    role: 'user',
    creatorBadges: [],
  },
  title: 'Analytical Engines in Modern Distributed Networks',
  slug: 'analytical-engines',
  content: 'Full article content for offline reading.',
  excerpt: 'Full article content for offline reading...',
  tags: ['Architecture'],
  category: 'Engineering',
  readingTime: 4,
  wordCount: 800,
  publishedAt: '2026-11-08',
  updatedAt: '2026-11-08',
  visibility: 'public',
  likesCount: 12,
  commentsCount: 3,
  bookmarksCount: 5,
  viewsCount: 200,
};

test('Read Later: detects when a post is not in the collection', () => {
  const initialItems: LibraryItem[] = [];
  assert.equal(isPostInReadLater(initialItems, mockPost.id), false);
});

test('Read Later: adds a post to the Read Later collection and marks it saved', () => {
  const initialItems: LibraryItem[] = [];
  const { updatedItems, isSaved } = toggleReadLaterItem(initialItems, mockPost, 'user-1');

  assert.equal(isSaved, true);
  assert.equal(updatedItems.length, 1);
  assert.equal(updatedItems[0].collection, READ_LATER_COLLECTION);
  assert.equal(updatedItems[0].postId, mockPost.id);
  assert.equal(isPostInReadLater(updatedItems, mockPost.id), true);
});

test('Read Later: toggling an already saved post removes it from the collection', () => {
  const initialItems: LibraryItem[] = [];
  const { updatedItems: savedItems } = toggleReadLaterItem(initialItems, mockPost, 'user-1');
  assert.equal(savedItems.length, 1);

  // Toggle again
  const { updatedItems: finalItems, isSaved } = toggleReadLaterItem(savedItems, mockPost, 'user-1');
  assert.equal(isSaved, false);
  assert.equal(finalItems.length, 0);
  assert.equal(isPostInReadLater(finalItems, mockPost.id), false);
});

test('Read Later: filters library items by collection and search query', () => {
  const item1: LibraryItem = {
    id: 'l1',
    userId: 'user-1',
    postId: mockPost.id,
    post: mockPost,
    collection: READ_LATER_COLLECTION,
    createdAt: '2026-11-08',
  };
  const item2: LibraryItem = {
    id: 'l2',
    userId: 'user-1',
    collection: 'Architecture',
    note: 'Important note on micro-kernels',
    createdAt: '2026-11-08',
  };

  const allItems = [item1, item2];

  // Filter by Read Later
  const readLaterFiltered = filterLibraryItems(allItems, READ_LATER_COLLECTION);
  assert.equal(readLaterFiltered.length, 1);
  assert.equal(readLaterFiltered[0].id, 'l1');

  // Filter by search query
  const queryFiltered = filterLibraryItems(allItems, 'All', 'analytical');
  assert.equal(queryFiltered.length, 1);
  assert.equal(queryFiltered[0].id, 'l1');
});
