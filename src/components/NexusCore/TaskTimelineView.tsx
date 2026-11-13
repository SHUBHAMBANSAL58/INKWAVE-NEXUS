import React, { useState } from 'react';
import { AgentTask, TaskCategory, TaskPriority, AgentType, TaskStatus } from '../../types';
import {
  Calendar,
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Briefcase,
  Sparkles,
  Terminal,
  Search,
  User,
  Brain,
  Palette,
  Hammer,
  ShieldAlert,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface TaskTimelineViewProps {
  tasks: AgentTask[];
  selectedTaskId: string;
  onSelectTask: (taskId: string) => void;
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

const PIPELINE_PHASES: { key: string; label: string; agent: AgentType | 'human' | 'complete'; pct: number }[] = [
  { key: 'planning', label: '1. PLANNER', agent: 'planner', pct: 16 },
  { key: 'designing', label: '2. DESIGNER', agent: 'designer', pct: 33 },
  { key: 'building', label: '3. BUILDER', agent: 'builder', pct: 50 },
  { key: 'testing', label: '4. TESTER', agent: 'tester', pct: 66 },
  { key: 'awaiting_approval', label: '5. CREATOR REVIEW', agent: 'human', pct: 83 },
  { key: 'completed', label: '6. PRODUCTION', agent: 'complete', pct: 100 },
];

function getStatusProgress(status: TaskStatus): number {
  switch (status) {
    case 'pending':
      return 8;
    case 'planning':
      return 20;
    case 'designing':
      return 38;
    case 'ready_for_implementation':
      return 45;
    case 'building':
      return 55;
    case 'testing':
      return 72;
    case 'awaiting_approval':
      return 88;
    case 'completed':
      return 100;
    case 'failed':
      return 50;
    default:
      return 10;
  }
}

export function TaskTimelineView({ tasks, selectedTaskId, onSelectTask }: TaskTimelineViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const filteredTasks = tasks.filter((t) => {
    const matchCat = selectedCategory === 'all' || (t.category || 'work') === selectedCategory;
    const matchPri = selectedPriority === 'all' || t.priority === selectedPriority;
    return matchCat && matchPri;
  });

  return (
    <div className="space-y-4">
      {/* Controls & Filter Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span className="font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider">
            NEXUS CORE Orchestration Gantt Timeline
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30">
            {filteredTasks.length} Active Tasks
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-[var(--bg-primary)] px-2 py-1 rounded-xl border border-[var(--border-color)]">
            <Filter className="w-3 h-3 text-[var(--text-muted)]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by Category"
              className="bg-transparent text-xs font-mono text-[var(--text-primary)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="engineering">Engineering</option>
              <option value="creative">Creative</option>
              <option value="work">Work</option>
              <option value="research">Research</option>
              <option value="personal">Personal</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1 bg-[var(--bg-primary)] px-2 py-1 rounded-xl border border-[var(--border-color)]">
            <Flame className="w-3 h-3 text-[var(--text-muted)]" />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              aria-label="Filter by Priority"
              className="bg-transparent text-xs font-mono text-[var(--text-primary)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div className="rounded-3xl glass-panel border border-[var(--border-color)] bg-[var(--bg-primary)] overflow-hidden shadow-2xl">
        {/* Horizontal Timeline Header */}
        <div className="grid grid-cols-12 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/70 text-xs font-mono font-bold">
          <div className="col-span-12 md:col-span-4 p-3.5 pl-5 border-r border-[var(--border-color)] text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
            <span>Task Metadata & Priority</span>
          </div>

          <div className="col-span-8 hidden md:grid grid-cols-6 divide-x divide-[var(--border-color)]">
            {PIPELINE_PHASES.map((phase) => (
              <div key={phase.key} className="p-3 text-center truncate">
                <span className="text-[11px] text-[var(--text-secondary)]">{phase.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Rows */}
        <div className="divide-y divide-[var(--border-color)]">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-[var(--text-muted)]">
              No tasks match the selected filters.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isSelected = task.id === selectedTaskId;
              const catKey = (task.category || 'work') as TaskCategory;
              const catMeta = CATEGORY_META[catKey] || CATEGORY_META.work;
              const priMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
              const CatIcon = catMeta.icon;
              const progressPct = getStatusProgress(task.status);
              const isDone = task.status === 'completed';

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                  className={`grid grid-cols-12 cursor-pointer transition-all hover:bg-slate-800/30 ${
                    isSelected ? 'bg-purple-950/20' : ''
                  }`}
                >
                  {/* Left Column: Task Info */}
                  <div className="col-span-12 md:col-span-4 p-4 pl-5 border-r border-[var(--border-color)] flex flex-col justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {/* Priority Badge */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 ${priMeta.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${priMeta.dot}`} />
                          {priMeta.label}
                        </span>

                        {/* Category Badge */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1 ${catMeta.bg} ${catMeta.color} ${catMeta.border}`}
                        >
                          <CatIcon className="w-3 h-3" />
                          <span>{catMeta.label}</span>
                        </span>

                        {/* Recurrence Badge */}
                        {task.recurrence && task.recurrence !== 'none' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                            <RotateCcw className="w-2.5 h-2.5 animate-spin-slow" />
                            <span className="capitalize">{task.recurrence}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-[var(--text-primary)] line-clamp-1">
                        {task.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                      <span className="truncate">
                        Status: <strong className="text-[var(--text-primary)]">{task.status.replace(/_/g, ' ')}</strong>
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-[10px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Horizontal Gantt Bar */}
                  <div className="col-span-12 md:col-span-8 p-4 flex flex-col justify-center relative">
                    {/* Background Column Guidelines */}
                    <div className="absolute inset-0 hidden md:grid grid-cols-6 divide-x divide-slate-800/40 pointer-events-none" />

                    {/* Gantt Bar Track */}
                    <div className="relative h-10 w-full bg-slate-900/60 rounded-xl border border-slate-800 p-1 flex items-center overflow-hidden">
                      {/* Active Progress Fill */}
                      <div
                        className={`h-full rounded-lg transition-all duration-500 relative flex items-center justify-between px-3 ${
                          isDone
                            ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 shadow-md shadow-emerald-500/20'
                            : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 shadow-md shadow-indigo-500/20'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      >
                        <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider truncate">
                          {task.activeAgent.toUpperCase()}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          )}
                          <span className="text-[10px] font-mono font-bold text-white/90">
                            {progressPct}%
                          </span>
                        </div>
                      </div>

                      {/* Milestone Marker at right if not complete */}
                      {!isDone && (
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-800 border-2 border-indigo-400 flex items-center justify-center pointer-events-none"
                          style={{ left: `calc(${progressPct}% - 8px)` }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-300" />
                        </div>
                      )}
                    </div>

                    {/* Stage milestone legend under Gantt bar on mobile */}
                    <div className="flex md:hidden items-center justify-between mt-2 text-[10px] font-mono text-[var(--text-muted)]">
                      <span>Planning</span>
                      <span>Building</span>
                      <span>Production</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
