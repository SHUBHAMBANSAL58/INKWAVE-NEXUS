import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { FeedView } from './components/Feed/FeedView';
import { NexusCoreView } from './components/NexusCore/NexusCoreView';
import { EditorView } from './components/Editor/EditorView';
import { CommunitiesView } from './components/Communities/CommunitiesView';
import { KnowledgeGraphView } from './components/KnowledgeGraph/KnowledgeGraphView';
import { CreatorDnaView } from './components/CreatorDNA/CreatorDnaView';
import { LibraryView } from './components/Library/LibraryView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { MessagesView } from './components/Messages/MessagesView';
import { AdminView } from './components/Admin/AdminView';
import { LandingView } from './components/Landing/LandingView';
import { ConstellationView } from './components/Constellation/ConstellationView';
import { CreatorCommandDeck } from './components/CreatorDeck/CreatorCommandDeck';
import { CosmicAiStudioView } from './components/AIStudio/CosmicAiStudioView';
import { CosmicGameView } from './components/Game/CosmicGameView';
import { NovaAssistant } from './components/Nova/NovaAssistant';
import { ArticleReaderModal } from './components/Article/ArticleReaderModal';
import { OfflineIndicator } from './components/Common/OfflineIndicator';
import { KeyboardShortcutsModal } from './components/Common/KeyboardShortcutsModal';
import { GlobalQuickAddModal } from './components/Common/GlobalQuickAddModal';
import { Compass, Cpu, PenTool, Globe, Sparkles, MessageSquare, Plus, CheckCircle2, ArrowRight } from 'lucide-react';

function AppContent() {
  const {
    activeView,
    setActiveView,
    isNovaOpen,
    setIsNovaOpen,
    isOnline,
    showShortcutsHelp,
    setShowShortcutsHelp,
  } = useApp();

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddToast, setQuickAddToast] = useState<string | null>(null);

  const handleQuickAddCreated = (taskTitle: string) => {
    setQuickAddToast(taskTitle);
    setTimeout(() => {
      setQuickAddToast((curr) => (curr === taskTitle ? null : curr));
    }, 5000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Workspace Frame */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Left Desktop Sidebar */}
        <Sidebar />

        {/* View Surface */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-36 md:pb-28">
          {activeView === 'landing' && <LandingView />}
          {activeView === 'feed' && <FeedView />}
          {activeView === 'ai-studio' && <CosmicAiStudioView />}
          {activeView === 'cosmic-game' && <CosmicGameView />}
          {activeView === 'nexus-core' && <NexusCoreView />}
          {activeView === 'constellation' && <ConstellationView />}
          {activeView === 'creator-deck' && <CreatorCommandDeck />}
          {activeView === 'editor' && <EditorView />}
          {activeView === 'communities' && <CommunitiesView />}
          {activeView === 'knowledge-graph' && <KnowledgeGraphView />}
          {activeView === 'creator-dna' && <CreatorDnaView />}
          {activeView === 'library' && <LibraryView />}
          {activeView === 'analytics' && <AnalyticsView />}
          {activeView === 'messages' && <MessagesView />}
          {activeView === 'admin' && <AdminView />}
        </main>
      </div>

      {/* Interactive Article Reader Modal */}
      <ArticleReaderModal />

      {/* Floating NOVA Assistant Drawer */}
      <NovaAssistant />

      {/* Offline Status Toast */}
      <OfflineIndicator isOnline={isOnline} />

      {/* Global Keyboard Shortcuts Cheatsheet Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />

      {/* Global Quick-Add Task Modal */}
      <GlobalQuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onTaskCreated={handleQuickAddCreated}
      />

      {/* Quick-Add Confirmation Toast */}
      {quickAddToast && (
        <div
          role="status"
          className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-40 max-w-sm rounded-2xl glass-panel border border-emerald-500/40 bg-[var(--bg-primary)]/95 px-4 py-3 shadow-2xl flex items-center gap-3"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
              Added: {quickAddToast}
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveView('nexus-core');
                setQuickAddToast(null);
              }}
              className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-mono text-sky-400 hover:text-sky-300"
            >
              <span>Open in NEXUS CORE</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom-Right Floating Action Dock (Quick-Add + Summon NOVA) */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex flex-col items-end gap-2.5">
        <button
          type="button"
          onClick={() => setIsQuickAddOpen(true)}
          aria-label="Global Quick-Add Task"
          title="Quick-Add New Task"
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="font-mono whitespace-nowrap">Quick Add</span>
        </button>

        {!isNovaOpen && (
          <button
            type="button"
            onClick={() => setIsNovaOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-sky-500 via-indigo-600 to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all group"
            title="Summon NOVA AI Assistant"
          >
            <div className="relative">
              <Sparkles className="w-4 h-4 animate-spin text-white" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-1 -right-1" />
            </div>
            <span className="font-mono whitespace-nowrap">Summon NOVA</span>
          </button>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/90 backdrop-blur-xl px-2 py-2 flex items-center justify-around text-[10px] font-mono">
        <button
          onClick={() => setActiveView('feed')}
          className={`flex flex-col items-center gap-1 p-1 ${
            activeView === 'feed' ? 'text-sky-400 font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Feed</span>
        </button>

        <button
          onClick={() => setActiveView('nexus-core')}
          className={`flex flex-col items-center gap-1 p-1 ${
            activeView === 'nexus-core' ? 'text-sky-400 font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <Cpu className="w-5 h-5" />
          <span>NEXUS</span>
        </button>

        <button
          onClick={() => setActiveView('editor')}
          className={`flex flex-col items-center gap-1 p-1 ${
            activeView === 'editor' ? 'text-violet-400 font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <PenTool className="w-5 h-5" />
          <span>Studio</span>
        </button>

        <button
          onClick={() => setActiveView('communities')}
          className={`flex flex-col items-center gap-1 p-1 ${
            activeView === 'communities' ? 'text-cyan-400 font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <Globe className="w-5 h-5" />
          <span>Worlds</span>
        </button>

        <button
          onClick={() => setActiveView('messages')}
          className={`flex flex-col items-center gap-1 p-1 ${
            activeView === 'messages' ? 'text-sky-400 font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Messages</span>
        </button>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
