import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

export interface FirestoreContact {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  organization?: string;
  createdAt: string;
}

export interface FirestoreTaskShare {
  id: string;
  taskId: string;
  taskTitle: string;
  ownerId: string;
  inviteeEmail: string;
  inviteeName?: string;
  role: 'collaborator' | 'reviewer' | 'observer';
  status: 'invited' | 'accepted' | 'revoked';
  createdAt: string;
}

export interface FirestoreChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'model' | 'system';
  text: string;
  modelUsed?: string;
  createdAt: string;
}

// Default team contacts for immediate demonstration
const INITIAL_DEMO_CONTACTS: Omit<FirestoreContact, 'userId'>[] = [
  {
    id: 'contact-elena',
    name: 'Dr. Elena Vance',
    email: 'elena.vance@inkwave.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    organization: 'Quantum AI Systems Lab',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'contact-marcus',
    name: 'Marcus Chen',
    email: 'marcus.chen@inkwave.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    organization: 'NEXUS Architecture Team',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'contact-sarah',
    name: 'Sarah Connor',
    email: 'sarah.connor@cyberdyne-research.org',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    organization: 'Systems Reliability Group',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'contact-devon',
    name: 'Devon Miles',
    email: 'devon.miles@flag-foundation.ai',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    organization: 'Autonomous Agents Core',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Ensures user's contact list is seeded with team contacts in Firestore
 */
export async function ensureContactsSeeded(userId: string): Promise<FirestoreContact[]> {
  const path = 'contacts';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const seeded: FirestoreContact[] = [];
      for (const demo of INITIAL_DEMO_CONTACTS) {
        const contactId = `${userId}_${demo.id}`;
        const item: FirestoreContact = {
          ...demo,
          id: contactId,
          userId,
        };
        await setDoc(doc(db, path, contactId), item);
        seeded.push(item);
      }
      return seeded;
    }

    return snapshot.docs.map((docSnap) => docSnap.data() as FirestoreContact);
  } catch (error) {
    console.warn('[Firestore] Error getting contacts, returning local fallback:', error);
    return INITIAL_DEMO_CONTACTS.map((c) => ({ ...c, id: `${userId}_${c.id}`, userId }));
  }
}

const LOCAL_SHARES_KEY = 'inkwave_nexus_task_shares';

