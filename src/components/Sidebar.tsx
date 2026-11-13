import React from 'react';
import { useApp, ActiveView } from '../context/AppContext';
import {
  Compass,
  Cpu,
  PenTool,
  Globe,
  Share2,
  Dna,
  BookMarked,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Zap,
  Bot,
  Rocket,
} from 'lucide-react';

interface NavItem {
  id: ActiveView;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'landing', label: 'Cosmic Universe', badge: 'COSMIC', icon: Sparkles, accentColor: 'text-cyan-400' },
  { id: 'feed', label: 'Feed & Discover', icon: Compass },
  { id: 'ai-studio', label: 'Gemini AI Studio', badge: 'AI', icon: Bot, accentColor: 'text-cyan-400' },
  { id: 'cosmic-game', label: '3D Stellar Drift', badge: 'GAME', icon: Rocket, accentColor: 'text-purple-400' },
  { id: 'nexus-core', label: 'NEXUS CORE (4-Agents)', badge: 'CORE', icon: Cpu, accentColor: 'text-sky-400' },
  { id: 'constellation', label: 'Idea Constellation 3D', badge: '3D', icon: Share2, accentColor: 'text-purple-400' },
  { id: 'creator-deck', label: 'Creator Command Deck', badge: 'DECK', icon: Zap, accentColor: 'text-amber-400' },
  { id: 'editor', label: 'AI Creator Studio', icon: PenTool, accentColor: 'text-violet-400' },
  { id: 'communities', label: 'Community Worlds', icon: Globe },
  { id: 'knowledge-graph', label: 'Knowledge Graph', icon: Share2, accentColor: 'text-cyan-400' },
  { id: 'creator-dna', label: 'Creator DNA', icon: Dna, accentColor: 'text-emerald-400' },
  { id: 'library', label: 'Personal Library', icon: BookMarked },
  { id: 'analytics', label: 'Creator Analytics', icon: BarChart3 },
  { id: 'messages', label: 'Direct Messages', icon: MessageSquare },
  { id: 'admin', label: 'Platform Command', icon: ShieldCheck },
];

export function Sidebar() {
  const { activeView, setActiveView, tasks } = useApp();

  const pendingApprovalsCount = tasks.filter((t) => t.status === 'awaiting_approval').length;

  return (
    <aside className="w-64 shrink-0 hidden md:block py-6 border-r border-[var(--border-color)] min-h-[calc(100vh-4rem)]">
      <div className="sticky top-20 px-4 space-y-6">
        <div>
          <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-[var(--text-muted)] font-semibold mb-2">
            Workspace Navigation
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm shadow-sky-500/10 font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? item.accentColor || 'text-sky-400' : 'text-[var(--text-muted)]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.id === 'nexus-core' && pendingApprovalsCount > 0 ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                      {pendingApprovalsCount} req
                    </span>
                  ) : item.badge ? (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Multi-Agent Live Status Capsule */}
        <div className="p-3.5 rounded-2xl glass-panel border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              NEXUS MESH
            </span>
            <span className="text-[10px] font-mono text-sky-400">4 / 4 ONLINE</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono text-[var(--text-secondary)]">
            <div className="px-1.5 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between gap-1">
              <span>PLANNER</span>
              <span className="text-emerald-400">READY</span>
            </div>
            <div className="px-1.5 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between gap-1">
              <span>DESIGNER</span>
              <span className="text-emerald-400">READY</span>
            </div>
            <div className="px-1.5 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between gap-1">
              <span>BUILDER</span>
              <span className="text-sky-400">ACTIVE</span>
            </div>
            <div className="px-1.5 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between gap-1">
              <span>TESTER</span>
              <span className="text-emerald-400">READY</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
