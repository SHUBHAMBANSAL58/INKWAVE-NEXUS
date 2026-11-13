import React, { useState } from 'react';
import { AgentTask, TaskCategory, TaskPriority, TaskStatus } from '../../types';
import {
  GripVertical,
  CheckCircle2,
  Clock,
  RotateCcw,
  Briefcase,
  Sparkles,
  Terminal,
  Search,
  User,
  Plus,
  Play,
} from 'lucide-react';

interface TaskKanbanBoardProps {
  tasks: AgentTask[];
  selectedTaskId: string;
  onSelectTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onOpenCreateModal: () => void;
}

const CATEGORY_META: Record<TaskCategory, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; border: string; bg: string }> = {
  work: { label: 'Work', icon: Briefcase, color: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/10' },
  creative: { label: 'Creative', icon: Sparkles, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
  engineering: { label: 'Engineering', icon: Terminal, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  research: { label: 'Research', icon: Search, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  personal: { label: 'Personal', icon: User, color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10' },
};

const PRIORITY_META: Record<TaskPriority, { label: string; badge: string; dot: string }> = {
  critical: { label: 'CRITICAL', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30', dot: 'bg-purple-400' },
  high: { label: 'HIGH', badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30', dot: 'bg-rose-400' },
  medium: { label: 'MEDIUM', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  low: { label: 'LOW', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
};

interface ColumnDef {
  id: string;
  title: string;
  statuses: TaskStatus[];
  dropStatus: TaskStatus;
  accent: string;
  badge: string;
}

const KANBAN_COLUMNS: ColumnDef[] = [
  {
    id: 'backlog',
    title: 'Backlog & Pending',
    statuses: ['pending', 'planning'],
    dropStatus: 'pending',
    accent: 'border-amber-500/30',
    badge: 'bg-amber-500/15 text-amber-300',
  },
  {
    id: 'in_progress',
    title: 'Agent Mesh (Building/Testing)',
    statuses: ['designing', 'ready_for_implementation', 'building', 'testing'],
    dropStatus: 'building',
    accent: 'border-sky-500/30',
    badge: 'bg-sky-500/15 text-sky-300',
  },
  {
    id: 'approval',
    title: 'Awaiting Human Approval',
    statuses: ['awaiting_approval'],
    dropStatus: 'awaiting_approval',
    accent: 'border-purple-500/30',
    badge: 'bg-purple-500/15 text-purple-300',
  },
  {
    id: 'completed',
    title: 'Completed & Released',
    statuses: ['completed'],
    dropStatus: 'completed',
    accent: 'border-emerald-500/30',
    badge: 'bg-emerald-500/15 text-emerald-300',
  },
];

export function TaskKanbanBoard({
  tasks,
  selectedTaskId,
  onSelectTask,
  onUpdateTaskStatus,
  onOpenCreateModal,
}: TaskKanbanBoardProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeOverColumn, setActiveOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeOverColumn !== colId) {
      setActiveOverColumn(colId);
    }
  };

  const handleDragLeave = (colId: string) => {
    if (activeOverColumn === colId) {
      setActiveOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setActiveOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onUpdateTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-2">
          <span>Drag and drop task cards across status columns to transition pipeline stages.</span>
        </div>
        <button
          onClick={onOpenCreateModal}
          className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/40 font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      </div>

      {/* 4-Column Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KANBAN_COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => col.statuses.includes(t.status));
          const isOver = activeOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => handleDragLeave(col.id)}
              onDrop={(e) => handleDrop(e, col.dropStatus)}
              className={`rounded-2xl border transition-all p-3.5 flex flex-col bg-[var(--bg-secondary)]/40 min-h-[460px] ${
                isOver
                  ? 'border-purple-400 bg-purple-950/20 shadow-lg ring-1 ring-purple-400/50'
                  : `border-[var(--border-color)]`
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-mono font-bold text-[var(--text-primary)]">
                    {col.title}
                  </h4>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${col.badge}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[620px] pr-1">
                {colTasks.length === 0 ? (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl text-center p-3 text-[11px] font-mono text-[var(--text-muted)]">
                    Drop task here to move to {col.title}
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const isSelected = task.id === selectedTaskId;
                    const catKey = (task.category || 'work') as TaskCategory;
                    const catMeta = CATEGORY_META[catKey] || CATEGORY_META.work;
                    const priMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
                    const CatIcon = catMeta.icon;

                    return (
                      <div
                        key={task.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => onSelectTask(task.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing shadow-sm hover:border-slate-500 relative group ${
                          isSelected
                            ? 'bg-purple-950/30 border-purple-500/70 ring-1 ring-purple-500/40'
                            : 'bg-[var(--bg-primary)] border-[var(--border-color)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Priority Badge */}
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 ${priMeta.badge}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${priMeta.dot}`} />
                              {priMeta.label}
                            </span>

                            {/* Category Badge */}
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1 ${catMeta.bg} ${catMeta.color} ${catMeta.border}`}
                            >
                              <CatIcon className="w-2.5 h-2.5" />
                              <span>{catMeta.label}</span>
                            </span>

                            {/* Recurrence Badge */}
                            {task.recurrence && task.recurrence !== 'none' && (
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1"
                                title={`Recurring task: ${task.recurrence}`}
                              >
                                <RotateCcw className="w-2.5 h-2.5" />
                                <span className="capitalize">{task.recurrence}</span>
                              </span>
                            )}
                          </div>

                          <div className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors shrink-0">
                            <GripVertical className="w-4 h-4" />
                          </div>
                        </div>

                        <h5 className="text-xs font-bold text-[var(--text-primary)] line-clamp-2 mb-1.5">
                          {task.title}
                        </h5>

                        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mb-3">
                          {task.prompt}
                        </p>

                        <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                          <span className="font-bold text-slate-300 uppercase">
                            {task.activeAgent}
                          </span>
                          {task.status === 'completed' ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Done
                            </span>
                          ) : (
                            <span>{task.status.replace(/_/g, ' ')}</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
