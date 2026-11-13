import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AgentTask,
  AgentType,
  TaskStatus,
  TaskCategory,
  RecurrenceFrequency,
  TaskPriority,
} from '../../types';
import confetti from 'canvas-confetti';
import {
  Cpu,
  Brain,
  Palette,
  Hammer,
  ShieldAlert,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Plus,
  Terminal,
  Clock,
  ArrowRight,
  Layers,
  FileCode,
  Check,
  X,
  Eye,
  Sliders,
  FileText,
  Share2,
  Lock,
  Unlock,
  GripVertical,
  Briefcase,
  Sparkles,
  Search,
  User,
  Kanban,
  Calendar,
  Flame,
  Timer,
  LayoutGrid,
  Mic,
  Square,
  BookmarkCheck,
  Loader2,
  Download,
  Volume2,
  VolumeX,
  Folder,
  Tag,
  Archive,
  Filter,
  CheckSquare,
  SquareCheck,
  UserPlus,
  ArrowDown,
  Zap,
  FileSpreadsheet,
  GitFork,
  Trash2,
  ListChecks,
} from 'lucide-react';
import { ShareTaskModal } from './ShareTaskModal';
import { TaskTimelineView } from './TaskTimelineView';
import { TaskKanbanBoard } from './TaskKanbanBoard';
import { PomodoroFocusTimer } from './PomodoroFocusTimer';
import { TaskTemplatesModal } from './TaskTemplatesModal';
import { NexusFlowVisualizer } from './NexusFlowVisualizer';
import { SubtaskProgressRing } from './SubtaskProgressRing';
import { isTaskBlocked, formatBlockingPrerequisites } from '../../utils/taskDependencies';
import { blobToBase64, parseVoiceTaskMemo } from '../../utils/voiceTranscription';
import {
  DEFAULT_TEAM_COLLABORATORS,
  getTaskCollaborators,
  formatCollaboratorsSummary,
} from '../../utils/taskCollaborators';
import { triggerTaskBackup } from '../../utils/taskExport';
import {
  smartSortTasks,
  parseNaturalLanguageDeadline,
  autoClusterTasks,
  getDailyDigestTasks,
  buildFocusBlockInsights,
} from '../../utils/taskClustering';
import { ambientEngine, AmbientSoundType } from '../../utils/ambientAudio';
import { generateInitialsAvatarDataUri } from '../../utils/subtaskProgress';
import { TaskCollaborator, TaskSubtask } from '../../types';

const AGENT_META: Record<
  AgentType,
  { name: string; title: string; color: string; bg: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  planner: {
    name: 'PLANNER',
    title: 'The Strategic Brain',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: Brain,
  },
  designer: {
    name: 'DESIGNER',
    title: 'The Creative Intelligence',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    icon: Palette,
  },
  builder: {
    name: 'BUILDER',
    title: 'The Engineering Intelligence',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    icon: Hammer,
  },
  tester: {
    name: 'TESTER',
    title: 'The Quality Guardian',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: ShieldAlert,
  },
};

export const CATEGORY_META: Record<
  TaskCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; border: string; bg: string }
