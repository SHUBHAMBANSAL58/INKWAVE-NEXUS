import React, { useState, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { FeedView } from './components/Feed/FeedView';
import { NovaAssistant } from './components/Nova/NovaAssistant';
import { ArticleReaderModal } from './components/Article/ArticleReaderModal';
import { OfflineIndicator } from './components/Common/OfflineIndicator';
import { KeyboardShortcutsModal } from './components/Common/KeyboardShortcutsModal';
import { GlobalQuickAddModal } from './components/Common/GlobalQuickAddModal';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { MobileNavDrawer } from './components/Common/MobileNavDrawer';
import { Compass, Cpu, PenTool, Globe, Sparkles, Menu, Plus, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

const LandingView = lazy(() => import('./components/Landing/LandingView').then((m) => ({ default: m.LandingView })));
const CosmicAiStudioView = lazy(() => import('./components/AIStudio/CosmicAiStudioView').then((m) => ({ default: m.CosmicAiStudioView })));
const CosmicGameView = lazy(() => import('./components/Game/CosmicGameView').then((m) => ({ default: m.CosmicGameView })));
const NexusCoreView = lazy(() => import('./components/NexusCore/NexusCoreView').then((m) => ({ default: m.NexusCoreView })));
const ConstellationView = lazy(() => import('./components/Constellation/ConstellationView').then((m) => ({ default: m.ConstellationView })));
const CreatorCommandDeck = lazy(() => import('./components/CreatorDeck/CreatorCommandDeck').then((m) => ({ default: m.CreatorCommandDeck })));
const EditorView = lazy(() => import('./components/Editor/EditorView').then((m) => ({ default: m.EditorView })));
const CommunitiesView = lazy(() => import('./components/Communities/CommunitiesView').then((m) => ({ default: m.CommunitiesView })));
const KnowledgeGraphView = lazy(() => import('./components/KnowledgeGraph/KnowledgeGraphView').then((m) => ({ default: m.KnowledgeGraphView })));
const CreatorDnaView = lazy(() => import('./components/CreatorDNA/CreatorDnaView').then((m) => ({ default: m.CreatorDnaView })));
const LibraryView = lazy(() => import('./components/Library/LibraryView').then((m) => ({ default: m.LibraryView })));
const AnalyticsView = lazy(() => import('./components/Analytics/AnalyticsView').then((m) => ({ default: m.AnalyticsView })));
const MessagesView = lazy(() => import('./components/Messages/MessagesView').then((m) => ({ default: m.MessagesView })));
const AdminView = lazy(() => import('./components/Admin/AdminView').then((m) => ({ default: m.AdminView })));

function ViewLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] gap-3 text-center">
      <Loader2 className="w-7 h-7 text-sky-400 animate-spin" />
      <p className="text-xs font-mono text-[var(--text-muted)]">Initializing workspace module...</p>
    </div>
  );
}

function AppContent() {
  const {
    activeView,
    setActiveView,
    tasks,
    isNovaOpen,
    setIsNovaOpen,
    isOnline,
    showShortcutsHelp,
    setShowShortcutsHelp,
  } = useApp();

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [quickAddToast, setQuickAddToast] = useState<string | null>(null);

  const pendingApprovalsCount = tasks.filter((t) => t.status === 'awaiting_approval').length;

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
          <ErrorBoundary key={activeView} onReset={() => setActiveView('feed')}>
            <Suspense fallback={<ViewLoadingFallback />}>
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
            </Suspense>
          </ErrorBoundary>
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

      {/* Mobile Full Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeView={activeView}
        onSelectView={setActiveView}
        pendingApprovalsCount={pendingApprovalsCount}
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
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/90 backdrop-blur-xl px-2 py-2 flex items-center justify-around text-[10px] font-mono">
        <button
          type="button"
          onClick={() => setActiveView('feed')}
          className={`flex flex-col items-center gap-1 p-1 ${
            activeView === 'feed' ? 'text-sky-400 font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Feed</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('nexus-core')}
          className={`flex flex-col items-center gap-1 p-1 ${
            activeView === 'nexus-core' ? 'text-sky-400 font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <Cpu className="w-5 h-5" />
          <span>NEXUS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('editor')}
          className={`flex flex-col items-center gap-1 p-1 ${
            activeView === 'editor' ? 'text-violet-400 font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <PenTool className="w-5 h-5" />
          <span>Studio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('communities')}
          className={`flex flex-col items-center gap-1 p-1 ${
            activeView === 'communities' ? 'text-cyan-400 font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <Globe className="w-5 h-5" />
          <span>Worlds</span>
        </button>

        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          aria-label="Open all workspace views"
          className={`flex flex-col items-center gap-1 p-1 ${
            isMobileDrawerOpen ? 'text-sky-400 font-bold' : 'text-[var(--text-muted)]'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="INKWAVE NEXUS Core Recovery">
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
