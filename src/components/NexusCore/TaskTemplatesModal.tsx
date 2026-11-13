import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskBlueprint, TaskCategory } from '../../types';
import {
  Sparkles,
  Layers,
  X,
  Play,
  Trash2,
  Clock,
  CheckCircle2,
  Lock,
  Plus,
  BookOpen,
  BookmarkPlus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { CATEGORY_META, PRIORITY_META } from './NexusCoreView';

interface TaskTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstantiated?: () => void;
}

export function TaskTemplatesModal({ isOpen, onClose, onInstantiated }: TaskTemplatesModalProps) {
  const { blueprints, instantiateBlueprintWorkflow, saveBlueprint, deleteBlueprint, tasks } = useApp();

  const [activeTab, setActiveTab] = useState<'curated' | 'custom' | 'create'>('curated');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [instantiatingId, setInstantiatingId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // New custom blueprint form state
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customCategory, setCustomCategory] = useState<TaskCategory>('engineering');

  if (!isOpen) return null;

  const curatedBlueprints = blueprints.filter((b) => !b.isCustom);
  const userBlueprints = blueprints.filter((b) => b.isCustom);

  const displayedList = activeTab === 'curated' ? curatedBlueprints : userBlueprints;
  const filteredList = selectedCategory === 'all'
    ? displayedList
    : displayedList.filter((b) => b.category === selectedCategory);

  const handleInstantiate = async (blueprint: TaskBlueprint) => {
    setInstantiatingId(blueprint.id);
    try {
      const created = await instantiateBlueprintWorkflow(blueprint.id);
      setSuccessNotice(`Applied "${blueprint.name}"! Created ${created.length} orchestrated tasks in the mesh.`);
      setTimeout(() => setSuccessNotice(null), 4000);
      if (onInstantiated) onInstantiated();
    } finally {
      setInstantiatingId(null);
    }
  };

  const handleSaveCurrentAsBlueprint = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    if (!customName.trim() || !customDesc.trim()) {
      setErrorNotice('Please provide both a blueprint name and workflow description.');
      return;
    }

    if (tasks.length === 0) {
      setErrorNotice('There are no active tasks to create a blueprint from.');
      return;
    }

    const saved = await saveBlueprint(customName, customDesc, customCategory, tasks);
    setSuccessNotice(`Saved "${saved.name}" with ${tasks.length} tasks as a custom blueprint!`);
    setCustomName('');
    setCustomDesc('');
    setActiveTab('custom');
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl glass-panel shadow-2xl border border-sky-500/40 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-purple-500/20 text-sky-400 border border-sky-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Workflow Blueprints
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono">Autonomous Templates</span>
              </div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">
                Task Blueprints & Pre-Configured Workflows
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success / Error Banners */}
        {successNotice && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successNotice}</span>
          </div>
        )}
        {errorNotice && (
          <div role="alert" className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center justify-between gap-2.5 animate-in fade-in">
            <span>{errorNotice}</span>
            <button type="button" onClick={() => setErrorNotice(null)} className="text-rose-300 hover:text-white font-bold">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs & Category Filters */}
        <div className="px-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <button
              onClick={() => setActiveTab('curated')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'curated'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Curated ({curatedBlueprints.length})
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'custom'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Custom Blueprints ({userBlueprints.length})
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <BookmarkPlus className="w-3.5 h-3.5" /> Save Mesh as Blueprint
            </button>
          </div>

          {activeTab !== 'create' && (
            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] mr-1">Filter:</span>
              {(['all', 'engineering', 'research', 'creative', 'work', 'personal'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                    selectedCategory === cat
                      ? 'bg-white/10 text-sky-300 border border-sky-400/40'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'create' ? (
            /* Sub-Form: Save Current Orchestrated Mesh as Blueprint */
            <form onSubmit={handleSaveCurrentAsBlueprint} className="space-y-4 max-w-xl mx-auto">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1">
                <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                  <BookmarkPlus className="w-4 h-4" /> Save Current Active Tasks as Reusable Blueprint
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Package all {tasks.length} active tasks currently in your NEXUS CORE mesh into a repeatable workflow blueprint, preserving titles, prompts, priorities, categories, and prerequisite dependencies.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Blueprint Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Microservices Production Release Standard"
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Workflow Description & Scope
                </label>
                <textarea
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  rows={3}
                  placeholder="Describe when to apply this workflow and what deliverables it produces..."
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Primary Domain Category
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['work', 'creative', 'engineering', 'research', 'personal'] as TaskCategory[]).map((catKey) => {
                    const cMeta = CATEGORY_META[catKey];
                    const CIcon = cMeta.icon;
                    const isSel = customCategory === catKey;
                    return (
                      <button
                        type="button"
                        key={catKey}
                        onClick={() => setCustomCategory(catKey)}
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

              <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
                <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase">
                  Included Tasks in this Blueprint ({tasks.length}):
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {tasks.map((t, idx) => (
                    <div key={t.id} className="text-xs p-2 rounded-lg bg-white/5 flex items-center justify-between">
                      <span className="font-semibold text-[var(--text-primary)] truncate max-w-sm">
                        {idx + 1}. {t.title}
                      </span>
                      <span className="text-[10px] font-mono text-sky-400 uppercase">{t.priority}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('curated')}
                  className="px-4 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-500/25"
                >
                  Save as Custom Blueprint
                </button>
              </div>
            </form>
          ) : (
            /* Blueprint Cards Grid */
            <div className="space-y-4">
              {filteredList.length === 0 ? (
                <div className="text-center py-12 text-[var(--text-muted)] text-sm">
                  No blueprints found in this category. Select another category or save your current task mesh as a blueprint.
                </div>
              ) : (
                filteredList.map((bp) => {
                  const catMeta = CATEGORY_META[bp.category] || CATEGORY_META.work;
                  const CatIcon = catMeta.icon;
                  const totalEstHours = bp.tasks.reduce((acc, t) => acc + (t.estimatedHours || 6), 0);
                  const isInstantiating = instantiatingId === bp.id;

                  return (
                    <div
                      key={bp.id}
                      className="p-5 rounded-2xl glass-panel border border-[var(--border-color)] hover:border-sky-500/40 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${catMeta.bg} ${catMeta.color} ${catMeta.border}`}>
                              <CatIcon className="w-3 h-3" />
                              {catMeta.label}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--text-muted)]">
                              {bp.tasks.length} Orchestrated Steps
                            </span>
                            <span className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                              <Clock className="w-3 h-3" /> ~{totalEstHours}h estimated
                            </span>
                            {bp.isCustom && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                Custom
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-[var(--text-primary)]">{bp.name}</h3>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{bp.description}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {bp.isCustom && (
                            <button
                              onClick={() => deleteBlueprint(bp.id)}
                              className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all"
                              title="Delete blueprint"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleInstantiate(bp)}
                            disabled={isInstantiating}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-sky-500/20 transition-all disabled:opacity-50"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>{isInstantiating ? 'Instantiating...' : 'Apply Blueprint'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Step-by-step Task Pipeline Flow within Template */}
                      <div className="pt-2 border-t border-[var(--border-color)]">
                        <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                          Workflow Pipeline Sequence ({bp.tasks.length} tasks):
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {bp.tasks.map((taskItem, tIdx) => {
                            const pMeta = PRIORITY_META[taskItem.priority] || PRIORITY_META.medium;
                            const hasBlocker = taskItem.blockedByIndices && taskItem.blockedByIndices.length > 0;

                            return (
                              <div
                                key={tIdx}
                                className="p-2.5 rounded-xl bg-[var(--bg-secondary)]/70 border border-[var(--border-color)] flex items-start gap-2 text-xs"
                              >
                                <span className="w-5 h-5 rounded-full bg-white/5 border border-[var(--border-color)] flex items-center justify-center font-mono text-[10px] text-[var(--text-muted)] shrink-0 mt-0.5">
                                  {tIdx + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase border ${pMeta.badge}`}>
                                      {taskItem.priority}
                                    </span>
                                    {hasBlocker && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                                        <Lock className="w-2.5 h-2.5" /> Blocked by Step {taskItem.blockedByIndices!.map((i) => i + 1).join(', ')}
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-semibold text-[var(--text-primary)] truncate">{taskItem.title}</p>
                                  <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">{taskItem.prompt}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