> = {
  work: { label: 'Work', icon: Briefcase, color: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/10' },
  creative: { label: 'Creative', icon: Sparkles, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
  engineering: { label: 'Engineering', icon: Terminal, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  research: { label: 'Research', icon: Search, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  personal: { label: 'Personal', icon: User, color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10' },
};

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; badge: string; dot: string; buttonActive: string; icon: React.ComponentType<{ className?: string }> }
> = {
  critical: {
    label: 'CRITICAL',
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    dot: 'bg-purple-400',
    buttonActive: 'bg-purple-500/20 border-purple-500/60 text-purple-200',
    icon: Flame,
  },
  high: {
    label: 'HIGH',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    dot: 'bg-rose-400',
    buttonActive: 'bg-rose-500/20 border-rose-500/60 text-rose-200',
    icon: Flame,
  },
  medium: {
    label: 'MEDIUM',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400',
    buttonActive: 'bg-amber-500/20 border-amber-500/60 text-amber-200',
    icon: Zap,
  },
  low: {
    label: 'LOW',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
    buttonActive: 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200',
    icon: ArrowDown,
  },
};

const STAGES: { key: TaskStatus; label: string; agent: AgentType }[] = [
  { key: 'planning', label: '1. Strategic Planning', agent: 'planner' },
  { key: 'designing', label: '2. UI/UX Design System', agent: 'designer' },
  { key: 'building', label: '3. Engineering Implementation', agent: 'builder' },
  { key: 'testing', label: '4. Automated Verification', agent: 'tester' },
  { key: 'awaiting_approval', label: '5. Human Creator Approval', agent: 'tester' },
  { key: 'completed', label: '6. Production Release', agent: 'tester' },
];

export function NexusCoreView() {
  const {
    tasks,
    blueprints,
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
  } = useApp();

  const [viewMode, setViewMode] = useState<'pipeline' | 'kanban' | 'timeline' | 'flow'>('pipeline');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.id || '');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [batchFolderTarget, setBatchFolderTarget] = useState<string>('Architecture & Systems Core');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBlueprintsModal, setShowBlueprintsModal] = useState(false);
  const [showInsightsPanel, setShowInsightsPanel] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [newTitle, setNewTitle] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('high');
  const [newCategory, setNewCategory] = useState<TaskCategory>('engineering');
  const [newRecurrence, setNewRecurrence] = useState<RecurrenceFrequency>('none');
  const [newBlockedByIds, setNewBlockedByIds] = useState<string[]>([]);
  const [newSelectedCollaborators, setNewSelectedCollaborators] = useState<TaskCollaborator[]>([]);
  const [newSubtasks, setNewSubtasks] = useState<TaskSubtask[]>([]);
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'subtasks' | 'collaborators' | 'artifacts' | 'logs'>('overview');
  const [isProcessingStep, setIsProcessingStep] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Search & Filter state
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | TaskCategory>('all');
  const [showArchived, setShowArchived] = useState(false);
  const todayDigestKey = `inkwave_daily_digest_dismissed_${new Date().toISOString().slice(0, 10)}`;
  const [showDailyDigest, setShowDailyDigest] = useState<boolean>(() => {
    try {
      return localStorage.getItem(todayDigestKey) !== '1';
    } catch {
      return true;
    }
  });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [backupToast, setBackupToast] = useState<string | null>(null);

  // Subtask & Collaborator in-detail state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAddCollaboratorDropdown, setShowAddCollaboratorDropdown] = useState(false);
  const [customCollaboratorName, setCustomCollaboratorName] = useState('');
  const [customCollaboratorEmail, setCustomCollaboratorEmail] = useState('');

  // Ambient Noise state
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('off');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.35);

  React.useEffect(() => {
    return () => {
      ambientEngine.stop();
    };
  }, []);

  // Voice-to-Text recording states
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isTranscribingVoice, setIsTranscribingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const startVoiceRecording = async () => {
    setVoiceError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API is not supported in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleProcessVoiceAudio(audioBlob);
      };

      mediaRecorder.start(250);
      setIsRecordingVoice(true);
      setRecordingDuration(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Voice recording initialization notice:', err);
      setVoiceError(err?.message || 'Microphone hardware unavailable. Simulation fallback ready.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecordingVoice(false);
  };

  const handleProcessVoiceAudio = async (audioBlob: Blob) => {
    setIsTranscribingVoice(true);
    try {
      const base64Data = await blobToBase64(audioBlob);
      const res = await fetch('/api/ai/transcribe-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioData: base64Data, mimeType: 'audio/webm' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.title) setNewTitle(data.title);
        if (data.prompt) setNewPrompt(data.prompt);
        return;
      }
    } catch (err) {
      console.warn('Voice transcription API notice:', err);
    } finally {
      setIsTranscribingVoice(false);
    }

    const fallbackParsed = parseVoiceTaskMemo(
      'Autonomous Vector Memory Cache. Build a high-throughput in-memory LRU vector cache for multi-agent handoffs.'
    );
    setNewTitle(fallbackParsed.title);
    setNewPrompt(fallbackParsed.prompt);
    setIsTranscribingVoice(false);
  };

  const handleSimulateVoiceInput = () => {
    const sampleMemos = [
      'Title: Dynamic Topic Ranking Weight Sliders. Objective: Provide interactive creator sliders to tune feed ranking balance between recency, topic relevance, and engagement.',
      'Implement cryptographic author attestations. Verify zero-knowledge signatures for published articles to attest to author publishing provenance and integrity.',
      'Design fluid reader scale with adaptive kerning. Support WCAG AA contrast ratios and variable font sizes across deep space dark and sepia modes.',
      'Formulate OpenAPI specification. Build modular REST endpoints and idempotent error handling contracts for distributed services.',
    ];
    const chosen = sampleMemos[Math.floor(Math.random() * sampleMemos.length)];
    const parsed = parseVoiceTaskMemo(chosen);
    setNewTitle(parsed.title);
    setNewPrompt(parsed.prompt);
  };

  // Natural Language Deadline Parsing in Title or Prompt input
  const handleParseNaturalLanguage = () => {
    const parsedFromTitle = parseNaturalLanguageDeadline(newTitle);
    if (parsedFromTitle.dueDate) {
      setNewTitle(parsedFromTitle.cleanedText);
      setNewDueDate(parsedFromTitle.dueDate);
      return;
    }
    const parsedFromPrompt = parseNaturalLanguageDeadline(newPrompt);
    if (parsedFromPrompt.dueDate) {
      setNewPrompt(parsedFromPrompt.cleanedText);
      setNewDueDate(parsedFromPrompt.dueDate);
    }
  };

  // Ambient sound controller
  const handleAmbientSoundChange = (sound: AmbientSoundType) => {
    setAmbientSound(sound);
    ambientEngine.setSound(sound);
  };

  const handleAmbientVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    ambientEngine.setVolume(vol);
  };

  // AI Smart Sort handler
  const handleSmartSort = () => {
    const sorted = smartSortTasks(tasks);
    reorderTasks(sorted.map((t) => t.id));
    setBackupToast('Re-ordered tasks by AI Smart Sort (urgency & priority weighting)');
    setTimeout(() => setBackupToast(null), 3000);
  };

  // Export tasks backup handler
  const handleTriggerExport = (format: 'json' | 'csv') => {
    const result = triggerTaskBackup(tasks, format);
    setShowExportMenu(false);
    setBackupToast(`Downloaded ${result.filename} (${result.count} tasks backed up)`);
    setTimeout(() => setBackupToast(null), 3500);
  };

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];
  const selectedTaskBlockCheck = selectedTask ? isTaskBlocked(selectedTask, tasks) : { isBlocked: false, blockingTasks: [] };
  const selectedTaskCollaborators = selectedTask ? getTaskCollaborators(selectedTask) : [];

  // Filtered task collection based on search and filters
  const displayedTasks = tasks.filter((task) => {
    if (showArchived) {
      if (!task.archived) return false;
    } else {
      if (task.archived) return false;
    }

    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

    if (!taskSearchQuery.trim()) return true;
    const q = taskSearchQuery.toLowerCase();
    const collabs = getTaskCollaborators(task);
    return (
      task.title.toLowerCase().includes(q) ||
      task.prompt.toLowerCase().includes(q) ||
      (task.category && task.category.toLowerCase().includes(q)) ||
      (task.projectFolder && task.projectFolder.toLowerCase().includes(q)) ||
      (task.tags && task.tags.some((tag) => tag.toLowerCase().includes(q))) ||
      collabs.some((c) => c.name.toLowerCase().includes(q) || (c.email && c.email.toLowerCase().includes(q)))
    );
  });

  const unfinishedHighPriorityTasks = getDailyDigestTasks(tasks);
  const focusInsights = buildFocusBlockInsights(tasks);
  const activeNonArchivedTasks = tasks.filter((t) => !t.archived);

  const handleDismissDailyDigest = () => {
    setShowDailyDigest(false);
    try {
      localStorage.setItem(todayDigestKey, '1');
    } catch {
      // ignore storage quota errors
    }
  };

  const handleToggleSelectTask = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleApplyBlueprintTemplate = (blueprintId: string) => {
    setSelectedTemplateId(blueprintId);
    const bp = blueprints.find((b) => b.id === blueprintId);
    if (!bp) {
      setNewSubtasks([]);
      return;
    }
    const leadItem = bp.tasks[0];
    setNewTitle(bp.name);
    setNewPrompt(bp.description);
    setNewCategory(bp.category);
    if (leadItem) {
      setNewPriority(leadItem.priority);
      setNewRecurrence(leadItem.recurrence || 'none');
    }
    setNewTags([bp.category, 'blueprint']);
    setNewSubtasks(
      bp.tasks.map((item, idx) => ({
        id: `sub-tpl-${Date.now()}-${idx}`,
        title: item.title,
        completed: false,
      }))
    );
  };

  const handleBatchOperation = async (
    action: 'delete' | 'set_priority' | 'move_folder' | 'archive',
    options?: { priority?: TaskPriority; projectFolder?: string }
  ) => {
    if (selectedTaskIds.length === 0) return;
    const count = selectedTaskIds.length;
    await batchUpdateTasks(selectedTaskIds, action, options);
    if (action === 'delete') {
      setSelectedTaskIds([]);
      setBackupToast(`Deleted ${count} selected task(s)`);
    } else if (action === 'set_priority' && options?.priority) {
      setBackupToast(`Updated ${count} task(s) to ${options.priority.toUpperCase()} priority`);
    } else if (action === 'move_folder' && options?.projectFolder) {
      setBackupToast(`Moved ${count} task(s) into "${options.projectFolder}"`);
    } else if (action === 'archive') {
      setSelectedTaskIds([]);
      setBackupToast(`Archived ${count} selected task(s)`);
    }
    setTimeout(() => setBackupToast(null), 3200);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrompt.trim()) return;

    const created = await createTask(
      newTitle,
      newPrompt,
      newPriority,
      newCategory,
      newRecurrence,
      newBlockedByIds,
      newSelectedCollaborators,
      newSubtasks,
      newTags,
      undefined,
      newDueDate || undefined
    );

    setSelectedTaskId(created.id);
    setSelectedTemplateId('');
    setNewTitle('');
    setNewPrompt('');
    setNewBlockedByIds([]);
    setNewSelectedCollaborators([]);
    setNewSubtasks([]);
    setNewTags([]);
    setNewTagInput('');
    setNewDueDate('');
    setShowCreateModal(false);
  };

  const handleAdvanceStep = async () => {
    if (!selectedTask || isProcessingStep || selectedTaskBlockCheck.isBlocked) return;
    setIsProcessingStep(true);
    try {
      await advanceTaskStep(selectedTask.id);
    } finally {
      setIsProcessingStep(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedTask) return;
    await approveTask(selectedTask.id);
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  };

  const handleReject = async () => {
    if (!selectedTask) return;
    await rejectTask(selectedTask.id, rejectionFeedback || 'Refinement requested on implementation details.');
    setRejectionFeedback('');
  };

  const handleUpdateFocusTime = (taskId: string, additionalSeconds: number) => {
    updateTaskFocusTime(taskId, additionalSeconds);
  };

  // Drag and drop reordering within the task list
  const handleTaskListDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleTaskListDrop = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!sourceId || sourceId === targetTaskId) return;

    const currentIds = tasks.map((t) => t.id);
    const sourceIdx = currentIds.indexOf(sourceId);
    const targetIdx = currentIds.indexOf(targetTaskId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const reordered = [...currentIds];
      reordered.splice(sourceIdx, 1);
      reordered.splice(targetIdx, 0, sourceId);
      reorderTasks(reordered);
    }
    setDraggedTaskId(null);
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newSubtaskTitle.trim()) return;
    addSubtask(selectedTask.id, newSubtaskTitle);
    setNewSubtaskTitle('');
  };

  const handleAddTeamCollaborator = (member: TaskCollaborator) => {
    if (!selectedTask) return;
    addCollaboratorToTask(selectedTask.id, member);
    setShowAddCollaboratorDropdown(false);
  };

  const handleAddCustomCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !customCollaboratorName.trim()) return;
    const customCollab: TaskCollaborator = {
      id: `custom-${Date.now()}`,
      name: customCollaboratorName.trim(),
      email: customCollaboratorEmail.trim() || undefined,
      avatar: generateInitialsAvatarDataUri(customCollaboratorName.trim()),
      role: 'contributor',
      assignedAt: new Date().toISOString(),
    };
    addCollaboratorToTask(selectedTask.id, customCollab);
    setCustomCollaboratorName('');
    setCustomCollaboratorEmail('');
    setShowAddCollaboratorDropdown(false);
  };

  // Quick preset loader
  const loadPreset = (title: string, prompt: string, category: TaskCategory, priority: TaskPriority) => {
    setNewTitle(title);
    setNewPrompt(prompt);
    setNewCategory(category);
    setNewPriority(priority);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 glass-panel border border-[var(--border-color)] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> NEXUS CORE
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">Autonomous Multi-Agent Mesh</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              Agent Orchestration Command Centre
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
              NEXUS CORE coordinates four specialized autonomous intelligences—Planner, Designer, Builder, and
              Tester—to transform natural-language objectives into verified production deliverables.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl glass-panel hover:bg-white/10 text-sky-300 border border-sky-500/30 font-semibold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02]"
                title="Export current tasks data backup"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>Export Backup</span>
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl glass-panel border border-[var(--border-color)] shadow-2xl p-2 z-50 animate-in fade-in bg-[var(--bg-primary)]">
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase px-2 py-1">Task Backups</p>
                  <button
                    onClick={() => handleTriggerExport('json')}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-white/10 text-[var(--text-primary)] transition-colors text-left"
                  >
                    <FileCode className="w-4 h-4 text-purple-400" />
                    <span>Export JSON (.json)</span>
                  </button>
                  <button
                    onClick={() => handleTriggerExport('csv')}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs hover:bg-white/10 text-[var(--text-primary)] transition-colors text-left"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Export CSV (.csv)</span>
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowBlueprintsModal(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl glass-panel hover:bg-white/10 text-purple-300 border border-purple-500/30 font-semibold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02]"
              title="Browse and apply pre-configured task workflow blueprints"
            >
              <BookmarkCheck className="w-4 h-4 text-purple-400" />
              <span>Workflow Blueprints</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" /> New Autonomous Task
            </button>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-secondary)]/80 border border-[var(--border-color)] w-fit mt-5">
          <button
            onClick={() => setViewMode('pipeline')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'pipeline'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Pipeline Detail
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'kanban'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" /> Kanban Board
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'timeline'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Gantt Timeline
          </button>
          <button
            onClick={() => setViewMode('flow')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'flow'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" /> Nexus Flow (D3)
          </button>
        </div>

        {/* Four Agent Identity Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {(['planner', 'designer', 'builder', 'tester'] as AgentType[]).map((agentKey) => {
            const meta = AGENT_META[agentKey];
            const Icon = meta.icon;
            const isCurrentlyActive = selectedTask?.activeAgent === agentKey && selectedTask?.status !== 'completed';

            return (
              <div
                key={agentKey}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrentlyActive
                    ? `${meta.bg} ${meta.border} shadow-lg ring-1 ring-sky-400/40`
                    : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)] opacity-85'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl ${meta.bg} border ${meta.border}`}>
                    <Icon className={`w-5 h-5 ${meta.color}`} />
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                      isCurrentlyActive ? 'bg-sky-500/20 text-sky-300 animate-pulse' : 'bg-white/5 text-[var(--text-muted)]'
                    }`}
                  >
                    {isCurrentlyActive ? 'PROCESSING' : 'STANDBY'}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">{meta.name}</h3>
                <p className="text-[11px] text-[var(--text-muted)] font-mono">{meta.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backup & Notification Toast */}
      {backupToast && (
        <div className="p-3.5 rounded-2xl bg-sky-500/15 border border-sky-500/40 text-xs text-sky-200 flex items-center justify-between shadow-lg animate-in fade-in">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            {backupToast}
          </span>
          <button onClick={() => setBackupToast(null)} className="text-[var(--text-muted)] hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Daily Digest Dispatch Banner */}
      {showDailyDigest && unfinishedHighPriorityTasks.length > 0 && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-500/15 via-rose-500/15 to-amber-500/15 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
              <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                  Morning Daily Digest
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {unfinishedHighPriorityTasks.length} urgent {unfinishedHighPriorityTasks.length === 1 ? 'task' : 'tasks'} requiring attention today
                </span>
              </div>
              <p className="text-xs font-semibold text-[var(--text-primary)] mt-1">
                Top focus: {unfinishedHighPriorityTasks[0]?.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => {
                setSelectedTaskId(unfinishedHighPriorityTasks[0].id);
                setViewMode('pipeline');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition-all"
            >
              Review Urgent Task
            </button>
            <button
              onClick={handleDismissDailyDigest}
              className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5"
              title="Dismiss Daily Digest for today"
              aria-label="Dismiss Daily Digest"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Ambient Work Sound Synthesizer Bar */}
      <div className="p-3.5 rounded-2xl glass-panel border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          {ambientSound === 'off' ? (
            <VolumeX className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          ) : (
            <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
          )}
          <span className="font-semibold text-[var(--text-secondary)]">Ambient Work Sound:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: 'off', label: 'Mute' },
                { id: 'rain', label: 'Rain' },
                { id: 'white-noise', label: 'White Noise' },
                { id: 'lo-fi', label: 'Lo-Fi Beats' },
              ] as const
            ).map((snd) => (
              <button
                key={snd.id}
                onClick={() => handleAmbientSoundChange(snd.id as AmbientSoundType)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                  ambientSound === snd.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5'
                }`}
              >
                {snd.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {ambientSound !== 'off' && (
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>Vol:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => handleAmbientVolumeChange(parseFloat(e.target.value))}
                className="w-20 accent-cyan-400 cursor-pointer"
                aria-label="Ambient sound volume"
              />
              <span className="font-mono text-[10px]">{Math.round(ambientVolume * 100)}%</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowInsightsPanel((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-semibold transition-all ${
              showInsightsPanel
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Focus Insights</span>
          </button>
        </div>
      </div>

      {/* Collapsible AI Focus Block Insights Panel */}
      {showInsightsPanel && (
        <div className="p-5 rounded-3xl glass-panel border border-purple-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-color)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>AI Pattern Analysis & Recommended Focus Blocks</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Aggregated from completion velocity ({focusInsights.completionRate}%), {focusInsights.averageFocusMinutes}m avg focus sprint, and dependency readiness.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30">
                {focusInsights.unblockedHighPriorityCount} Ready High/Crit
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {focusInsights.blockedCount} Blocked
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30">
                {focusInsights.totalEstimatedHours}h Backlog
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {focusInsights.recommendedBlocks.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] md:col-span-3">
                All active tasks are completed. Create a new task or blueprint to generate focus blocks.
              </p>
            ) : (
              focusInsights.recommendedBlocks.map((block) => (
                <div
                  key={block.id}
                  className="p-4 rounded-2xl bg-[var(--bg-secondary)]/80 border border-[var(--border-color)] space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                      <span className="text-purple-300 font-bold uppercase">{block.windowHint}</span>
                      <span className="text-cyan-400">{block.durationMinutes} min</span>
                    </div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)] mt-1">{block.label}</h4>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1">{block.rationale}</p>
                    <ul className="mt-2 space-y-1 text-[11px] font-mono text-sky-300">
                      {block.taskTitles.map((title, i) => (
                        <li key={i} className="truncate">• {title}</li>
                      ))}
                    </ul>
                  </div>

                  {block.taskIds[0] && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTaskId(block.taskIds[0]);
                        setViewMode('pipeline');
                      }}
                      className="mt-2 w-full py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 text-[11px] font-semibold"
                    >
                      Focus Lead Task
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Real-Time Task Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl glass-panel border border-[var(--border-color)] flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" />
          <input
            type="text"
            value={taskSearchQuery}
            onChange={(e) => setTaskSearchQuery(e.target.value)}
            placeholder="Search tasks by title, objective, project folder, tag, or collaborator..."
            className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500"
          />
          {taskSearchQuery && (
            <button
              onClick={() => setTaskSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority Filter Badges with Icons */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <button
              onClick={() => setPriorityFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                priorityFilter === 'all' ? 'bg-sky-500 text-white' : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPriorityFilter('critical')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                priorityFilter === 'critical' ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50' : 'text-[var(--text-muted)] hover:text-purple-300'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-purple-400" /> Crit
            </button>
            <button
              onClick={() => setPriorityFilter('high')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                priorityFilter === 'high' ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50' : 'text-[var(--text-muted)] hover:text-rose-300'
              }`}
            >
              <Flame className="w-3 h-3 text-rose-400" /> High
            </button>
            <button
              onClick={() => setPriorityFilter('medium')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                priorityFilter === 'medium' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' : 'text-[var(--text-muted)] hover:text-amber-300'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-400" /> Med
            </button>
            <button
              onClick={() => setPriorityFilter('low')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                priorityFilter === 'low' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'text-[var(--text-muted)] hover:text-emerald-300'
              }`}
            >
              <ArrowDown className="w-3 h-3 text-emerald-400" /> Low
            </button>
          </div>

          {/* AI Smart Sort */}
          <button
            onClick={handleSmartSort}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
            title="Reorder tasks automatically based on urgency, deadline, and priority"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Smart Sort</span>
          </button>

          {/* Auto-Cluster Project Folders */}
          <button
            onClick={() => {
              autoClusterAllTasks();
              setBackupToast('Auto-clustered tasks into project folders based on semantic similarities');
              setTimeout(() => setBackupToast(null), 3000);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
            title="Cluster tasks into project folders based on semantic similarity"
          >
            <Folder className="w-3.5 h-3.5 text-purple-400" />
            <span>Auto-Cluster</span>
          </button>

          {/* Task Archive Toggle */}
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showArchived
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-white'
            }`}
            title="Toggle between active workspace and archived tasks"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{showArchived ? 'Active Tasks' : 'Archive'}</span>
          </button>
        </div>
      </div>

      {/* View Mode: Kanban Board */}
      {viewMode === 'kanban' && (
        <TaskKanbanBoard
          tasks={activeNonArchivedTasks}
          selectedTaskId={selectedTaskId}
          onSelectTask={(id) => {
            setSelectedTaskId(id);
            setViewMode('pipeline');
          }}
          onUpdateTaskStatus={updateTaskStatus}
          onOpenCreateModal={() => setShowCreateModal(true)}
        />
      )}

      {/* View Mode: Gantt Timeline */}
      {viewMode === 'timeline' && (
        <TaskTimelineView
          tasks={activeNonArchivedTasks}
          onSelectTask={(id) => {
            setSelectedTaskId(id);
            setViewMode('pipeline');
          }}
          selectedTaskId={selectedTaskId}
        />
      )}

      {/* View Mode: D3 Force-Directed Nexus Flow */}
      {viewMode === 'flow' && (
        <NexusFlowVisualizer
          tasks={activeNonArchivedTasks}
          selectedTaskId={selectedTaskId}
          onSelectTask={(id) => {
            setSelectedTaskId(id);
          }}
          onLinkTasks={linkTaskDependency}
          onUpdatePriority={updateTaskPriority}
        />
      )}

      {/* View Mode: Pipeline Flow */}
      {viewMode === 'pipeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Task Board Column */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                <span>Orchestrated Tasks ({displayedTasks.length}{showArchived ? ' Archived' : ''})</span>
              </h2>
              {displayedTasks.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedTaskIds((prev) =>
                      prev.length === displayedTasks.length ? [] : displayedTasks.map((t) => t.id)
                    )
                  }
                  className="text-[11px] font-mono text-sky-400 hover:underline"
                >
                  {selectedTaskIds.length === displayedTasks.length ? 'Clear Selection' : 'Select All'}
                </button>
              )}
            </div>

            {/* Multi-Select Batch Operations Toolbar */}
            {selectedTaskIds.length > 0 && (
              <div className="p-3 rounded-2xl bg-sky-500/15 border border-sky-500/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sky-300">
                    {selectedTaskIds.length} task(s) selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedTaskIds([])}
                    className="text-[11px] text-[var(--text-muted)] hover:text-white"
                  >
                    Deselect
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <select
                    aria-label="Batch set priority"
                    defaultValue=""
                    onChange={(e) => {
                      const val = e.target.value as TaskPriority;
                      if (val) {
                        handleBatchOperation('set_priority', { priority: val });
                        e.target.value = '';
                      }
                    }}
                    className="px-2 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[11px] text-[var(--text-primary)]"
                  >
                    <option value="" disabled>Set Priority...</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <select
                    aria-label="Move to project folder"
                    value={batchFolderTarget}
                    onChange={(e) => setBatchFolderTarget(e.target.value)}
                    className="px-2 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[11px] text-[var(--text-primary)] max-w-[140px]"
                  >
                    <option value="Architecture & Systems Core">Architecture & Systems Core</option>
                    <option value="Editorial & Design Systems">Editorial & Design Systems</option>
                    <option value="Autonomous Security & Verification">Autonomous Security & Verification</option>
                    <option value="Creator Tools & Personal Workflows">Creator Tools & Personal Workflows</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleBatchOperation('move_folder', { projectFolder: batchFolderTarget })}
                    className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-200 border border-purple-500/40 text-[11px] font-semibold"
                  >
                    Move Folder
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBatchOperation('delete')}
                    className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-200 border border-rose-500/40 text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
              {displayedTasks.length === 0 ? (
                <div className="p-8 rounded-2xl glass-panel text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-color)] space-y-2">
                  <Filter className="w-6 h-6 mx-auto text-[var(--text-muted)]" />
                  <p className="font-semibold text-[var(--text-primary)]">No tasks match your filter</p>
                  <p className="text-[11px]">Clear search or switch priority filters to see other tasks.</p>
                  <button
                    onClick={() => {
                      setTaskSearchQuery('');
                      setPriorityFilter('all');
                      setShowArchived(false);
                    }}
                    className="px-3 py-1 rounded-lg bg-sky-500/20 text-sky-300 text-[11px] font-semibold mt-1"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                displayedTasks.map((task) => {
                  const isSelected = task.id === selectedTaskId;
                  const isBatchChecked = selectedTaskIds.includes(task.id);
                  const agentMeta = AGENT_META[task.activeAgent];
                  const isAwaitingApproval = task.status === 'awaiting_approval';
                  const isCompleted = task.status === 'completed';
                  const catMeta = CATEGORY_META[task.category || 'work'] || CATEGORY_META.work;
                  const CatIcon = catMeta.icon;
                  const prioMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
                  const PrioIcon = prioMeta.icon;
                  const blockStatus = isTaskBlocked(task, tasks);
                  const collabs = getTaskCollaborators(task);
                  const moodBorderClass =
                    task.sentimentMood === 'urgent'
                      ? 'border-l-4 border-l-rose-400'
                      : task.sentimentMood === 'complex'
                      ? 'border-l-4 border-l-purple-400'
                      : task.sentimentMood === 'calm'
                      ? 'border-l-4 border-l-teal-400'
                      : 'border-l-4 border-l-sky-400';

                  return (
                    <div
                      key={task.id}
                      draggable={true}
                      onDragStart={(e) => handleTaskListDragStart(e, task.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleTaskListDrop(e, task.id)}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${moodBorderClass} ${
                        isSelected
                          ? 'glass-panel border-sky-500/60 shadow-lg shadow-sky-500/10'
                          : 'bg-[var(--bg-secondary)]/60 border-[var(--border-color)] hover:border-sky-500/30'
                      } ${isBatchChecked ? 'ring-1 ring-sky-400/70' : ''} ${draggedTaskId === task.id ? 'opacity-40 border-dashed border-sky-400' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-1.5 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <input
                            type="checkbox"
                            checked={isBatchChecked}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => handleToggleSelectTask(task.id)}
                            aria-label={`Select task ${task.title}`}
                            className="w-3.5 h-3.5 rounded border-[var(--border-color)] text-sky-500 focus:ring-0 cursor-pointer shrink-0"
                          />
                          <GripVertical className="w-3.5 h-3.5 text-[var(--text-muted)] cursor-grab shrink-0" />
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1 ${catMeta.bg} ${catMeta.color} ${catMeta.border}`}>
                            <CatIcon className="w-3 h-3" />
                            {catMeta.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border flex items-center gap-1 ${prioMeta.badge}`}>
                            <PrioIcon className="w-3 h-3" />
                            {task.priority}
                          </span>
                          {task.projectFolder && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                              <Folder className="w-2.5 h-2.5" />
                              {task.projectFolder}
                            </span>
                          )}
                          {task.sentimentMood && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold border ${
                              task.sentimentMood === 'urgent' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' :
                              task.sentimentMood === 'complex' ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' :
                              task.sentimentMood === 'calm' ? 'bg-teal-500/15 text-teal-300 border-teal-500/30' :
                              'bg-sky-500/15 text-sky-300 border-sky-500/30'
                            }`}>
                              {task.sentimentMood}
                            </span>
                          )}
                          {task.recurrence && task.recurrence !== 'none' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                              <RotateCcw className="w-2.5 h-2.5" />
                              {task.recurrence}
                            </span>
                          )}
                          {blockStatus.isBlocked && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              Blocked
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-md font-semibold border shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isAwaitingApproval
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                              : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                          }`}
                        >
                          {task.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] line-clamp-1">{task.title}</h4>
                      <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mt-1">{task.prompt}</p>

                      {/* Task Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap mt-2">
                          {task.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20"
                            >
                              #{tag}
                            </span>
                          ))}
                          {task.tags.length > 3 && (
                            <span className="text-[9px] font-mono text-[var(--text-muted)]">
                              +{task.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Collaborators + Dynamic Subtask Circular Progress Ring */}
                      <div className="mt-2.5 pt-2 border-t border-[var(--border-color)]/60 flex items-center justify-between gap-2">
                        <SubtaskProgressRing
                          subtasks={task.subtasks}
                          size={34}
                          strokeWidth={3.5}
                          showText={true}
                        />

                        {collabs.length > 0 && (
                          <div className="flex items-center -space-x-1.5 shrink-0">
                            {collabs.slice(0, 3).map((c) => (
                              <img
                                key={c.id}
                                src={c.avatar}
                                alt={c.name}
                                title={`${c.name} (${c.role || 'assignee'})`}
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  const img = e.currentTarget;
                                  if (!img.dataset.fallbackApplied) {
                                    img.dataset.fallbackApplied = '1';
                                    img.src = generateInitialsAvatarDataUri(c.name);
                                  }
                                }}
                                className="w-5 h-5 rounded-full border border-[var(--bg-primary)] object-cover ring-1 ring-sky-500/30"
                              />
                            ))}
                            {collabs.length > 3 && (
                              <span className="w-5 h-5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[8px] font-mono text-[var(--text-muted)] flex items-center justify-center">
                                +{collabs.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--border-color)] text-[10px] font-mono text-[var(--text-muted)]">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${agentMeta.color.replace('text-', 'bg-')}`} />
                          {agentMeta.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                          {task.focusTimeSeconds ? `${Math.floor(task.focusTimeSeconds / 60)}m focus` : `${task.estimatedHours || 8}h est`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Task Detail & Handoff Inspector */}
          <div className="lg:col-span-8 space-y-5">
            {selectedTask ? (
              <div className="glass-panel rounded-3xl p-6 border border-[var(--border-color)] space-y-6">
                {/* Task Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-mono text-[var(--text-muted)]">Task ID: {selectedTask.id}</span>
                      {(() => {
                        const catMeta = CATEGORY_META[selectedTask.category || 'work'] || CATEGORY_META.work;
                        const CatIcon = catMeta.icon;
                        const prioMeta = PRIORITY_META[selectedTask.priority] || PRIORITY_META.medium;
                        return (
                          <>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${catMeta.bg} ${catMeta.color} ${catMeta.border}`}>
                              <CatIcon className="w-3 h-3" />
                              {catMeta.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${prioMeta.badge}`}>
                              {selectedTask.priority} priority
                            </span>
                            {selectedTask.recurrence && selectedTask.recurrence !== 'none' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                                <RotateCcw className="w-3 h-3" />
                                {selectedTask.recurrence}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">{selectedTask.title}</h3>
                    {selectedTask.tags && selectedTask.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        {selectedTask.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/25"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Workflow Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => archiveTask(selectedTask.id, !selectedTask.archived)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm border transition-all ${
                        selectedTask.archived
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                          : 'bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white border-[var(--border-color)]'
                      }`}
                      title={selectedTask.archived ? 'Restore to active pipeline' : 'Archive completed or inactive task'}
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>{selectedTask.archived ? 'Restore' : 'Archive'}</span>
                    </button>

                    <button
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold shadow-sm transition-all"
                      title="Share task with contacts using Firestore"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Task</span>
                    </button>

                    {selectedTask.status !== 'completed' && selectedTask.status !== 'awaiting_approval' && (
                      <button
                        onClick={handleAdvanceStep}
                        disabled={isProcessingStep || selectedTaskBlockCheck.isBlocked}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md shadow-sky-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title={selectedTaskBlockCheck.isBlocked ? 'Task is blocked by incomplete prerequisite tasks' : 'Advance to next agent in mesh'}
                      >
                        {selectedTaskBlockCheck.isBlocked ? <Lock className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isProcessingStep ? 'Synthesizing...' : selectedTaskBlockCheck.isBlocked ? 'Blocked by Prerequisites' : 'Advance Next Agent'}</span>
                      </button>
                    )}

                    {selectedTask.status === 'awaiting_approval' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleApprove}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve & Complete
                        </button>
                      </div>
                    )}

                    {selectedTask.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold font-mono">
                        <CheckCircle2 className="w-4 h-4" /> COMPLETED BY {selectedTask.approvedBy || 'CREATOR'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Blocking Prerequisite Alert Banner */}
                {selectedTaskBlockCheck.isBlocked && (
                  <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-start gap-3">
                    <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-amber-300 font-mono uppercase tracking-wide">
                        Task Execution Blocked by Dependency
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)]">
                        This task cannot proceed through the multi-agent pipeline until all prerequisite tasks are completed:
                      </p>
                      <ul className="text-xs text-amber-200 list-disc list-inside font-semibold">
                        {selectedTaskBlockCheck.blockingTasks.map((t) => (
                          <li key={t.id}>{t.title} <span className="font-mono text-[10px] text-amber-300">({t.status.replace(/_/g, ' ')})</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Pomodoro Focus Timer Dock */}
                <PomodoroFocusTimer
                  task={selectedTask}
                  onUpdateFocusTime={handleUpdateFocusTime}
                />

              {/* Visual Multi-Stage Pipeline */}
              <div>
                <p className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  Multi-Agent Pipeline Progression
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {STAGES.map((stg, idx) => {
                    const isDone =
                      selectedTask.status === 'completed' ||
                      (selectedTask.status === 'awaiting_approval' && idx < 4) ||
                      (selectedTask.status === 'testing' && idx < 3) ||
                      (selectedTask.status === 'building' && idx < 2) ||
                      (selectedTask.status === 'designing' && idx < 1);

                    const isCurrent =
                      (selectedTask.status === 'planning' && idx === 0) ||
                      (selectedTask.status === 'designing' && idx === 1) ||
                      (selectedTask.status === 'building' && idx === 2) ||
                      (selectedTask.status === 'testing' && idx === 3) ||
                      (selectedTask.status === 'awaiting_approval' && idx === 4) ||
                      (selectedTask.status === 'completed' && idx === 5);

                    return (
                      <div
                        key={stg.key}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold shadow-md shadow-sky-500/10'
                            : isDone
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-[var(--bg-secondary)]/40 border-[var(--border-color)] text-[var(--text-muted)]'
                        }`}
                      >
                        <p className="text-[10px] font-mono font-semibold uppercase truncate">{stg.label.split(' ')[1]}</p>
                        <p className="text-[9px] text-[var(--text-muted)] mt-0.5">{stg.agent.toUpperCase()}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Approval Alert if Awaiting Approval */}
              {selectedTask.status === 'awaiting_approval' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-300">Human Creator Approval Required</h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        The TESTER agent confirmed zero regressions with 100% test pass rate. As per NEXUS safety protocol,
                        creator sign-off is required before finalization.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-amber-500/20">
                    <input
                      type="text"
                      value={rejectionFeedback}
                      onChange={(e) => setRejectionFeedback(e.target.value)}
                      placeholder="Optional feedback if returning to BUILDER..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                    />
                    <button
                      onClick={handleReject}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold"
                    >
                      Request Revisions
                    </button>
                    <button
                      onClick={handleApprove}
                      className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold shadow-md shadow-emerald-500/20"
                    >
                      Approve & Complete
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-[var(--border-color)] overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                    activeTab === 'overview'
                      ? 'border-sky-400 text-sky-400'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  Objective & Scope
                </button>
                <button
                  onClick={() => setActiveTab('subtasks')}
                  className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'subtasks'
                      ? 'border-sky-400 text-sky-400'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  <ListChecks className="w-3.5 h-3.5" />
                  <span>Subtasks ({selectedTask.subtasks?.length || 0})</span>
                </button>
                <button
                  onClick={() => setActiveTab('collaborators')}
                  className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'collaborators'
                      ? 'border-sky-400 text-sky-400'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Team ({selectedTaskCollaborators.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('artifacts')}
                  className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                    activeTab === 'artifacts'
                      ? 'border-sky-400 text-sky-400'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  Agent Deliverables (Artifacts)
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                    activeTab === 'logs'
                      ? 'border-sky-400 text-sky-400'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  Execution Logs ({selectedTask.logs.length})
                </button>
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]">
                    <p className="text-[11px] font-mono text-[var(--text-muted)] uppercase mb-1">Natural Language Prompt</p>
                    <p className="text-sm text-[var(--text-primary)] leading-relaxed">{selectedTask.prompt}</p>
                  </div>

                  {selectedTask.plannerOutput && (
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-amber-400" />
                          <h4 className="text-xs font-bold font-mono uppercase text-amber-400">PLANNER Strategic Scope</h4>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mb-3">{selectedTask.plannerOutput.problemStatement}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="font-semibold text-[var(--text-primary)] mb-1">Objectives:</p>
                            <ul className="list-disc list-inside space-y-0.5 text-[var(--text-secondary)]">
                              {selectedTask.plannerOutput.objectives.map((obj, i) => (
                                <li key={i}>{obj}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--text-primary)] mb-1">Acceptance Criteria:</p>
                            <ul className="list-disc list-inside space-y-0.5 text-[var(--text-secondary)]">
                              {selectedTask.plannerOutput.acceptanceCriteria.map((crit, i) => (
                                <li key={i}>{crit}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Subtasks Checklist */}
              {activeTab === 'subtasks' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]">
                    <div>
                      <h4 className="text-xs font-bold font-mono uppercase text-sky-400">Actionable Checklist</h4>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Break down this high-level task into concrete executable subtasks.
                      </p>
                    </div>
                    <SubtaskProgressRing
                      subtasks={selectedTask.subtasks}
                      size={42}
                      strokeWidth={4}
                      showText={true}
                    />
                  </div>

                  {/* Subtask list */}
                  <div className="space-y-2">
                    {(!selectedTask.subtasks || selectedTask.subtasks.length === 0) ? (
                      <div className="p-8 text-center rounded-2xl border border-dashed border-[var(--border-color)] text-xs text-[var(--text-muted)]">
                        No subtasks added yet. Add checklist items below to track progress.
                      </div>
                    ) : (
                      selectedTask.subtasks.map((subtask) => (
                        <div
                          key={subtask.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-sky-500/30 transition-all"
                        >
                          <label className="flex items-center gap-3 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={subtask.completed}
                              onChange={() => toggleSubtask(selectedTask.id, subtask.id)}
                              className="w-4 h-4 rounded border-[var(--border-color)] text-sky-500 focus:ring-0 cursor-pointer"
                            />
                            <span
                              className={`text-xs transition-all ${
                                subtask.completed
                                  ? 'line-through text-[var(--text-muted)]'
                                  : 'text-[var(--text-primary)] font-medium'
                              }`}
                            >
                              {subtask.title}
                            </span>
                          </label>
                          <button
                            onClick={() => deleteSubtask(selectedTask.id, subtask.id)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete subtask"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Subtask Form */}
                  <form onSubmit={handleAddSubtaskSubmit} className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Add an actionable subtask (e.g., 'Verify OAuth token refresh endpoint')..."
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="submit"
                      disabled={!newSubtaskTitle.trim()}
                      className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md shadow-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Subtask
                    </button>
                  </form>
                </div>
              )}

              {/* Tab: Assignees & Team Collaborators */}
              {activeTab === 'collaborators' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]">
                    <div>
                      <h4 className="text-xs font-bold font-mono uppercase text-purple-400">Assigned Team Collaborators</h4>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Team members responsible for oversight, execution, and review.
                      </p>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setShowAddCollaboratorDropdown(!showAddCollaboratorDropdown)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold shadow-sm transition-all"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add Collaborator</span>
                      </button>

                      {showAddCollaboratorDropdown && (
                        <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-panel border border-[var(--border-color)] shadow-2xl p-3 z-50 animate-in fade-in bg-[var(--bg-primary)] space-y-3">
                          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Select Team Member</p>
                          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                            {DEFAULT_TEAM_COLLABORATORS.map((member) => {
                              const alreadyAdded = selectedTaskCollaborators.some((c) => c.id === member.id);
                              return (
                                <button
                                  key={member.id}
                                  disabled={alreadyAdded}
                                  onClick={() => handleAddTeamCollaborator(member)}
                                  className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs transition-colors text-left ${
                                    alreadyAdded
                                      ? 'opacity-40 cursor-not-allowed bg-white/5'
                                      : 'hover:bg-white/10 text-[var(--text-primary)]'
                                  }`}
                                >
                                  <img
                                    src={member.avatar}
                                    alt={member.name}
                                    className="w-6 h-6 rounded-full object-cover shrink-0"
                                  />
                                  <div className="truncate flex-1">
                                    <p className="font-semibold truncate">{member.name}</p>
                                    <p className="text-[10px] text-[var(--text-muted)] font-mono">{member.role}</p>
                                  </div>
                                  {alreadyAdded && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>

                          <div className="pt-2 border-t border-[var(--border-color)]">
                            <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase mb-1.5">Or Custom Contributor</p>
                            <form onSubmit={handleAddCustomCollaborator} className="space-y-2">
                              <input
                                type="text"
                                placeholder="Teammate Name"
                                value={customCollaboratorName}
                                onChange={(e) => setCustomCollaboratorName(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                              />
                              <input
                                type="email"
                                placeholder="Teammate Email (optional)"
                                value={customCollaboratorEmail}
                                onChange={(e) => setCustomCollaboratorEmail(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]"
                              />
                              <button
                                type="submit"
                                disabled={!customCollaboratorName.trim()}
                                className="w-full py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold disabled:opacity-40"
                              >
                                Add Contributor
                              </button>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Collaborators list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedTaskCollaborators.length === 0 ? (
                      <div className="sm:col-span-2 p-8 text-center rounded-2xl border border-dashed border-[var(--border-color)] text-xs text-[var(--text-muted)]">
                        No collaborators assigned yet. Click "Add Collaborator" above to assemble your team.
                      </div>
                    ) : (
                      selectedTaskCollaborators.map((collab) => (
                        <div
                          key={collab.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-purple-500/30 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={collab.avatar}
                              alt={collab.name}
                              className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-purple-500/30"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{collab.name}</p>
                              {collab.email && (
                                <p className="text-[10px] text-[var(--text-muted)] truncate">{collab.email}</p>
                              )}
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30 mt-0.5">
                                {collab.role || 'assignee'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeCollaboratorFromTask(selectedTask.id, collab.id)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                            title="Remove collaborator"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Artifacts */}
              {activeTab === 'artifacts' && (
                <div className="space-y-4">
                  {/* Designer Artifact */}
                  {selectedTask.designerOutput && (
                    <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/20 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-violet-400" />
                        <h4 className="text-xs font-bold font-mono uppercase text-violet-400">DESIGNER Specification</h4>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">{selectedTask.designerOutput.designBrief}</p>
                      <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-mono space-y-1">
                        <p className="text-[var(--text-muted)]">// Layout & Tokens</p>
                        <p className="text-violet-300">Typography: {selectedTask.designerOutput.typographySystem.fontFamily}</p>
                        <p className="text-sky-300">Responsive: {selectedTask.designerOutput.responsiveBehavior}</p>
                      </div>
                    </div>
                  )}

                  {/* Builder Artifact */}
                  {selectedTask.builderOutput && (
                    <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/20 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <Hammer className="w-4 h-4 text-sky-400" />
                        <h4 className="text-xs font-bold font-mono uppercase text-sky-400">BUILDER Code Synthesis</h4>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">{selectedTask.builderOutput.architectureNotes}</p>
                      {selectedTask.builderOutput.codeSnippets.map((snippet, idx) => (
                        <div key={idx} className="rounded-xl overflow-hidden border border-[var(--border-color)]">
                          <div className="px-3 py-1.5 bg-[var(--bg-secondary)] text-[11px] font-mono text-[var(--text-muted)] border-b border-[var(--border-color)]">
                            {snippet.filename}
                          </div>
                          <pre className="p-3 bg-[#070b13] text-xs font-mono text-sky-300 overflow-x-auto">
                            <code>{snippet.code}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tester Artifact */}
                  {selectedTask.testerOutput && (
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-xs font-bold font-mono uppercase text-emerald-400">
                            TESTER Quality Verdict ({selectedTask.testerOutput.passedTests}/{selectedTask.testerOutput.totalTests} Passed)
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          Score: {selectedTask.testerOutput.performanceScore}%
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {selectedTask.testerOutput.testResults.map((t, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs flex items-center justify-between"
                          >
                            <div>
                              <p className="font-semibold text-[var(--text-primary)]">{t.testName}</p>
                              <p className="text-[11px] text-[var(--text-muted)]">{t.evidence}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-400">
                              {t.executionStatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!selectedTask.plannerOutput && !selectedTask.designerOutput && !selectedTask.builderOutput && (
                    <div className="text-center py-8 text-[var(--text-muted)] text-xs">
                      No deliverables synthesized yet. Click "Advance Next Agent" to begin the pipeline.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Execution Logs */}
              {activeTab === 'logs' && (
                <div className="space-y-2 max-h-80 overflow-y-auto font-mono text-xs">
                  {selectedTask.logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-start gap-3"
                    >
                      <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {log.agent}
                      </span>
                      <div className="flex-1">
                        <span className="text-[var(--text-primary)] font-semibold">{log.action}: </span>
                        <span className="text-[var(--text-secondary)]">{log.details}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-12 text-center text-[var(--text-muted)]">
              No task selected. Select an item from the left or create a new autonomous task.
            </div>
          )}
        </div>
      </div>
    )}

      {/* Create Autonomous Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel p-6 shadow-2xl border border-sky-500/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-lg text-[var(--text-primary)]">Initiate NEXUS CORE Task</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Task Template Blueprint Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-[var(--text-muted)] uppercase block">
                Apply Saved Task Template (Subtasks, Tags & Priority)
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleApplyBlueprintTemplate(e.target.value)}
                aria-label="Apply saved task template"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
              >
                <option value="">-- Start from scratch --</option>
                {blueprints.map((bp) => (
                  <option key={bp.id} value={bp.id}>
                    {bp.name} ({bp.tasks.length} steps • {bp.category})
                  </option>
                ))}
              </select>
              {newSubtasks.length > 0 && (
                <p className="text-[10px] font-mono text-purple-300">
                  Loaded {newSubtasks.length} recurring checklist subtasks from template.
                </p>
              )}
            </div>

            {/* Quick Presets */}
            <div>
              <p className="text-[11px] font-mono text-[var(--text-muted)] uppercase mb-1.5">Quick Inspiration Templates</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    loadPreset(
                      'AI Collaborative Live Reading Rooms',
                      'Design and build real-time collaborative reading rooms with synced highlighter and voice synthesis narration.',
                      'creative',
                      'high'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-sky-500/40 text-[var(--text-secondary)]"
                >
                  Reading Rooms
                </button>
                <button
                  type="button"
                  onClick={() =>
                    loadPreset(
                      'Cryptographic Creator Attestations',
                      'Implement zero-knowledge cryptographic signature verification for author publishing integrity.',
                      'engineering',
                      'high'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-sky-500/40 text-[var(--text-secondary)]"
                >
                  Creator Signatures
                </button>
                <button
                  type="button"
                  onClick={() =>
                    loadPreset(
                      'Dynamic Feed Ranking Weight Sliders',
                      'Provide interactive creator sliders to tune feed ranking balance between recency, topic relevance, and engagement.',
                      'work',
                      'medium'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-sky-500/40 text-[var(--text-secondary)]"
                >
                  Feed Sliders
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Task Title</label>
                  <button
                    type="button"
                    onClick={handleParseNaturalLanguage}
                    className="text-[10px] text-cyan-400 font-mono hover:underline flex items-center gap-1"
                    title="Detect deadlines like 'by Friday at 5pm' from title or objective"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Auto-Detect Deadline</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Build GraphQL Gateway by Friday at 5pm"
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500"
                />
                {newDueDate && (
                  <p className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Deadline set: {new Date(newDueDate).toLocaleString()}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Objective & Natural Language Prompt
                </label>
                <textarea
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  rows={3}
                  placeholder="Detail the technical or user experience requirements for the 4-agent pipeline..."
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Tags
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTagInput.trim()) {
                        e.preventDefault();
                        const cleaned = newTagInput.trim().replace(/^#/, '');
                        if (cleaned && !newTags.includes(cleaned)) {
                          setNewTags((prev) => [...prev, cleaned]);
                        }
                        setNewTagInput('');
                      }
                    }}
                    placeholder="Add tag and press Enter (e.g. architecture)"
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const cleaned = newTagInput.trim().replace(/^#/, '');
                      if (cleaned && !newTags.includes(cleaned)) {
                        setNewTags((prev) => [...prev, cleaned]);
                      }
                      setNewTagInput('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold"
                  >
                    Add Tag
                  </button>
                </div>
                {newTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {newTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-sky-500/15 text-sky-300 border border-sky-500/30"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => setNewTags((prev) => prev.filter((t) => t !== tag))}
                          className="hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Voice-to-Text Speech Dictation using MediaDevices API */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)]/90 border border-rose-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-rose-400" /> Spoken Task Dictation (Voice-to-Text)
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">MediaDevices API</span>
                </div>

                {!isRecordingVoice && !isTranscribingVoice ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/20 to-purple-500/20 hover:from-rose-500/30 hover:to-purple-500/30 text-rose-200 border border-rose-500/40 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
                    >
                      <Mic className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      <span>Record Spoken Task (Mic)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulateVoiceInput}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-white/10 text-xs font-mono transition-all"
                      title="Simulate speech memo for automated test verification"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Simulate Spoken Memo</span>
                    </button>
                  </div>
                ) : isRecordingVoice ? (
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                      </span>
                      <div>
                        <p className="text-xs font-bold text-rose-200 flex items-center gap-2">
                          Recording via MediaDevices API
                          <span className="text-[10px] font-mono text-rose-300">
                            (00:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration})
                          </span>
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] font-mono">
                          Speak title and objectives clearly. Click Stop when finished.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={stopVoiceRecording}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-semibold shadow-md shadow-rose-500/30 transition-all shrink-0"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>Stop & Transcribe</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-xs text-sky-300 font-mono">
                    <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                    <span>Transcribing voice audio directly into title and prompt fields...</span>
                  </div>
                )}

                {voiceError && (
                  <p className="text-[10px] text-amber-400 font-mono mt-1">
                    {voiceError} (Try Simulate Spoken Memo)
                  </p>
                )}
              </div>

              {/* Category Selector with Icons */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Category (Domain)
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['work', 'creative', 'engineering', 'research', 'personal'] as TaskCategory[]).map((catKey) => {
                    const cMeta = CATEGORY_META[catKey];
                    const CIcon = cMeta.icon;
                    const isSel = newCategory === catKey;
                    return (
                      <button
                        type="button"
                        key={catKey}
                        onClick={() => setNewCategory(catKey)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition-all ${
                          isSel
                            ? `${cMeta.bg} ${cMeta.border} ${cMeta.color} font-bold shadow-md`
                            : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                        }`}
                      >
                        <CIcon className="w-4 h-4" />
                        <span className="text-[10px]">{cMeta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Selector (Low, Medium, High) with Color Badges */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => {
                    const pMeta = PRIORITY_META[p];
                    const isSel = newPriority === p;
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setNewPriority(p)}
                        className={`py-2 rounded-xl text-xs font-semibold uppercase border transition-all flex items-center justify-center gap-1.5 ${
                          isSel
                            ? pMeta.buttonActive
                            : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)]'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${pMeta.dot}`} />
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recurrence Frequency */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" /> Recurring Frequency
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono">Firestore Auto-Regen</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      { key: 'none', label: 'Does not repeat' },
                      { key: 'daily', label: 'Daily' },
                      { key: 'weekly', label: 'Weekly' },
                      { key: 'monthly', label: 'Monthly' },
                    ] as const
                  ).map((r) => (
                    <button
                      type="button"
                      key={r.key}
                      onClick={() => setNewRecurrence(r.key)}
                      className={`py-2 px-1 text-center rounded-xl text-[11px] font-semibold border transition-all ${
                        newRecurrence === r.key
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                          : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[var(--text-muted)] font-mono mt-1">
                  When completed, recurring tasks automatically regenerate in Firestore with an advanced schedule timestamp.
                </p>
              </div>

              {/* Prerequisite Dependencies (Blocking Tasks) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" /> Prerequisite Tasks (Blocking)
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono">Dependency Graph</span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mb-1.5">
                  Select existing tasks that must reach 100% completion before this task can advance in the agent mesh:
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1 p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  {tasks.length === 0 ? (
                    <span className="text-[11px] text-[var(--text-muted)]">No existing tasks available to depend on.</span>
                  ) : (
                    tasks.map((existingTask) => {
                      const isChecked = newBlockedByIds.includes(existingTask.id);
                      return (
                        <label
                          key={existingTask.id}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewBlockedByIds((prev) => [...prev, existingTask.id]);
                              } else {
                                setNewBlockedByIds((prev) => prev.filter((id) => id !== existingTask.id));
                              }
                            }}
                            className="rounded border-[var(--border-color)] text-sky-500 focus:ring-0"
                          />
                          <span className="text-[var(--text-primary)] font-medium truncate flex-1">
                            {existingTask.title}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                            [{existingTask.status.replace(/_/g, ' ')}]
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Assign Team Collaborators */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-purple-400" /> Assign Initial Collaborators
                  </label>
                  <span className="text-[10px] text-purple-400 font-mono">Team Mesh</span>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  {DEFAULT_TEAM_COLLABORATORS.map((member) => {
                    const isSelected = newSelectedCollaborators.some((c) => c.id === member.id);
                    return (
                      <label
                        key={member.id}
                        className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-purple-500/20 text-purple-200' : 'hover:bg-white/5 text-[var(--text-muted)]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewSelectedCollaborators((prev) => [...prev, member]);
                            } else {
                              setNewSelectedCollaborators((prev) => prev.filter((c) => c.id !== member.id));
                            }
                          }}
                          className="rounded border-[var(--border-color)] text-purple-500 focus:ring-0"
                        />
                        <img src={member.avatar} alt={member.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                        <span className="text-xs truncate">{member.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-sky-500/25"
                >
                  Launch Orchestration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Task Collaboration Modal */}
      {selectedTask && (
        <ShareTaskModal
          task={selectedTask}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Task Templates & Workflow Blueprints Modal */}
      <TaskTemplatesModal
        isOpen={showBlueprintsModal}
        onClose={() => setShowBlueprintsModal(false)}
      />
    </div>
  );
}
