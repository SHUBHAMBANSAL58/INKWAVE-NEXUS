import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Post,
  Story,
  Community,
  AgentTask,
  TaskPriority,
  TaskCategory,
  RecurrenceFrequency,
  TaskStatus,
  Notification,
  DirectMessage,
  LibraryItem,
  TaskBlueprint,
  TaskCollaborator,
  TaskSubtask,
} from '../types';
import { regenerateRecurringTask, persistRecurringTaskToFirestore } from '../utils/taskRecurrence';
import {
  INITIAL_TASK_BLUEPRINTS,
  instantiateBlueprint,
  createBlueprintFromTasks,
} from '../utils/taskBlueprints';
import { addCollaborator, removeCollaborator, getTaskCollaborators } from '../utils/taskCollaborators';
import { autoClusterTasks, analyzeTaskSentiment } from '../utils/taskClustering';
import { wouldCreateDependencyCycle } from '../utils/taskDependencies';
import {
  CURRENT_USER,
  INITIAL_POSTS,
  INITIAL_AGENT_TASKS,
  INITIAL_COMMUNITIES,
  INITIAL_STORIES,
  INITIAL_NOTIFICATIONS,
  INITIAL_MESSAGES,
} from '../mockData';
import {
  saveToCache,
  loadFromCache,
  CACHE_KEYS,
  queueOfflineMutation,
} from '../utils/offlineStorage';
import { resolveKeyboardShortcut } from '../utils/keyboardShortcuts';
import { toggleReadLaterItem, isPostInReadLater } from '../utils/readLater';
import {
  getInitialTheme,
  saveThemePreference,
  applyThemeClasses,
} from '../utils/themeManager';

export type ActiveView =
  | 'landing'
  | 'feed'
  | 'ai-studio'
  | 'cosmic-game'
  | 'nexus-core'
  | 'constellation'
  | 'creator-deck'
  | 'communities'
  | 'knowledge-graph'
  | 'editor'
  | 'creator-dna'
  | 'analytics'
  | 'library'
  | 'messages'
  | 'admin';

