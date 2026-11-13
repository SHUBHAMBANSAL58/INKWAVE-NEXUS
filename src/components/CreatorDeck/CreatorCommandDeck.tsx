import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CreatorTwinPersona, ArticleRevision, CreatorQuest } from '../../types';
import {
  PenTool,
  Clock,
  Sparkles,
  Users,
  Dna,
  History,
  Trophy,
  Sliders,
  Check,
  X,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Eye,
  TrendingUp,
  FileText,
  MessageSquare,
  Zap,
  Timer,
} from 'lucide-react';
import { synthesizeCreatorTwinSample } from '../../utils/creatorDna';

export function CreatorCommandDeck() {
  const {
    currentUser,
    setActiveView,
    pomodoroActive,
    pomodoroSecondsLeft,
    pomodoroMode,
    togglePomodoro,
    resetPomodoro,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'twin' | 'collaborate' | 'timemachine' | 'quests'>('overview');
  const [testTopic, setTestTopic] = useState('Distributed Multi-Agent Consensus');
  const [restoreToast, setRestoreToast] = useState<string | null>(null);

  // Creator Twin Configuration State
  const [twinConfig, setTwinConfig] = useState<CreatorTwinPersona>({
    tone: 'analytical',
    creativityLevel: 82,
    concisenessLevel: 75,
    technicalDepthLevel: 90,
    activeVoicePreference: true,
    bannedCliches: [
      'Delve into',
      'In today’s fast-paced world',
      'At the end of the day',
      'Paradigm shift',
    ],
    signaturePhrases: [
      'Empirical verification precedes deployment',
      'Knowledge is high-dimensional topology',
      'Autonomous handoffs require formal contracts',
    ],
    customDirective:
      'Always substantiate architectural claims with concrete benchmarks, modular interfaces, and failure modes.',
  });

  const [newCliche, setNewCliche] = useState('');
  const [testSampleOutput, setTestSampleOutput] = useState<string | null>(null);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);

  // Live Collaborative Writing Simulation State
  const [collabDocument, setCollabDocument] = useState<string>(
    `# Autonomous Multi-Agent Consensus in Decentralized Systems\n\nWhen distributed software agents coordinate without a central arbiter, consensus latency scales with Byzantine fault tolerance thresholds.\n\nBy leveraging deterministic state hashes and cryptographically signed verification logs, agents can achieve instant deterministic finality across asynchronous networks.`
  );

  const [activeCollaborators, setActiveCollaborators] = useState([
    { name: 'Elena Rostova', role: 'Staff Systems Architect', color: 'bg-emerald-500', active: true },
    { name: 'Marcus Vance', role: 'Security Lead', color: 'bg-indigo-500', active: true },
    { name: 'NOVA AI Co-Pilot', role: 'Synthetic Intelligence', color: 'bg-sky-500', active: true },
  ]);

  const [pendingSuggestions, setPendingSuggestions] = useState([
    {
      id: 'sug-1',
      author: 'Marcus Vance',
      original: 'consensus latency scales with Byzantine fault tolerance thresholds.',
      replacement: 'consensus latency scales logarithmically with verifiable quorum slices.',
      accepted: false,
      rejected: false,
    },
    {
      id: 'sug-2',
      author: 'NOVA AI',
      original: 'instant deterministic finality across asynchronous networks.',
      replacement: 'provably optimal finality within sub-second verification epochs.',
      accepted: false,
      rejected: false,
    },
  ]);

  // Article Time Machine State
  const revisions: ArticleRevision[] = [
    {
      id: 'rev-1',
      version: 'v1.0 (Raw Ideation)',
      title: 'Decentralized Multi-Agent Protocols: Initial Musings',
      content:
        'Agents could maybe communicate over websockets and vote on state changes. We need some way to make sure bad agents cannot break everything.',
      timestamp: 'Yesterday at 14:20',
      authorName: currentUser.name,
      changeSummary: 'Initial draft capturing core hypothesis.',
    },
    {
      id: 'rev-2',
      version: 'v1.5 (NOVA AI Synthesis)',
      title: 'Decentralized Multi-Agent Consensus: Mathematical Formalism',
      content:
        'Autonomous multi-agent orchestration demands formal state machines. By introducing PLANNER, DESIGNER, BUILDER, and TESTER roles, each agent operates under a strict verification boundary.',
      timestamp: 'Today at 09:15',
      authorName: 'NOVA AI Engine',
      changeSummary: 'Structured pipeline into 4-agent state transition contract.',
    },
    {
      id: 'rev-3',
      version: 'v2.0 (Peer Reviewed & Approved)',
      title: 'Autonomous Multi-Agent Consensus in Decentralized Systems',
      content:
        'When distributed software agents coordinate without a central arbiter, consensus latency scales with Byzantine fault tolerance thresholds. By leveraging deterministic state hashes, agents achieve sub-second finality.',
      timestamp: 'Today at 11:45',
      authorName: 'Elena Rostova & ' + currentUser.name,
      changeSummary: 'Finalized Byzantine fault tolerance proofs and code snippets.',
    },
  ];
  const [selectedRevision, setSelectedRevision] = useState<ArticleRevision>(revisions[2]);

  // Creator Quests
  const quests: CreatorQuest[] = [
    {
      id: 'q-1',
      title: 'Constellation Architect',
      description: 'Publish 3 interconnected publications tagged in the same knowledge nebula.',
      category: 'publishing',
      progress: 2,
      maxProgress: 3,
      completed: false,
      xpReward: 350,
      badgeIcon: 'Sparkles',
    },
    {
      id: 'q-2',
      title: 'Agent Orchestrator',
      description: 'Advance a multi-agent task through all 4 pipeline stages to verified approval.',
      category: 'intelligence',
      progress: 1,
      maxProgress: 1,
      completed: true,
      xpReward: 500,
      badgeIcon: 'Cpu',
    },
    {
      id: 'q-3',
      title: 'Deep Space Philosopher',
      description: 'Achieve 15 minutes of uninterrupted Deep Space reading without switching tabs.',
      category: 'collaboration',
      progress: 12,
      maxProgress: 15,
      completed: false,
      xpReward: 200,
      badgeIcon: 'BookOpen',
    },
  ];

  // Test Persona Voice handler wired to pure utility
  const handleTestVoice = () => {
    setIsGeneratingSample(true);
    setTimeout(() => {
      const sample = synthesizeCreatorTwinSample(twinConfig, testTopic);
      setTestSampleOutput(`[CREATOR TWIN VOICE — ${twinConfig.tone.toUpperCase()}]:\n"${sample}"`);
      setIsGeneratingSample(false);
    }, 300);
  };

  const handleRestoreRevision = () => {
    setCollabDocument(`# ${selectedRevision.title}\n\n${selectedRevision.content}`);
    setActiveTab('collaborate');
    setRestoreToast(`Restored ${selectedRevision.version} into Live Co-Writing Room`);
    setTimeout(() => setRestoreToast(null), 3200);
  };

  const pomodoroMins = String(Math.floor(pomodoroSecondsLeft / 60)).padStart(2, '0');
  const pomodoroSecs = String(pomodoroSecondsLeft % 60).padStart(2, '0');

  const handleAddBannedCliche = () => {
    if (!newCliche.trim()) return;
    setTwinConfig((prev) => ({
      ...prev,
      bannedCliches: [...prev.bannedCliches, newCliche.trim()],
    }));
    setNewCliche('');
  };

  const handleRemoveBannedCliche = (cliche: string) => {
    setTwinConfig((prev) => ({
      ...prev,
      bannedCliches: prev.bannedCliches.filter((c) => c !== cliche),
    }));
  };

  const handleApplySuggestion = (sugId: string, accept: boolean) => {
    setPendingSuggestions((prev) =>
      prev.map((s) => {
        if (s.id === sugId) {
          if (accept) {
            setCollabDocument((doc) => doc.replace(s.original, s.replacement));
          }
          return { ...s, accepted: accept, rejected: !accept };
        }
        return s;
      })
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-[var(--border-color)] bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-primary)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-sky-400 font-bold mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>COSMIC CREATOR STUDIO SUITE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              Creator Command Deck
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Unified intelligence hub for managing publications, tuning your Creator Twin, co-authoring in real-time, and version time-travel.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Dedicated Pomodoro Command Widget with Global Keyboard Shortcuts */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-purple-500/30">
              <Timer className={`w-4 h-4 ${pomodoroActive ? 'text-purple-400 animate-pulse' : 'text-[var(--text-muted)]'}`} />
              <div className="font-mono leading-tight">
                <div className="text-xs font-bold text-[var(--text-primary)]">
                  {pomodoroMins}:{pomodoroSecs} <span className="text-[10px] text-purple-400 uppercase">{pomodoroMode}</span>
                </div>
                <div className="text-[9px] text-[var(--text-muted)]">Ctrl+Shift+P / Alt+P</div>
              </div>
              <button
                type="button"
                onClick={togglePomodoro}
                className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-1"
              >
                {pomodoroActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{pomodoroActive ? 'Stop Focus' : 'Start Focus'}</span>
              </button>
              <button
                type="button"
                onClick={() => resetPomodoro('focus')}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-white"
                title="Reset 25m Pomodoro"
                aria-label="Reset Pomodoro timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setActiveView('editor')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-sky-500/20 transition-all"
            >
              <PenTool className="w-4 h-4" />
              <span>Open Full Editor</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-[var(--border-color)]">
          {[
            { id: 'overview', label: 'Command Overview', icon: FileText },
            { id: 'twin', label: 'Creator Twin Persona', icon: Dna },
            { id: 'collaborate', label: 'Live Co-Writing Room', icon: Users },
            { id: 'timemachine', label: 'Article Time Machine', icon: History },
            { id: 'quests', label: 'Creator Quests & Streaks', icon: Trophy },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-secondary)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {restoreToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between">
          <span>{restoreToast}</span>
          <button type="button" onClick={() => setRestoreToast(null)} className="text-emerald-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl glass-panel border border-[var(--border-color)]">
              <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-mono mb-2">
                <span>READ VELOCITY</span>
                <TrendingUp className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-white">4.8k / day</p>
              <p className="text-[11px] text-emerald-400 mt-1 font-mono">+18.4% this week</p>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-[var(--border-color)]">
              <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-mono mb-2">
                <span>RETENTION DEPTH</span>
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-white">84.2%</p>
              <p className="text-[11px] text-purple-300 mt-1 font-mono">Top 5% across platform</p>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-[var(--border-color)]">
              <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-mono mb-2">
                <span>CREATOR REPUTATION</span>
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-white">Level 8</p>
              <p className="text-[11px] text-cyan-300 mt-1 font-mono">Cosmic Scholar Tier</p>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-[var(--border-color)]">
              <div className="flex items-center justify-between text-[var(--text-muted)] text-xs font-mono mb-2">
                <span>COLLABORATOR NODES</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-white">14 Active</p>
              <p className="text-[11px] text-emerald-300 mt-1 font-mono">Cross-discipline peers</p>
            </div>
          </div>

          {/* Active Drafts & Content Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl glass-panel border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Drafts & Queued Publications</span>
                </h3>
                <span className="text-xs font-mono text-[var(--text-muted)]">3 Drafts</span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-sky-500/40 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Quantum Graph Attention Mechanics</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Draft (75%)
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Last edited 2 hours ago by NOVA AI</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-sky-500/40 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Neuro-Symbolic Reasoning in Creative Writing</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      Scheduled (Tomorrow 10:00 AM)
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Review approved by Marcus Vance</p>
                </div>
              </div>
            </div>

            {/* Publishing Schedule */}
            <div className="p-6 rounded-3xl glass-panel border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>Editorial Cadence & Scheduled Drops</span>
                </h3>
                <span className="text-xs font-mono text-purple-400">Weekly Target: 2 / 3</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <span className="font-semibold text-white">Nov 10: Multi-Agent Consensus Deep-Dive</span>
                  <span className="text-emerald-400 font-mono">READY TO PUBLISH</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <span className="font-semibold text-white">Nov 13: The Future of Spatial Feeds</span>
                  <span className="text-sky-400 font-mono">OUTLINE APPROVED</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                  <span className="font-semibold text-white">Nov 17: Community AMA in Quantum Systems</span>
                  <span className="text-purple-400 font-mono">SCHEDULED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Creator Twin Persona Configurator */}
      {activeTab === 'twin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-3xl glass-panel border border-[var(--border-color)] space-y-6">
            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                SYNTHETIC WRITING PERSONA
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Creator Twin Calibration</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Customize your AI proxy's stylistic tone, cognitive preferences, and prohibited clichés.
              </p>
            </div>

            {/* Tone Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-primary)]">Base Tone Archetype</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['analytical', 'visionary', 'conversational', 'academic'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTwinConfig((prev) => ({ ...prev, tone: t }))}
                    className={`py-2 px-3 rounded-xl text-xs font-mono uppercase capitalize transition-all ${
                      twinConfig.tone === t
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                  <span>Creativity & Metaphor Level</span>
                  <span className="font-mono text-cyan-400">{twinConfig.creativityLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={twinConfig.creativityLevel}
                  onChange={(e) =>
                    setTwinConfig((prev) => ({ ...prev, creativityLevel: Number(e.target.value) }))
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                  <span>Conciseness vs Detailed Exposition</span>
                  <span className="font-mono text-purple-400">{twinConfig.concisenessLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={twinConfig.concisenessLevel}
                  onChange={(e) =>
                    setTwinConfig((prev) => ({ ...prev, concisenessLevel: Number(e.target.value) }))
                  }
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                  <span>Technical Rigor & Mathematical Depth</span>
                  <span className="font-mono text-sky-400">{twinConfig.technicalDepthLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={twinConfig.technicalDepthLevel}
                  onChange={(e) =>
                    setTwinConfig((prev) => ({ ...prev, technicalDepthLevel: Number(e.target.value) }))
                  }
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Banned Clichés */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-primary)]">Banned Clichés & Overused Tropes</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {twinConfig.bannedCliches.map((cliche) => (
                  <span
                    key={cliche}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs bg-rose-500/10 text-rose-300 border border-rose-500/20"
                  >
                    <span>{cliche}</span>
                    <button
                      onClick={() => handleRemoveBannedCliche(cliche)}
                      className="hover:text-rose-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCliche}
                  onChange={(e) => setNewCliche(e.target.value)}
                  placeholder="e.g. In a nutshell..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-white"
                />
                <button
                  onClick={handleAddBannedCliche}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30 transition-colors"
                >
                  Add Filter
                </button>
              </div>
            </div>

            {/* Sample Topic Prompt */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-primary)]">Test Topic Prompt</label>
              <input
                type="text"
                value={testTopic}
                onChange={(e) => setTestTopic(e.target.value)}
                placeholder="Topic to synthesize in your Creator Twin voice..."
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-white"
              />
            </div>

            {/* Custom Directive */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-primary)]">System Directive for Synthesis</label>
              <textarea
                value={twinConfig.customDirective}
                onChange={(e) => setTwinConfig((prev) => ({ ...prev, customDirective: e.target.value }))}
                rows={3}
                className="w-full p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-white resize-none"
              />
            </div>

            <button
              onClick={handleTestVoice}
              disabled={isGeneratingSample}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGeneratingSample ? 'Synthesizing Persona Voice...' : 'Test Persona Voice Synthesis'}</span>
            </button>
          </div>

          {/* Persona Output Preview */}
          <div className="p-6 rounded-3xl glass-panel border border-[var(--border-color)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-4">
                <h3 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                  <Dna className="w-4 h-4 text-cyan-400" />
                  <span>Persona Voice Output Simulation</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-400">ACTIVE MODEL</span>
              </div>

              {testSampleOutput ? (
                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-cyan-500/30 text-xs text-cyan-200/90 leading-relaxed font-mono whitespace-pre-wrap">
                  {testSampleOutput}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-[var(--text-muted)] space-y-3">
                  <Sliders className="w-8 h-8 text-slate-500 mx-auto" />
                  <p>Click "Test Persona Voice Synthesis" to preview generated article snippets adhering to your guidelines.</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-[var(--border-color)] mt-6 text-xs text-[var(--text-muted)]">
              <p className="font-mono text-[11px] text-sky-400 font-semibold mb-1">NOVA PROXY COMPATIBILITY:</p>
              <p>When enabled, NOVA uses this calibration when drafting publications and responding in Creator Rooms.</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Live Co-Writing Room */}
      {activeTab === 'collaborate' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="font-bold text-sm text-white">Live Real-Time Co-Authoring Session</h3>
            </div>
            <div className="flex items-center gap-2">
              {activeCollaborators.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-[var(--bg-secondary)] border border-[var(--border-color)]"
                >
                  <span className={`w-2 h-2 rounded-full ${c.color}`} />
                  <span className="text-white">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Editor */}
            <div className="lg:col-span-2 p-6 rounded-3xl glass-panel border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                <span className="text-xs font-mono text-sky-400">SHARED WORKING DOCUMENT</span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">SYNCHRONIZED</span>
              </div>
              <textarea
                value={collabDocument}
                onChange={(e) => setCollabDocument(e.target.value)}
                rows={12}
                className="w-full p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs sm:text-sm text-white font-mono leading-relaxed resize-none focus:outline-none focus:border-sky-500/50"
              />
            </div>

            {/* Suggestions Stream */}
            <div className="p-6 rounded-3xl glass-panel border border-[var(--border-color)] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                <h3 className="font-bold text-xs text-white uppercase tracking-wider font-mono">
                  Incoming Suggestions
                </h3>
                <span className="text-[10px] font-mono text-purple-400">2 PENDING</span>
              </div>

              <div className="space-y-3">
                {pendingSuggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                      sug.accepted
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : sug.rejected
                        ? 'bg-rose-500/10 border-rose-500/30 opacity-60'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-sky-300 font-bold">{sug.author}</span>
                      {sug.accepted ? (
                        <span className="text-emerald-400">ACCEPTED</span>
                      ) : sug.rejected ? (
                        <span className="text-rose-400">DECLINED</span>
                      ) : (
                        <span className="text-amber-400">REVIEW</span>
                      )}
                    </div>
                    <div className="text-[11px] line-through text-rose-300/80">
                      "{sug.original}"
                    </div>
                    <div className="text-[11px] text-emerald-300 font-medium">
                      "{sug.replacement}"
                    </div>
                    {!sug.accepted && !sug.rejected && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleApplySuggestion(sug.id, true)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold hover:bg-emerald-500/30 transition-colors"
                        >
                          <Check className="w-3 h-3" /> Accept
                        </button>
                        <button
                          onClick={() => handleApplySuggestion(sug.id, false)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 text-[11px] font-semibold hover:bg-rose-500/30 transition-colors"
                        >
                          <X className="w-3 h-3" /> Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Article Time Machine */}
      {activeTab === 'timemachine' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-[var(--border-color)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                  VERSION TIMELINE
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Article Time Machine</h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Compare historical snapshots, inspect algorithmic rewrites, and restore previous states.
                </p>
              </div>

              {/* Version Selector Buttons */}
              <div className="flex items-center gap-2">
                {revisions.map((rev) => (
                  <button
                    key={rev.id}
                    onClick={() => setSelectedRevision(rev)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                      selectedRevision.id === rev.id
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-white'
                    }`}
                  >
                    {rev.version}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Version Viewer */}
            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3 font-mono text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--border-color)] text-[11px]">
                <span className="text-purple-300 font-bold">{selectedRevision.title}</span>
                <span className="text-[var(--text-muted)]">{selectedRevision.timestamp} • By {selectedRevision.authorName}</span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                {selectedRevision.content}
              </p>
              <div className="pt-2 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-sky-400">
                <span>Summary of changes: {selectedRevision.changeSummary}</span>
                <button
                  type="button"
                  onClick={handleRestoreRevision}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 font-semibold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Draft to Co-Writing Room</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Creator Quests & Streaks */}
      {activeTab === 'quests' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-[var(--border-color)] space-y-4">
            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                INTELLECTUAL MILESTONES
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Creator Quests & Streaks</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Complete research milestones to unlock reputation badges and elevate your presence in the Idea Constellation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {quests.map((quest) => (
                <div
                  key={quest.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    quest.completed
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                      +{quest.xpReward} XP
                    </span>
                    {quest.completed && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        COMPLETED
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-white">{quest.title}</h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {quest.description}
                  </p>
                  <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
                    <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)] mb-1">
                      <span>Progress</span>
                      <span>
                        {quest.progress} / {quest.maxProgress}
                      </span>
                    </div>
                    <div className="w-full bg-[var(--bg-primary)] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full transition-all"
                        style={{ width: `${(quest.progress / quest.maxProgress) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