function getLocalShares(): FirestoreTaskShare[] {
  try {
    const raw = localStorage.getItem(LOCAL_SHARES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalShares(shares: FirestoreTaskShare[]) {
  try {
    localStorage.setItem(LOCAL_SHARES_KEY, JSON.stringify(shares));
  } catch (e) {
    console.warn('[LocalCache] Failed to store task shares:', e);
  }
}

/**
 * Creates a Task Share invite in Firestore (with offline and local cache support)
 */
export async function shareTaskWithContact(
  taskShareData: Omit<FirestoreTaskShare, 'id' | 'createdAt' | 'status'>
): Promise<FirestoreTaskShare> {
  const shareId = `share_${taskShareData.taskId}_${Date.now()}`;
  const newShare: FirestoreTaskShare = {
    ...taskShareData,
    id: shareId,
    status: 'invited',
    createdAt: new Date().toISOString(),
  };

  // 1. Immediately store in local cache for offline & instant responsiveness
  const currentShares = getLocalShares();
  const updatedShares = [newShare, ...currentShares.filter((s) => s.id !== shareId)];
  saveLocalShares(updatedShares);
  window.dispatchEvent(new CustomEvent('nexus:task-shares-updated', { detail: { taskId: taskShareData.taskId } }));

  // 2. Persist to Firestore (which leverages persistentLocalCache)
  const path = 'task_shares';
  try {
    await setDoc(doc(db, path, shareId), newShare);
    return newShare;
  } catch (error) {
    console.warn('[Firestore] Task share saved locally. Firestore sync deferred:', error);
    return newShare;
  }
}

/**
 * Subscribes to task shares for a specific task with local cache & real-time sync
 */
export function subscribeToTaskShares(
  taskId: string,
  onUpdate: (shares: FirestoreTaskShare[]) => void
): () => void {
  // Emit current local cache immediately
  const getSharesForTask = () => getLocalShares().filter((s) => s.taskId === taskId);
  onUpdate(getSharesForTask());

  // Listen to local update events
  const handleLocalUpdate = (e: Event) => {
    const customEvent = e as CustomEvent;
    if (!customEvent.detail?.taskId || customEvent.detail.taskId === taskId) {
      onUpdate(getSharesForTask());
    }
  };
  window.addEventListener('nexus:task-shares-updated', handleLocalUpdate);

  const path = 'task_shares';
  try {
    const q = query(collection(db, path), where('taskId', '==', taskId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as FirestoreTaskShare);
          // Merge with local shares
          const localOther = getLocalShares().filter((s) => s.taskId !== taskId);
          saveLocalShares([...list, ...localOther]);
          onUpdate(list);
        }
      },
      (error) => {
        // Fallback to local cache when offline or unauthenticated
        onUpdate(getSharesForTask());
      }
    );

    return () => {
      window.removeEventListener('nexus:task-shares-updated', handleLocalUpdate);
      unsubscribe();
    };
  } catch (err) {
    return () => {
      window.removeEventListener('nexus:task-shares-updated', handleLocalUpdate);
    };
  }
}

/**
 * Revokes a task share invitation
 */
export async function revokeTaskShare(shareId: string): Promise<void> {
  // Update local cache
  const shares = getLocalShares().filter((s) => s.id !== shareId);
  saveLocalShares(shares);
  window.dispatchEvent(new CustomEvent('nexus:task-shares-updated', { detail: {} }));

  // Remove from Firestore
  const path = 'task_shares';
  try {
    await deleteDoc(doc(db, path, shareId));
  } catch (error) {
    console.warn('[Firestore] Local share revoked; Firestore sync deferred:', error);
  }
}

const LOCAL_CHAT_KEY_PREFIX = 'inkwave_nexus_chat_';

function getLocalChat(userId: string): FirestoreChatMessage[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_CHAT_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalChat(userId: string, messages: FirestoreChatMessage[]) {
  try {
    localStorage.setItem(`${LOCAL_CHAT_KEY_PREFIX}${userId}`, JSON.stringify(messages));
  } catch (e) {
    console.warn('[LocalCache] Failed to store chat messages:', e);
  }
}

/**
 * Saves a chat message to Firestore with automatic offline caching and sync
 */
export async function saveChatMessageToFirestore(
  userId: string,
  role: 'user' | 'model' | 'system',
  text: string,
  modelUsed?: string
): Promise<void> {
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const message: FirestoreChatMessage = {
    id: messageId,
    userId,
    role,
    text,
    modelUsed: modelUsed || 'gemini-4-hydrogen',
    createdAt: new Date().toISOString(),
  };

  // 1. Immediately store in local cache
  const cached = getLocalChat(userId);
  saveLocalChat(userId, [...cached, message]);
  window.dispatchEvent(new CustomEvent('nexus:chat-messages-updated', { detail: { userId } }));

  // 2. Persist to Firestore
  const path = 'chat_messages';
  try {
    await setDoc(doc(db, path, messageId), message);
  } catch (error) {
    console.warn('[Firestore] Chat message saved locally; Firestore sync deferred:', error);
  }
}

/**
 * Subscribes to chat messages with local cache and real-time synchronization
 */
export function subscribeToChatMessages(
  userId: string,
  onUpdate: (messages: FirestoreChatMessage[]) => void
): () => void {
  // Emit current local cache immediately
  onUpdate(getLocalChat(userId));

  const handleLocalChatUpdate = (e: Event) => {
    const customEvent = e as CustomEvent;
    if (!customEvent.detail?.userId || customEvent.detail.userId === userId) {
      onUpdate(getLocalChat(userId));
    }
  };
  window.addEventListener('nexus:chat-messages-updated', handleLocalChatUpdate);

  const path = 'chat_messages';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((d) => d.data() as FirestoreChatMessage);
          saveLocalChat(userId, list);
          onUpdate(list);
        }
      },
      (error) => {
        onUpdate(getLocalChat(userId));
      }
    );

    return () => {
      window.removeEventListener('nexus:chat-messages-updated', handleLocalChatUpdate);
      unsubscribe();
    };
  } catch (err) {
    return () => {
      window.removeEventListener('nexus:chat-messages-updated', handleLocalChatUpdate);
    };
  }
}
