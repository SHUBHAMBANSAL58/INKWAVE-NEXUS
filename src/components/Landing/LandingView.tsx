import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CosmicCanvas } from '../Cosmic/CosmicCanvas';
import {
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
  Compass,
  Radio,
  BookOpen,
  Share2,
  Users,
  Dna,
  ShieldCheck,
  CheckCircle2,
  PenTool,
  Zap,
} from 'lucide-react';

export function LandingView() {
  const { setActiveView, setIsNovaOpen, posts, tasks, communities } = useApp();
  const [activeFeatureTab, setActiveFeatureTab] = useState<'agents' | 'constellation' | 'twin' | 'reading'>('agents');

  return (
    <div className="space-y-16 pb-12">
      {/* Cinematic Hero Section */}
      <section className="relative rounded-3xl overflow-hidden border border-[var(--border-color)] bg-gradient-to-b from-[var(--bg-secondary)] via-[var(--bg-primary)] to-[var(--bg-primary)] p-6 sm:p-10 lg:p-16 text-center">
        {/* Subtle Ambient Cosmic Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-80 bg-gradient-to-b from-sky-500/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-10 w-64 h-64 bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Cosmic Tagline Capsule */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-mono font-semibold tracking-wide shadow-lg shadow-sky-500/10">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-300" style={{ animationDuration: '6s' }} />
            <span>INKWAVE NEXUS: COSMIC EDITION</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
            ENTER THE UNIVERSE OF <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              IDEAS.
            </span>
          </h1>

          {/* Tagline & Supporting Copy */}
          <p className="text-lg sm:text-xl font-medium text-sky-200/90 tracking-wide font-mono">
            &ldquo;Where Ideas Become Universes.&rdquo;
          </p>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Create extraordinary content. Discover intelligent communities. Connect through ideas. Powered by a new generation of autonomous multi-agent intelligence.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setActiveView('feed')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 group"
            >
              <Compass className="w-4 h-4 text-white" />
              <span>Explore INKWAVE</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setIsNovaOpen(true)}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] border border-sky-400/40 text-sky-300 font-bold text-sm shadow-lg transition-all hover:scale-105 active:scale-95 group"
            >
              <Sparkles className="w-4 h-4 text-sky-400 group-hover:rotate-12 transition-transform" />
              <span>Meet NOVA AI</span>
            </button>

            <button
              onClick={() => setActiveView('constellation')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-white font-semibold text-sm transition-all"
            >
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>3D Constellation</span>
            </button>
          </div>

          {/* Live Platform Proof Counters */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[var(--border-color)]/60 text-left">
            <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
              <p className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Autonomous Mesh</p>
              <p className="text-xl font-bold font-mono text-sky-400">4 Core Agents</p>
              <p className="text-[11px] text-[var(--text-secondary)]">Plan • Design • Build • Test</p>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
              <p className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Active Publications</p>
              <p className="text-xl font-bold font-mono text-purple-400">{posts.length} Curated</p>
              <p className="text-[11px] text-[var(--text-secondary)]">Peer & Agent Verified</p>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
              <p className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Community Worlds</p>
              <p className="text-xl font-bold font-mono text-cyan-400">{communities.length} Worlds</p>
              <p className="text-[11px] text-[var(--text-secondary)]">Knowledge Clusters</p>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
              <p className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Local Offline Sync</p>
              <p className="text-xl font-bold font-mono text-emerald-400">100% PWA Ready</p>
              <p className="text-[11px] text-[var(--text-secondary)]">Zero Data Loss</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 3D Cosmic Constellation Preview */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-sky-400 font-bold mb-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Interactive 3D Digital Universe</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Explore the Idea Constellation
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Nodes reflect real articles, active topics, creators, and community worlds in real-time.
            </p>
          </div>
          <button
            onClick={() => setActiveView('constellation')}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold font-mono transition-all"
          >
            <span>Launch Fullscreen Universe</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3D Canvas Canvas Embedding */}
        <CosmicCanvas interactive={true} heightClass="h-[460px]" />
      </section>

      {/* Interactive Feature Showcase with Live Demos */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            Designed for Intellectual Pioneers
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Explore the four cornerstones of the Cosmic Edition architecture.
          </p>
        </div>

        {/* Interactive Feature Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-[var(--border-color)] pb-3">
          {[
            { id: 'agents', label: 'NEXUS Multi-Agent Mesh', icon: Cpu },
            { id: 'constellation', label: 'Idea Constellation & Graph', icon: Share2 },
            { id: 'twin', label: 'Creator Twin & Command Deck', icon: Dna },
            { id: 'reading', label: 'Deep Space Reading Mode', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFeatureTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFeatureTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-md shadow-sky-500/10'
                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-secondary)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-[var(--border-color)]">
          {activeFeatureTab === 'agents' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                  AUTONOMOUS AGENT PROTOCOL
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  NEXUS CORE: 4-Agent Orchestration
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Every proposal flows through an automated, human-in-the-loop pipeline: PLANNER builds the roadmap, DESIGNER architects design tokens and layout specifications, BUILDER generates clean code, and TESTER verifies unit test execution and performance scores.
                </p>
                <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Strict state machine transitions with verification gates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Automated bug reproduction steps and severity ranking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Human approval before irreversible deployments
                  </li>
                </ul>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveView('nexus-core')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/30 font-semibold text-xs transition-colors"
                  >
                    <span>Launch Agent Orchestrator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                  <span className="text-sky-400 font-bold">PIPELINE EXECUTION LOG</span>
                  <span className="text-[10px] text-emerald-400">STATUS: HEALTHY</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2 rounded bg-[var(--bg-primary)] border border-sky-500/20 text-sky-300">
                    <span className="text-[var(--text-muted)]">[00:01]</span> PLANNER: Objectives formalized (3 acceptance criteria).
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-primary)] border border-purple-500/20 text-purple-300">
                    <span className="text-[var(--text-muted)]">[00:02]</span> DESIGNER: Cosmic color architecture and token tokens derived.
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-primary)] border border-cyan-500/20 text-cyan-300">
                    <span className="text-[var(--text-muted)]">[00:04]</span> BUILDER: Modular components compiled.
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-primary)] border border-emerald-500/20 text-emerald-300">
                    <span className="text-[var(--text-muted)]">[00:05]</span> TESTER: 9/9 automated suites passed. Ready for approval.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'constellation' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                  KNOWLEDGE TOPOLOGY
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  Non-Linear Idea Exploration
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Break free from rectangular algorithmic feeds. In INKWAVE NEXUS, ideas are spatial nodes in a living constellation. Discover connections between distributed systems, neuro-design, and quantum mechanics that traditional algorithms conceal.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveView('constellation')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 font-semibold text-xs transition-colors"
                  >
                    <span>Open 3D Constellation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveView('knowledge-graph')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)] font-semibold text-xs transition-colors"
                  >
                    <span>2D Force Graph</span>
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-center space-y-3">
                <Share2 className="w-12 h-12 text-purple-400 mx-auto animate-pulse" />
                <h4 className="font-bold text-white">Spatial Knowledge Engine</h4>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  Calculates real graph distances, citation linkages, and co-authorship relationships across all platform publications.
                </p>
              </div>
            </div>
          )}

          {activeFeatureTab === 'twin' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                  CREATOR CO-PILOT
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  Creator Twin & Command Deck
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Train a personalized AI Persona based on your unique vocabulary richness, structural cadence, and philosophical tone. Collaborate with live presence simulations and travel through article versions with the Article Time Machine.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveView('creator-deck')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 font-semibold text-xs transition-colors"
                  >
                    <span>Enter Creator Command Deck</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                  <span className="text-cyan-400 font-bold">CREATOR TWIN VOICE CALIBRATION</span>
                  <span className="text-[10px] text-emerald-400">ACTIVE</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] text-[var(--text-muted)] mb-1">
                      <span>Analytical Rigor</span>
                      <span className="text-cyan-400">92%</span>
                    </div>
                    <div className="w-full bg-[var(--bg-primary)] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full w-[92%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-[var(--text-muted)] mb-1">
                      <span>Metaphor & Narrative</span>
                      <span className="text-purple-400">85%</span>
                    </div>
                    <div className="w-full bg-[var(--bg-primary)] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-400 h-full w-[85%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-[var(--text-muted)] mb-1">
                      <span>Conciseness vs Depth</span>
                      <span className="text-sky-400">88%</span>
                    </div>
                    <div className="w-full bg-[var(--bg-primary)] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-sky-400 h-full w-[88%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'reading' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                  DISTRACTION FREE
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                  Deep Space Reading Mode
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Immerse your consciousness in pristine ideas. Deep Space Mode eliminates all extraneous feeds, provides custom typographic scaling, and introduces subtle cosmic soundscapes for unparalleled intellectual focus.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveView('feed')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-semibold text-xs transition-colors"
                  >
                    <span>Read an Article in Deep Space</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#030509] border border-sky-500/20 text-slate-300 space-y-3 font-serif">
                <p className="text-xs uppercase font-mono text-sky-400 tracking-wider">PREVIEW • DEEP SPACE</p>
                <h4 className="text-lg font-bold text-white font-sans">
                  The Architecture of Thought in High-Dimensional Embedding Spaces
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  &ldquo;When thoughts transcend tabular structures, words behave like celestial bodies orbiting semantic gravitational fields...&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Direct Call to Action Footer */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-sky-950/60 via-indigo-950/40 to-purple-950/60 border border-sky-500/30 text-center space-y-6">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
          Ready to reshape how knowledge is published?
        </h2>
        <p className="text-sm sm:text-base text-sky-200/80 max-w-xl mx-auto">
          Join thousands of thinkers, engineers, and creators building universes of ideas.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setActiveView('editor')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-sky-500/25 transition-all"
          >
            <PenTool className="w-4 h-4" />
            <span>Open Creator Studio</span>
          </button>
          <button
            onClick={() => setActiveView('nexus-core')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] text-white font-semibold text-sm transition-all"
          >
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>Deploy First Agent Task</span>
          </button>
        </div>
      </section>
    </div>
  );
}
