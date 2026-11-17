import { Post, LibraryItem, Story, AgentTask } from '../types';

export const CACHE_KEYS = {
  POSTS: 'inkwave_nexus_posts_cache_v1',
  LIBRARY: 'inkwave_nexus_library_cache_v1',
  STORIES: 'inkwave_nexus_stories_cache_v1',
  TASKS: 'inkwave_nexus_tasks_cache_v1',
  BLUEPRINTS: 'inkwave_nexus_blueprints_cache_v1',
  MESSAGES: 'inkwave_nexus_messages_cache_v1',
  CREATOR_DNA_SUMMARY: 'inkwave_nexus_creator_dna_summary_v1',
  OFFLINE_QUEUE: 'inkwave_nexus_offline_queue_v1',
};

export interface OfflineAction {
  id: string;
  type: 'LIKE_POST' | 'BOOKMARK_POST' | 'CREATE_POST' | 'CREATE_TASK';
  payload: any;
  timestamp: string;
}

/**
 * Safely writes JSON data to a storage provider (or mock storage in tests).
 */
export function saveToCache<T>(key: string, data: T, storage: Storage | null = null): boolean {
  try {
    const targetStorage = storage || (typeof window !== 'undefined' ? window.localStorage : null);
    if (!targetStorage) return false;
    targetStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Safely retrieves JSON data from storage.
 */
export function loadFromCache<T>(key: string, fallback: T, storage: Storage | null = null): T {
  try {
    const targetStorage = storage || (typeof window !== 'undefined' ? window.localStorage : null);
    if (!targetStorage) return fallback;
    const raw = targetStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    return fallback;
  }
}

/**
 * Queues an offline mutation to be synchronized when network connectivity is re-established.
 */
export function queueOfflineMutation(action: Omit<OfflineAction, 'id' | 'timestamp'>, storage: Storage | null = null): OfflineAction[] {
  const existing = loadFromCache<OfflineAction[]>(CACHE_KEYS.OFFLINE_QUEUE, [], storage);
  const newAction: OfflineAction = {
    ...action,
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  const updated = [...existing, newAction];
  saveToCache(CACHE_KEYS.OFFLINE_QUEUE, updated, storage);
  return updated;
}
