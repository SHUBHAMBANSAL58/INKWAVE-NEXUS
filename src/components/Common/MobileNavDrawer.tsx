import React, { useEffect } from 'react';
import { ActiveView } from '../../context/AppContext';
import {
  X,
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
  Sparkles,
  Zap,
  Bot,
  Rocket,
} from 'lucide-react';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  pendingApprovalsCount: number;
}

const ALL_VIEWS: {
  id: ActiveView;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'landing', label: 'Cosmic Universe', badge: 'COSMIC', icon: Sparkles },
  { id: 'feed', label: 'Feed & Discover', icon: Compass },
  { id: 'ai-studio', label: 'Gemini AI Studio', badge: 'AI', icon: Bot },
  { id: 'cosmic-game', label: '3D Stellar Drift', badge: 'GAME', icon: Rocket },
  { id: 'nexus-core', label: 'NEXUS CORE (4-Agents)', badge: 'CORE', icon: Cpu },
  { id: 'constellation', label: 'Idea Constellation 3D', badge: '3D', icon: Share2 },
  { id: 'creator-deck', label: 'Creator Command Deck', badge: 'DECK', icon: Zap },
  { id: 'editor', label: 'AI Creator Studio', icon: PenTool },
  { id: 'communities', label: 'Community Worlds', icon: Globe },
  { id: 'knowledge-graph', label: 'Knowledge Graph', icon: Share2 },
  { id: 'creator-dna', label: 'Creator DNA', icon: Dna },
  { id: 'library', label: 'Personal Library', icon: BookMarked },
  { id: 'analytics', label: 'Creator Analytics', icon: BarChart3 },
  { id: 'messages', label: 'Direct Messages', icon: MessageSquare },
  { id: 'admin', label: 'Platform Command', icon: ShieldCheck },
];

export function MobileNavDrawer({
  isOpen,
  onClose,
  activeView,
  onSelectView,
  pendingApprovalsCount,
}: MobileNavDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="md:hidden fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Workspace Navigation Menu"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[82vw] max-w-xs h-full bg-[var(--bg-primary)] border-l border-[var(--border-color)] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-color)]">
          <div>
            <p className="font-bold text-sm text-[var(--text-primary)]">Workspace Modules</p>
            <p className="text-[10px] font-mono text-[var(--text-muted)]">All 15 INKWAVE NEXUS views</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close workspace navigation"
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {ALL_VIEWS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectView(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                <span className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.id === 'nexus-core' && pendingApprovalsCount > 0 ? (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {pendingApprovalsCount} req
                  </span>
                ) : item.badge ? (
                  <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