interface AppContextType {
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  posts: Post[];
  addPost: (newPostData: Partial<Post>) => Promise<Post>;
  toggleLikePost: (postId: string) => Promise<void>;
  toggleBookmarkPost: (postId: string) => Promise<void>;
  tasks: AgentTask[];
  createTask: (
    title: string,
    prompt: string,
    priority?: TaskPriority,
    category?: TaskCategory,
    recurrence?: RecurrenceFrequency,
    blockedByTaskIds?: string[],
    collaborators?: TaskCollaborator[],
    subtasks?: TaskSubtask[],
    tags?: string[],
    projectFolder?: string,
    dueDate?: string
  ) => Promise<AgentTask>;
  advanceTaskStep: (taskId: string) => Promise<void>;
  approveTask: (taskId: string) => Promise<void>;
  rejectTask: (taskId: string, reason?: string) => Promise<void>;
  reorderTasks: (orderedIds: string[]) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  addCollaboratorToTask: (taskId: string, collaborator: TaskCollaborator) => Promise<void>;
  removeCollaboratorFromTask: (taskId: string, collaboratorId: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  archiveTask: (taskId: string, archived: boolean) => void;
  deleteTask: (taskId: string) => Promise<void>;
  batchUpdateTasks: (
    taskIds: string[],
    action: 'delete' | 'set_priority' | 'move_folder' | 'archive',
    options?: { priority?: TaskPriority; projectFolder?: string }
  ) => Promise<void>;
  updateTaskPriority: (taskId: string, priority: TaskPriority) => void;
  updateTaskFocusTime: (taskId: string, additionalSeconds: number) => void;
  linkTaskDependency: (prereqTaskId: string, dependentTaskId: string) => boolean;
  autoClusterAllTasks: () => void;
  pomodoroActive: boolean;
  pomodoroSecondsLeft: number;
  pomodoroMode: 'focus' | 'break';
  togglePomodoro: () => void;
  resetPomodoro: (mode?: 'focus' | 'break') => void;
  blueprints: TaskBlueprint[];
  saveBlueprint: (name: string, description: string, category: TaskCategory, tasks: AgentTask[]) => Promise<TaskBlueprint>;
  instantiateBlueprintWorkflow: (blueprintId: string) => Promise<AgentTask[]>;
  deleteBlueprint: (blueprintId: string) => Promise<void>;
  communities: Community[];
  toggleJoinCommunity: (communityId: string) => void;
  stories: Story[];
  addStory: (caption: string, mediaUrl?: string) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  selectedArticle: Post | null;
  setSelectedArticle: (post: Post | null) => void;
  isNovaOpen: boolean;
  setIsNovaOpen: (open: boolean) => void;
  messages: DirectMessage[];
  sendMessage: (recipientId: string, content: string) => void;
  libraryItems: LibraryItem[];
  addBookmarkToLibrary: (post: Post, note?: string) => void;
  toggleReadLater: (post: Post) => boolean;
  isReadLater: (postId: string) => boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  focusedTaskId: string | null;
  setFocusedTaskId: (id: string | null) => void;
  focusedNodeId: string | null;
  setFocusedNodeId: (id: string | null) => void;
  isOnline: boolean;
  showShortcutsHelp: boolean;
  setShowShortcutsHelp: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => getInitialTheme());
  const [activeView, setActiveView] = useState<ActiveView>('feed');
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  // Online / Offline State
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showShortcutsHelp, setShowShortcutsHelp] = useState<boolean>(false);

  // Load from local storage cache with initial fallback
  const [posts, setPosts] = useState<Post[]>(() =>
    loadFromCache<Post[]>(CACHE_KEYS.POSTS, INITIAL_POSTS)
  );
  const [tasks, setTasks] = useState<AgentTask[]>(() => {
    const cached = loadFromCache<AgentTask[]>(CACHE_KEYS.TASKS, INITIAL_AGENT_TASKS);
    const seedMap = new Map(INITIAL_AGENT_TASKS.map((t) => [t.id, t]));
    return cached.map((t) => {
      const seed = seedMap.get(t.id);
      if (!seed) return t;
      return {
        ...t,
        subtasks: t.subtasks !== undefined ? t.subtasks : seed.subtasks,
        tags: t.tags !== undefined ? t.tags : seed.tags,
      };
    });
  });
  const [blueprints, setBlueprints] = useState<TaskBlueprint[]>(() =>
    loadFromCache<TaskBlueprint[]>(CACHE_KEYS.BLUEPRINTS, INITIAL_TASK_BLUEPRINTS)
  );
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [stories, setStories] = useState<Story[]>(() =>
    loadFromCache<Story[]>(CACHE_KEYS.STORIES, INITIAL_STORIES)
  );
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [messages, setMessages] = useState<DirectMessage[]>(() =>
    loadFromCache<DirectMessage[]>(CACHE_KEYS.MESSAGES, INITIAL_MESSAGES)
  );
  const [selectedArticle, setSelectedArticle] = useState<Post | null>(null);
  const [isNovaOpen, setIsNovaOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pomodoroActive, setPomodoroActive] = useState<boolean>(false);
  const [pomodoroMode, setPomodoroMode] = useState<'focus' | 'break'>('focus');
  const [pomodoroSecondsLeft, setPomodoroSecondsLeft] = useState<number>(25 * 60);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(() =>
    loadFromCache<LibraryItem[]>(CACHE_KEYS.LIBRARY, [
      {
        id: 'lib-1',
        userId: CURRENT_USER.id,
        postId: INITIAL_POSTS[0].id,
        post: INITIAL_POSTS[0],
        note: 'Crucial reference for multi-agent handoff contracts.',
        collection: 'Architecture',
        createdAt: '2026-11-08',
      },
    ])
  );

  // Sync theme classes on document.body & persist to localStorage
  useEffect(() => {
    applyThemeClasses(theme);
    saveThemePreference(theme);
  }, [theme]);

  // Register service worker and monitor network events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Service Worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('[Service Worker] Active on scope:', reg.scope))
        .catch((err) => console.warn('[Service Worker] Registration notice:', err));
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save changes to localStorage cache
  useEffect(() => {
    saveToCache(CACHE_KEYS.POSTS, posts);
  }, [posts]);

  useEffect(() => {
    saveToCache(CACHE_KEYS.LIBRARY, libraryItems);
  }, [libraryItems]);

  useEffect(() => {
    saveToCache(CACHE_KEYS.TASKS, tasks);
  }, [tasks]);

  useEffect(() => {
    saveToCache(CACHE_KEYS.BLUEPRINTS, blueprints);
  }, [blueprints]);

  useEffect(() => {
    saveToCache(CACHE_KEYS.STORIES, stories);
  }, [stories]);

  useEffect(() => {
    saveToCache(CACHE_KEYS.MESSAGES, messages);
  }, [messages]);

  // Initial backend hydration when online (merges server state cleanly with local cache)
  useEffect(() => {
    if (!isOnline) return;
    let cancelled = false;

    const hydrateFromServer = async () => {
      try {
        const [postsRes, tasksRes, commRes, msgRes] = await Promise.allSettled([
          fetch('/api/posts').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/agents/tasks').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/communities').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/messages').then((r) => (r.ok ? r.json() : null)),
        ]);

        if (cancelled) return;

        if (postsRes.status === 'fulfilled' && Array.isArray(postsRes.value?.posts)) {
          setPosts((prev) => {
            const byId = new Map(prev.map((p) => [p.id, p]));
            postsRes.value.posts.forEach((p: Post) => {
              if (!byId.has(p.id)) byId.set(p.id, p);
            });
            return Array.from(byId.values());
          });
        }

        if (tasksRes.status === 'fulfilled' && Array.isArray(tasksRes.value?.tasks)) {
          setTasks((prev) => {
            const byId = new Map(prev.map((t) => [t.id, t]));
            tasksRes.value.tasks.forEach((t: AgentTask) => {
              if (!byId.has(t.id)) byId.set(t.id, t);
            });
            return Array.from(byId.values());
          });
        }

        if (commRes.status === 'fulfilled' && Array.isArray(commRes.value?.communities)) {
          setCommunities(commRes.value.communities);
        }

        if (msgRes.status === 'fulfilled' && Array.isArray(msgRes.value?.messages)) {
          setMessages((prev) => {
            const seen = new Set(prev.map((m) => m.id));
            const merged = [...prev];
            msgRes.value.messages.forEach((m: DirectMessage) => {
              if (!seen.has(m.id)) merged.push(m);
            });
            return merged;
          });
        }
      } catch (err) {
        console.warn('Initial hydration notice:', err);
      }
    };

    void hydrateFromServer();
    return () => {
      cancelled = true;
    };
  }, [isOnline]);

  // Global Pomodoro Focus Timer Loop
  useEffect(() => {
    if (!pomodoroActive) return;
    const interval = setInterval(() => {
      setPomodoroSecondsLeft((prev) => {
        if (prev <= 1) {
          setPomodoroActive(false);
          const nextMode = pomodoroMode === 'focus' ? 'break' : 'focus';
          setPomodoroMode(nextMode);
          return nextMode === 'focus' ? 25 * 60 : 5 * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pomodoroActive, pomodoroMode]);

  const togglePomodoro = () => {
    setPomodoroActive((prev) => !prev);
  };

  const resetPomodoro = (mode?: 'focus' | 'break') => {
    const nextMode = mode || pomodoroMode;
    setPomodoroActive(false);
    setPomodoroMode(nextMode);
    setPomodoroSecondsLeft(nextMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  // Global Keyboard Shortcuts Manager
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable;

      const action = resolveKeyboardShortcut(e.key, e.ctrlKey, e.metaKey, !!isInput, e.shiftKey, e.altKey);
      if (!action) return;

      e.preventDefault();

      switch (action.type) {
        case 'NAVIGATE':
          setActiveView(action.view);
          break;
        case 'TOGGLE_NOVA':
          setIsNovaOpen((prev) => !prev);
          break;
        case 'TOGGLE_SEARCH': {
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          searchInput?.focus();
          break;
        }
        case 'TOGGLE_SHORTCUTS':
          setShowShortcutsHelp((prev) => !prev);
          break;
        case 'TOGGLE_THEME':
          toggleTheme();
          break;
        case 'TOGGLE_POMODORO':
          togglePomodoro();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addPost = async (newPostData: Partial<Post>): Promise<Post> => {
    if (!isOnline) {
      queueOfflineMutation({ type: 'CREATE_POST', payload: newPostData });
    } else {
      try {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPostData),
        });
        if (res.ok) {
          const data = await res.json();
          setPosts((prev) => [data.post, ...prev]);
          return data.post;
        }
      } catch (err) {
        console.warn('API post creation notice, caching locally:', err);
      }
    }

    // Local / Offline fallback creation
    const localPost: Post = {
      id: `post-${Date.now()}`,
      authorId: currentUser.id,
      author: currentUser,
      title: newPostData.title || 'Untitled Publication',
      slug: (newPostData.title || 'untitled').toLowerCase().replace(/\s+/g, '-'),
      content: newPostData.content || '',
      excerpt: (newPostData.content || '').slice(0, 160) + '...',
      coverImage:
        newPostData.coverImage ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      tags: newPostData.tags || ['Technology'],
      category: newPostData.category || 'Engineering',
      readingTime: 3,
      wordCount: 450,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      visibility: newPostData.visibility || 'public',
      likesCount: 0,
      commentsCount: 0,
      bookmarksCount: 0,
      viewsCount: 1,
      isLiked: false,
      isBookmarked: false,
    };
    setPosts((prev) => [localPost, ...prev]);
    return localPost;
  };

  const toggleLikePost = async (postId: string) => {
    if (!isOnline) {
      queueOfflineMutation({ type: 'LIKE_POST', payload: { postId } });
    } else {
      try {
        await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      } catch (err) {
        queueOfflineMutation({ type: 'LIKE_POST', payload: { postId } });
      }
    }
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.isLiked;
          return {
            ...p,
            isLiked: nextLiked,
            likesCount: Math.max(0, p.likesCount + (nextLiked ? 1 : -1)),
          };
        }
        return p;
      })
    );
  };

  const toggleBookmarkPost = async (postId: string) => {
    if (!isOnline) {
      queueOfflineMutation({ type: 'BOOKMARK_POST', payload: { postId } });
    } else {
      try {
        await fetch(`/api/posts/${postId}/bookmark`, { method: 'POST' });
      } catch (err) {
        queueOfflineMutation({ type: 'BOOKMARK_POST', payload: { postId } });
      }
    }
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextBookmarked = !p.isBookmarked;
          if (nextBookmarked) {
            addBookmarkToLibrary(p);
          }
          return {
            ...p,
            isBookmarked: nextBookmarked,
            bookmarksCount: Math.max(0, p.bookmarksCount + (nextBookmarked ? 1 : -1)),
          };
        }
        return p;
      })
    );
  };

  const createTask = async (
    title: string,
    prompt: string,
    priority?: TaskPriority,
    category?: TaskCategory,
    recurrence?: RecurrenceFrequency,
    blockedByTaskIds?: string[],
    collaborators?: TaskCollaborator[],
    subtasks?: TaskSubtask[],
    tags?: string[],
    projectFolder?: string,
    dueDate?: string
  ): Promise<AgentTask> => {
    const assignedPriority = priority || 'medium';
    const assignedCategory = category || 'work';
    const inferredMood = analyzeTaskSentiment(title, prompt, assignedPriority);

    try {
      const res = await fetch('/api/agents/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          prompt,
          priority: assignedPriority,
          category: assignedCategory,
          recurrence,
          blockedByTaskIds,
          collaborators,
          subtasks,
          tags,
          projectFolder,
          dueDate,
          sentimentMood: inferredMood,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const finalTask: AgentTask = {
          ...data.task,
          sentimentMood: data.task.sentimentMood || inferredMood,
          subtasks: subtasks || data.task.subtasks || [],
          tags: tags || data.task.tags || [],
          projectFolder: projectFolder || data.task.projectFolder,
          dueDate: dueDate || data.task.dueDate,
        };
        setTasks((prev) => [finalTask, ...prev]);

        // Non-blocking Gemini sentiment mood refinement
        fetch('/api/ai/analyze-task-sentiment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, prompt, priority: assignedPriority }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((aiData) => {
            if (aiData?.mood && aiData.mood !== finalTask.sentimentMood) {
              setTasks((prev) =>
                prev.map((t) => (t.id === finalTask.id ? { ...t, sentimentMood: aiData.mood } : t))
              );
              fetch(`/api/agents/tasks/${finalTask.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sentimentMood: aiData.mood }),
              }).catch(() => {});
            }
          })
          .catch(() => {});

        return finalTask;
      }
    } catch (err) {
      console.warn('Task creation API notice:', err);
    }

    const localTask: AgentTask = {
      id: `task-${Date.now()}`,
      title,
      prompt,
      status: 'pending',
      priority: assignedPriority,
      category: assignedCategory,
      recurrence: recurrence || 'none',
      dueDate: dueDate || undefined,
      blockedByTaskIds: blockedByTaskIds || [],
      collaborators: collaborators || [],
      assignees: collaborators || [],
      subtasks: subtasks || [],
      tags: tags || [],
      projectFolder: projectFolder,
      sentimentMood: inferredMood,
      orderIndex: 0,
      activeAgent: 'planner',
      creatorId: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      retryCount: 0,
      approvalRequired: true,
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          agent: 'orchestrator',
          action: 'TASK_CREATED',
          details: `Task initialized: "${title}". Awaiting PLANNER dispatch. Category: ${assignedCategory}. Priority: ${assignedPriority}.${recurrence && recurrence !== 'none' ? ` Recurrence: ${recurrence}.` : ''}`,
          status: 'info',
        },
      ],
    };
    setTasks((prev) => [localTask, ...prev]);
    return localTask;
  };

  const advanceTaskStep = async (taskId: string) => {
    try {
      const res = await fetch(`/api/agents/tasks/${taskId}/step`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  ...data.task,
                  subtasks: t.subtasks ?? data.task.subtasks,
                  tags: t.tags ?? data.task.tags,
                  projectFolder: t.projectFolder ?? data.task.projectFolder,
                  focusTimeSeconds: t.focusTimeSeconds ?? data.task.focusTimeSeconds,
                }
              : t
          )
        );
        return;
      }
    } catch (err) {
      console.warn('Advance task API notice:', err);
    }
  };

  const approveTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/agents/tasks/${taskId}/approve`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => {
          const updated = prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  ...data.task,
                  subtasks: t.subtasks ?? data.task.subtasks,
                  tags: t.tags ?? data.task.tags,
                  projectFolder: t.projectFolder ?? data.task.projectFolder,
                  focusTimeSeconds: t.focusTimeSeconds ?? data.task.focusTimeSeconds,
                }
              : t
          );
          if (data.regeneratedTask) {
            const exists = updated.some((t) => t.id === data.regeneratedTask.id);
            return exists ? updated : [data.regeneratedTask, ...updated];
          }
          return updated;
        });
        if (data.regeneratedTask) {
          persistRecurringTaskToFirestore(data.regeneratedTask);
        }
        return;
      }
    } catch (err) {
      console.warn('Approve task API notice:', err);
    }

    // Offline / fallback completion and recurring regeneration
    const targetTask = tasks.find((t) => t.id === taskId);
    if (targetTask) {
      const completedTask: AgentTask = {
        ...targetTask,
        status: 'completed',
        completedAt: new Date().toISOString(),
        approvedBy: currentUser.name,
        updatedAt: new Date().toISOString(),
      };

      const regenerated = regenerateRecurringTask(completedTask);
      if (regenerated) {
        persistRecurringTaskToFirestore(regenerated);
        setTasks((prev) => [regenerated, ...prev.map((t) => (t.id === taskId ? completedTask : t))]);
      } else {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? completedTask : t)));
      }
    }
  };

  const reorderTasks = async (orderedIds: string[]) => {
    // Optimistic local state update
    setTasks((prev) => {
      const taskMap = new Map(prev.map((t) => [t.id, t]));
      const nextList: AgentTask[] = [];
      orderedIds.forEach((id, index) => {
        const t = taskMap.get(id);
        if (t) {
          nextList.push({ ...t, orderIndex: index });
          taskMap.delete(id);
        }
      });
      taskMap.forEach((t) => nextList.push(t));
      return nextList;
    });

    try {
      await fetch('/api/agents/tasks/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });
    } catch (e) {
      console.warn('Task reorder sync notice:', e);
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              updatedAt: new Date().toISOString(),
              logs: [
                {
                  id: `log-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  agent: 'orchestrator',
                  action: 'STATUS_CHANGED',
                  details: `Status transitioned to "${status}" via drag-and-drop.`,
                  status: 'info',
                },
                ...t.logs,
              ],
            }
          : t
      )
    );

    try {
      await fetch(`/api/agents/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.warn('Task status update notice:', e);
    }
  };

  const rejectTask = async (taskId: string, reason?: string) => {
    try {
      const res = await fetch(`/api/agents/tasks/${taskId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
        return;
      }
    } catch (err) {
      console.warn('Reject task API notice:', err);
    }
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: 'building', activeAgent: 'builder', retryCount: t.retryCount + 1 } : t
      )
    );
  };

  const addCollaboratorToTask = async (taskId: string, collaborator: TaskCollaborator) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const currentList = getTaskCollaborators(t);
        const updated = addCollaborator(currentList, collaborator);
        return {
          ...t,
          collaborators: updated,
          assignees: updated,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    try {
      await fetch(`/api/agents/tasks/${taskId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collaborator }),
      });
    } catch (e) {
      console.warn('Add collaborator notice:', e);
    }
  };

  const removeCollaboratorFromTask = async (taskId: string, collaboratorId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const currentList = getTaskCollaborators(t);
        const updated = removeCollaborator(currentList, collaboratorId);
        return {
          ...t,
          collaborators: updated,
          assignees: updated,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    try {
      await fetch(`/api/agents/tasks/${taskId}/collaborators/${collaboratorId}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Remove collaborator notice:', e);
    }
  };

  const addSubtask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    const newSubtask: TaskSubtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), newSubtask] } : t))
    );

    fetch(`/api/agents/tasks/${taskId}/subtasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newSubtask.title }),
    }).catch((err) => console.warn('Add subtask sync notice:', err));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    let nextCompleted = false;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId || !t.subtasks) return t;
        return {
          ...t,
          subtasks: t.subtasks.map((st) => {
            if (st.id === subtaskId) {
              nextCompleted = !st.completed;
              return { ...st, completed: nextCompleted };
            }
            return st;
          }),
        };
      })
    );

    fetch(`/api/agents/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: nextCompleted }),
    }).catch((err) => console.warn('Toggle subtask sync notice:', err));
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId || !t.subtasks) return t;
        return {
          ...t,
          subtasks: t.subtasks.filter((st) => st.id !== subtaskId),
        };
      })
    );

    fetch(`/api/agents/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'DELETE',
    }).catch((err) => console.warn('Delete subtask sync notice:', err));
  };

  const archiveTask = (taskId: string, archived: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, archived, updatedAt: new Date().toISOString() } : t))
    );

    fetch(`/api/agents/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived }),
    }).catch((err) => console.warn('Archive task sync notice:', err));
  };

  const deleteTask = async (taskId: string) => {
    setTasks((prev) =>
      prev
        .filter((t) => t.id !== taskId)
        .map((t) =>
          t.blockedByTaskIds?.includes(taskId)
            ? { ...t, blockedByTaskIds: t.blockedByTaskIds.filter((id) => id !== taskId) }
            : t
        )
    );

    try {
      await fetch(`/api/agents/tasks/${taskId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Delete task sync notice:', err);
    }
  };

  const batchUpdateTasks = async (
    taskIds: string[],
    action: 'delete' | 'set_priority' | 'move_folder' | 'archive',
    options?: { priority?: TaskPriority; projectFolder?: string }
  ) => {
    if (!taskIds.length) return;
    const idSet = new Set(taskIds);
    const now = new Date().toISOString();

    if (action === 'delete') {
      setTasks((prev) =>
        prev
          .filter((t) => !idSet.has(t.id))
          .map((t) =>
            t.blockedByTaskIds
              ? { ...t, blockedByTaskIds: t.blockedByTaskIds.filter((id) => !idSet.has(id)) }
              : t
          )
      );
    } else {
      setTasks((prev) =>
        prev.map((t) => {
          if (!idSet.has(t.id)) return t;
          if (action === 'set_priority' && options?.priority) {
            return { ...t, priority: options.priority, updatedAt: now };
          }
          if (action === 'move_folder' && options?.projectFolder) {
            return { ...t, projectFolder: options.projectFolder, updatedAt: now };
          }
          if (action === 'archive') {
            return { ...t, archived: true, updatedAt: now };
          }
          return t;
        })
      );
    }

    try {
      await fetch('/api/agents/tasks/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskIds,
          action,
          priority: options?.priority,
          projectFolder: options?.projectFolder,
        }),
      });
    } catch (err) {
      console.warn('Batch update sync notice:', err);
    }
  };

  const updateTaskPriority = (taskId: string, priority: TaskPriority) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, priority, updatedAt: new Date().toISOString() } : t))
    );

    fetch(`/api/agents/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority }),
    }).catch((err) => console.warn('Update priority sync notice:', err));
  };

  const updateTaskFocusTime = (taskId: string, additionalSeconds: number) => {
    if (!additionalSeconds || additionalSeconds <= 0) return;
    let nextFocusTotal = additionalSeconds;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        nextFocusTotal = (t.focusTimeSeconds || 0) + additionalSeconds;
        return {
          ...t,
          focusTimeSeconds: nextFocusTotal,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    fetch(`/api/agents/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ focusTimeSeconds: nextFocusTotal }),
    }).catch((err) => console.warn('Update focus time sync notice:', err));
  };

  const linkTaskDependency = (prereqTaskId: string, dependentTaskId: string): boolean => {
    if (wouldCreateDependencyCycle(tasks, prereqTaskId, dependentTaskId)) {
      return false;
    }

    const target = tasks.find((t) => t.id === dependentTaskId);
    const currentBlocked = target?.blockedByTaskIds || [];
    if (currentBlocked.includes(prereqTaskId)) return true;
    const nextBlocked = [...currentBlocked, prereqTaskId];

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== dependentTaskId) return t;
        if (wouldCreateDependencyCycle(prev, prereqTaskId, dependentTaskId)) return t;
        const existing = t.blockedByTaskIds || [];
        if (existing.includes(prereqTaskId)) return t;
        return {
          ...t,
          blockedByTaskIds: [...existing, prereqTaskId],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    fetch(`/api/agents/tasks/${dependentTaskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockedByTaskIds: nextBlocked }),
    }).catch((err) => console.warn('Link dependency sync notice:', err));

    return true;
  };

  const autoClusterAllTasks = () => {
    setTasks((prev) => {
      const clustered = autoClusterTasks(prev);
      clustered.forEach((t, idx) => {
        if (t.projectFolder && t.projectFolder !== prev[idx]?.projectFolder) {
          fetch(`/api/agents/tasks/${t.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectFolder: t.projectFolder }),
          }).catch(() => {});
        }
      });
      return clustered;
    });
  };

  const saveBlueprint = async (
    name: string,
    description: string,
    category: TaskCategory,
    blueprintTasks: AgentTask[]
  ): Promise<TaskBlueprint> => {
    const generated = createBlueprintFromTasks(
      name,
      description,
      category,
      blueprintTasks,
      currentUser.name,
      currentUser.id
    );

    try {
      const res = await fetch('/api/agents/blueprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generated),
      });
      if (res.ok) {
        const data = await res.json();
        setBlueprints((prev) => [data.blueprint, ...prev]);
        return data.blueprint;
      }
    } catch (err) {
      console.warn('Save blueprint API notice:', err);
    }

    setBlueprints((prev) => [generated, ...prev]);
    return generated;
  };

  const instantiateBlueprintWorkflow = async (blueprintId: string): Promise<AgentTask[]> => {
    try {
      const res = await fetch(`/api/agents/blueprints/${blueprintId}/instantiate`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.createdTasks) && data.createdTasks.length > 0) {
          setTasks((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const fresh = data.createdTasks.filter((t: AgentTask) => !existingIds.has(t.id));
            return [...fresh, ...prev];
          });
          return data.createdTasks;
        }
      }
    } catch (err) {
      console.warn('Instantiate blueprint API notice:', err);
    }

    const bp =
      blueprints.find((b) => b.id === blueprintId) ||
      INITIAL_TASK_BLUEPRINTS.find((b) => b.id === blueprintId);
    if (!bp) return [];

    const instantiated = instantiateBlueprint(bp, currentUser.id);
    setTasks((prev) => [...instantiated, ...prev]);
    return instantiated;
  };

  const deleteBlueprint = async (blueprintId: string): Promise<void> => {
    try {
      await fetch(`/api/agents/blueprints/${blueprintId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Delete blueprint API notice:', err);
    }
    setBlueprints((prev) => prev.filter((b) => b.id !== blueprintId));
  };

  const toggleJoinCommunity = (communityId: string) => {
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === communityId) {
          const nextJoined = !c.isJoined;
          return {
            ...c,
            isJoined: nextJoined,
            membersCount: Math.max(0, c.membersCount + (nextJoined ? 1 : -1)),
          };
        }
        return c;
      })
    );

    fetch(`/api/communities/${communityId}/join`, { method: 'POST' }).catch((err) =>
      console.warn('Community join sync notice:', err)
    );
  };

  const addStory = (caption: string, mediaUrl?: string) => {
    const newStory: Story = {
      id: `story-${Date.now()}`,
      authorId: currentUser.id,
      author: currentUser,
      mediaUrl:
        mediaUrl ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      type: mediaUrl ? 'image' : 'text',
      caption,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
      viewsCount: 1,
    };
    setStories((prev) => [newStory, ...prev]);

    fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption, mediaUrl, type: mediaUrl ? 'image' : 'text' }),
    }).catch((err) => console.warn('Story sync notice:', err));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const sendMessage = (recipientId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      conversationId: `conv-${recipientId}`,
      senderId: currentUser.id,
      recipientId,
      content: trimmed,
      createdAt: 'Just now',
      read: true,
    };
    setMessages((prev) => [...prev, newMsg]);

    if (isOnline) {
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: currentUser.id, recipientId, content: trimmed }),
      }).catch((err) => console.warn('Message sync notice:', err));
    }

    setTimeout(() => {
      const replyContent = `Got it! I will review the architecture notes and test suite in NEXUS CORE shortly.`;
      const replyMsg: DirectMessage = {
        id: `msg-${Date.now() + 1}`,
        conversationId: `conv-${recipientId}`,
        senderId: recipientId,
        recipientId: currentUser.id,
        content: replyContent,
        createdAt: 'Just now',
        read: false,
      };
      setMessages((prev) => [...prev, replyMsg]);

      if (isOnline) {
        fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderId: recipientId, recipientId: currentUser.id, content: replyContent }),
        }).catch(() => {});
      }
    }, 1200);
  };

  const addBookmarkToLibrary = (post: Post, note?: string) => {
    const newItem: LibraryItem = {
      id: `lib-${Date.now()}`,
      userId: currentUser.id,
      postId: post.id,
      post,
      note: note || 'Saved from social publishing feed',
      collection: post.category || 'General',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setLibraryItems((prev) => [newItem, ...prev.filter((item) => item.postId !== post.id)]);
  };

  const toggleReadLater = (post: Post): boolean => {
    const { updatedItems, isSaved } = toggleReadLaterItem(libraryItems, post, currentUser.id);
    setLibraryItems(updatedItems);
    saveToCache(CACHE_KEYS.LIBRARY, updatedItems);

    // Ensure the post is also saved in local posts cache for offline access
    setPosts((prevPosts) => {
      if (!prevPosts.some((p) => p.id === post.id)) {
        const next = [post, ...prevPosts];
        saveToCache(CACHE_KEYS.POSTS, next);
        return next;
      }
      return prevPosts;
    });

    return isSaved;
  };

  const isReadLater = (postId: string): boolean => {
    return isPostInReadLater(libraryItems, postId);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        theme,
        toggleTheme,
        activeView,
        setActiveView,
        posts,
        addPost,
        toggleLikePost,
        toggleBookmarkPost,
        tasks,
        createTask,
        advanceTaskStep,
        approveTask,
        rejectTask,
        reorderTasks,
        updateTaskStatus,
        addCollaboratorToTask,
        removeCollaboratorFromTask,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        archiveTask,
        deleteTask,
        batchUpdateTasks,
        updateTaskPriority,
        updateTaskFocusTime,
        linkTaskDependency,
        autoClusterAllTasks,
        pomodoroActive,
        pomodoroSecondsLeft,
        pomodoroMode,
        togglePomodoro,
        resetPomodoro,
        blueprints,
        saveBlueprint,
        instantiateBlueprintWorkflow,
        deleteBlueprint,
        communities,
        toggleJoinCommunity,
        stories,
        addStory,
        notifications,
        markNotificationRead,
        selectedArticle,
        setSelectedArticle,
        isNovaOpen,
        setIsNovaOpen,
        messages,
        sendMessage,
        libraryItems,
        addBookmarkToLibrary,
        toggleReadLater,
        isReadLater,
        searchQuery,
        setSearchQuery,
        focusedTaskId,
        setFocusedTaskId,
        focusedNodeId,
        setFocusedNodeId,
        isOnline,
        showShortcutsHelp,
        setShowShortcutsHelp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
