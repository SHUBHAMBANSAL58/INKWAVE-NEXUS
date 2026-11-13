import { LibraryItem, Post } from '../types';

export const READ_LATER_COLLECTION = 'Read Later';

/**
 * Checks whether an article is currently in the Read Later collection.
 */
export function isPostInReadLater(items: LibraryItem[], postId: string): boolean {
  return items.some(
    (item) => item.collection === READ_LATER_COLLECTION && (item.postId === postId || item.post?.id === postId)
  );
}

/**
 * Toggles an article into or out of the Read Later library collection.
 * Returns a new array of LibraryItems and a boolean indicating whether it is now saved.
 */
export function toggleReadLaterItem(
  items: LibraryItem[],
  post: Post,
  userId: string
): { updatedItems: LibraryItem[]; isSaved: boolean } {
  const existing = items.find(
    (item) => item.collection === READ_LATER_COLLECTION && (item.postId === post.id || item.post?.id === post.id)
  );

  if (existing) {
    // Remove from Read Later
    return {
      updatedItems: items.filter((item) => item.id !== existing.id),
      isSaved: false,
    };
  }

  // Add new Read Later item at the front
  const newItem: LibraryItem = {
    id: `read-later-${post.id}-${Date.now()}`,
    userId,
    postId: post.id,
    post,
    note: 'Saved for offline reading in Read Later collection.',
    collection: READ_LATER_COLLECTION,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  return {
    updatedItems: [newItem, ...items],
    isSaved: true,
  };
}

/**
 * Filters a library list by collection name.
 */
export function filterLibraryItems(items: LibraryItem[], collection: string, query?: string): LibraryItem[] {
  let result = [...items];
  if (collection !== 'All') {
    result = result.filter((item) => item.collection.toLowerCase() === collection.toLowerCase());
  }
  if (query && query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (item) =>
        item.post?.title.toLowerCase().includes(q) ||
        item.post?.excerpt.toLowerCase().includes(q) ||
        item.note?.toLowerCase().includes(q) ||
        item.collection.toLowerCase().includes(q)
    );
  }
  return result;
}
