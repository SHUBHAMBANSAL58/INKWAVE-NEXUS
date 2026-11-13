import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  X,
  Tag,
  Flame,
  Zap,
  ArrowDown,
  AlertTriangle,
  Briefcase,
  Terminal,
  Sparkles,
  Search,
  User,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskCategory, TaskPriority } from '../../types';
import {
  QUICK_ADD_PRESET_TAGS,
  QUICK_ADD_PRIORITIES,
  addQuickTag,
  toggleQuickTag,
  removeQuickTag,
  validateQuickAddForm,
} from '../../utils/quickAddTask';

interface GlobalQuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: (taskTitle: string) => void;
}

const PRIORITY_OPTIONS: Record<
  TaskPriority,
  { label: string; activeClass: string; dotClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  low: {
    label: 'Low',
    activeClass: 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300',
    dotClass: 'bg-emerald-400',
    icon: ArrowDown,
  },
  medium: {
    label: 'Medium',
    activeClass: 'bg-amber-500/20 border-amber-500/60 text-amber-300',
    dotClass: 'bg-amber-400',
    icon: Zap,
  },
  high: {
    label: 'High',
    activeClass: 'bg-rose-500/20 border-rose-500/60 text-rose-300',
    dotClass: 'bg-rose-400',
    icon: Flame,
  },
  critical: {
    label: 'Critical',
    activeClass: 'bg-purple-500/20 border-purple-500/60 text-purple-200',
    dotClass: 'bg-purple-400',
    icon: AlertTriangle,
  },
};

const CATEGORY_OPTIONS: {
  key: TaskCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'work', label: 'Work', icon: Briefcase },
  { key: 'engineering', label: 'Engineering', icon: Terminal },
  { key: 'creative', label: 'Creative', icon: Sparkles },
  { key: 'research', label: 'Research', icon: Search },
  { key: 'personal', label: 'Personal', icon: User },
];

export function GlobalQuickAddModal({ isOpen, onClose, onTaskCreated }: GlobalQuickAddModalProps) {
  const { createTask } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('work');
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    const focusTimer = setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddCustomTag = () => {
    if (!customTagInput.trim()) return;
    setTags((prev) => addQuickTag(prev, customTagInput));
    setCustomTagInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Include any uncommitted custom tag text if the user typed one without clicking Add
    const effectiveTags = customTagInput.trim() ? addQuickTag(tags, customTagInput) : tags;

    const validation = validateQuickAddForm({
      title,
      description,
      priority,
      category,
      tags: effectiveTags,
    });

    if (!validation.valid || !validation.normalized) {
      setErrorMsg(validation.error || 'Please provide a valid task title.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const { title: cleanTitle, prompt: cleanPrompt, priority: cleanPriority, category: cleanCategory, tags: cleanTags } =
        validation.normalized;

      await createTask(
        cleanTitle,
        cleanPrompt,
        cleanPriority,
        cleanCategory,
        'none',
        [],
        [],
        [],
        cleanTags
      );

      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('work');
      setTags([]);
      setCustomTagInput('');
      onTaskCreated?.(cleanTitle);
      onClose();
    } catch (err) {
      setErrorMsg('Could not create task right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="global-quick-add-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl glass-panel p-6 shadow-2xl border border-sky-500/40 bg-[var(--bg-primary)] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 id="global-quick-add-title" className="font-bold text-base text-[var(--text-primary)]">
                Global Quick-Add Task
              </h3>
              <p className="text-[11px] font-mono text-[var(--text-muted)]">
                Dispatch a task directly into NEXUS CORE from any workspace view
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close quick-add modal"
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 font-medium"
            >
              {errorMsg}
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="quick-add-title-input"
              className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
            >
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              ref={titleInputRef}
              id="quick-add-title-input"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="e.g., Audit API rate-limiting headers"
              maxLength={140}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="quick-add-desc-input"
              className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5"
            >
              Objective / Notes <span className="text-[10px] font-mono text-[var(--text-muted)]">(optional)</span>
            </label>
            <textarea
              id="quick-add-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Briefly describe scope, deliverables, or acceptance criteria..."
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          {/* Priority Selector */}
          <div>
            <span className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Priority Level
            </span>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_ADD_PRIORITIES.map((prio) => {
                const meta = PRIORITY_OPTIONS[prio];
                const Icon = meta.icon;
                const isSelected = priority === prio;
                return (
                  <button
                    key={prio}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setPriority(prio)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? `${meta.activeClass} shadow-sm`
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <span className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Category
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {CATEGORY_OPTIONS.map((cat) => {
                const CIcon = cat.icon;
                const isSelected = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setCategory(cat.key)}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-[10px] transition-all ${
                      isSelected
                        ? 'bg-sky-500/20 border-sky-500/60 text-sky-300 font-bold'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <CIcon className="w-3.5 h-3.5" />
                    <span className="truncate max-w-full">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tag Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                Tags
              </span>
              <span className="text-[10px] font-mono text-[var(--text-muted)] tabular-nums">
                {tags.length}/8 selected
              </span>
            </div>

            {/* Preset Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {QUICK_ADD_PRESET_TAGS.map((preset) => {
                const isSelected = tags.some((t) => t.toLowerCase() === preset.toLowerCase());
                return (
                  <button
                    key={preset}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setTags((prev) => toggleQuickTag(prev, preset))}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 font-semibold'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-sky-500/30'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-cyan-300" />}
                    <span>#{preset}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                placeholder="Add custom tag (press Enter)..."
                maxLength={24}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                disabled={!customTagInput.trim() || tags.length >= 8}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold disabled:opacity-40 transition-colors"
              >
                Add Tag
              </button>
            </div>

            {/* Active Tags Display (shows custom tags + selected presets cleanly) */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-[var(--border-color)]/60">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-sky-500/15 text-sky-300 border border-sky-500/30"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => setTags((prev) => removeQuickTag(prev, tag))}
                      aria-label={`Remove tag ${tag}`}
                      className="text-sky-300/70 hover:text-rose-300 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-semibold text-xs shadow-md shadow-sky-500/25 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
