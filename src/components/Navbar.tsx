import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { OTHER_USERS, CURRENT_USER, INITIAL_KNOWLEDGE_NODES } from '../mockData';
import { ThemeToggle } from './Common/ThemeToggle';
import {
  buildGlobalSearchDocuments,
  searchGlobalContent,
  GlobalSearchResult,
  SearchEntityKind,
} from '../utils/globalSearch';
import {
  Sparkles,
  Search,
  Bell,
  PenTool,
  CheckCircle,
  Cpu,
  ChevronDown,
  Keyboard,
  WifiOff,
  Timer,
  X,
  CheckSquare,
  BookOpen,
  FileText,
  ArrowUpRight,
} from 'lucide-react';

export function Navbar() {
  const {
    currentUser,
    setCurrentUser,
    theme,
    notifications,
    markNotificationRead,
    isNovaOpen,
    setIsNovaOpen,
    setActiveView,
    searchQuery,
    setSearchQuery,
    setSelectedArticle,
    setFocusedTaskId,
    setFocusedNodeId,
    tasks,
    posts,
    libraryItems,
    communities,
    isOnline,
    setShowShortcutsHelp,
    pomodoroActive,
    pomodoroSecondsLeft,
    pomodoroMode,
    togglePomodoro,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchCategory, setSearchCategory] = useState<SearchEntityKind | 'all'>('all');
  const [activeIndex, setActiveIndex] = useState(-1);

  const notifRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Index Tasks, Knowledge Base Articles/Nodes, and Community Posts for Fuse.js
  const searchDocuments = useMemo(
    () =>
      buildGlobalSearchDocuments({
        tasks,
        posts,
        knowledgeNodes: INITIAL_KNOWLEDGE_NODES,
        libraryItems,
        communities,
      }),
    [tasks, posts, libraryItems, communities]
  );

  const searchOutput = useMemo(
    () =>
      searchGlobalContent(searchDocuments, searchQuery, {
        category: searchCategory,
        limit: 15,
      }),
    [searchDocuments, searchQuery, searchCategory]
  );

  // Also compute total unfiltered counts across categories when query is active
  const allCategoryCounts = useMemo(() => {
    if (!searchQuery.trim()) return { all: 0, task: 0, knowledge: 0, post: 0 };
    const full = searchGlobalContent(searchDocuments, searchQuery, { category: 'all', limit: 30 });
    return {
      all: full.totalCount,
      task: full.grouped.task.length,
      knowledge: full.grouped.knowledge.length,
      post: full.grouped.post.length,
    };
  }, [searchDocuments, searchQuery]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [searchQuery, searchCategory]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowUserMenu(false);
        setIsSearchOpen(false);
        setShowMobileSearch(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectSearchResult = (item: GlobalSearchResult) => {
    if (item.kind === 'task') {
      setFocusedTaskId(item.entityId);
      setActiveView('nexus-core');
    } else if (item.kind === 'knowledge') {
      if (item.targetView === 'knowledge-graph' && item.nodeId) {
        setFocusedNodeId(item.nodeId);
        setActiveView('knowledge-graph');
      } else if (item.postRef) {
        setActiveView('library');
        setSelectedArticle(item.postRef);
      } else {
        setActiveView('knowledge-graph');
      }
    } else if (item.kind === 'post') {
      if (item.targetView === 'communities') {
        setActiveView('communities');
      } else if (item.postRef) {
        setActiveView('feed');
        setSelectedArticle(item.postRef);
      } else {
        setActiveView('feed');
      }
    }

    setIsSearchOpen(false);
    setShowMobileSearch(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchOpen && searchQuery.trim()) {
      setIsSearchOpen(true);
    }

    const items = searchOutput.results;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length > 0) {
        setActiveIndex((prev) => (prev + 1) % items.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length > 0) {
        setActiveIndex((prev) => (prev <= 0 ? items.length - 1 : prev - 1));
      }
    } else if (e.key === 'Enter' && activeIndex >= 0 && items[activeIndex]) {
      e.preventDefault();
      handleSelectSearchResult(items[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getKindIcon = (kind: SearchEntityKind) => {
    if (kind === 'task') return <CheckSquare className="w-4 h-4 text-sky-400 shrink-0" />;
    if (kind === 'knowledge') return <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />;
    return <FileText className="w-4 h-4 text-emerald-400 shrink-0" />;
  };

  const getKindChipClass = (kind: SearchEntityKind) => {
    if (kind === 'task') return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    if (kind === 'knowledge') return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  };

  const renderSearchDropdown = () => {
    if (!isSearchOpen || !searchQuery.trim()) return null;

    return (
      <div
        role="listbox"
        aria-label="Global fuzzy search results"
        data-testid="global-search-results"
        className="absolute left-0 md:-left-8 mt-2 w-full md:w-[33rem] max-w-[94vw] rounded-2xl border border-[var(--border-color)] shadow-2xl z-50 overflow-hidden bg-[var(--bg-elevated)] text-[var(--text-primary)]"
      >
        {/* Category filter tabs */}
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/80">
          {(
            [
              { id: 'all', label: `All (${allCategoryCounts.all})` },
              { id: 'task', label: `Tasks (${allCategoryCounts.task})` },
              { id: 'knowledge', label: `Knowledge Base (${allCategoryCounts.knowledge})` },
              { id: 'post', label: `Community Posts (${allCategoryCounts.post})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSearchCategory(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-colors ${
                searchCategory === tab.id
                  ? 'bg-sky-500 text-white font-bold shadow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 bg-[var(--bg-elevated)]">
          {searchOutput.results.length === 0 ? (
            <div className="py-6 px-4 text-center space-y-1">
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                No matching tasks, knowledge articles, or posts found.
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Try another keyword or clear your category filter.
              </p>
            </div>
          ) : (
            searchOutput.results.map((item, idx) => {
              const isHighlighted = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={isHighlighted}
                  data-testid={`search-result-${item.kind}`}
                  onClick={() => handleSelectSearchResult(item)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                    isHighlighted
                      ? 'bg-sky-500/15 border border-sky-500/40'
                      : 'hover:bg-[var(--bg-secondary)] border border-transparent'
                  }`}
                >
                  <div className="mt-0.5">{getKindIcon(item.kind)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {item.title}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono border shrink-0 ${getKindChipClass(
                          item.kind
                        )}`}
                      >
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-muted)] mt-1 shrink-0" />
                </button>
              );
            })
          )}
        </div>

        <div className="px-3 py-1.5 border-t border-[var(--border-color)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-secondary)]/80">
          <span>Fuzzy powered by Fuse.js</span>
          <span>↑↓ Navigate • Enter Open • Esc Close</span>
        </div>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Brand */}
        <button
          type="button"
          onClick={() => setActiveView('landing')}
          className="flex items-center gap-1.5 sm:gap-3 cursor-pointer min-w-0 shrink-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-xl p-0.5 sm:p-1"
          aria-label="INKWAVE NEXUS Home"
        >
          <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-sky-500/20 shrink-0">
            <div className="w-full h-full bg-[var(--bg-primary)] rounded-[10px] flex items-center justify-center">
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500 animate-pulse" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[11px] sm:text-xl tracking-tight whitespace-nowrap bg-gradient-to-r from-sky-500 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                INKWAVE NEXUS
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                COSMIC
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-sky-400/90 tracking-wide font-mono">
              Where Ideas Become Universes
            </p>
          </div>
        </button>

        {/* Desktop Fuse.js Global Search Combobox */}
        <div ref={searchContainerRef} className="flex-1 max-w-md hidden md:block relative">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            <input
              ref={desktopSearchInputRef}
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search tasks, knowledge base, posts... (Ctrl+K)"
              aria-label="Global Search"
              aria-expanded={isSearchOpen && !!searchQuery.trim()}
              aria-haspopup="listbox"
              data-testid="global-search-input"
              className="w-full pl-10 pr-8 py-2 text-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:outline-none focus:border-sky-500/50 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  desktopSearchInputRef.current?.focus();
                }}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {renderSearchDropdown()}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* Mobile Search Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowMobileSearch((prev) => !prev);
              setIsSearchOpen(true);
            }}
            aria-label="Open Global Search"
            className="md:hidden p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors border border-transparent hover:border-[var(--border-color)]"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Live Pomodoro Indicator Pill */}
          {(pomodoroActive || pomodoroSecondsLeft < 25 * 60) && (
            <button
              type="button"
              onClick={togglePomodoro}
              title={`Toggle Pomodoro Focus Timer (${pomodoroMode}) • Ctrl+Shift+P or Alt+P`}
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                pomodoroActive
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-slate-800/70 text-slate-300 border-slate-700'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>{formatTimer(pomodoroSecondsLeft)}</span>
            </button>
          )}

          {/* Quick Publish */}
          <button
            type="button"
            onClick={() => setActiveView('editor')}
            className="flex items-center gap-2 px-2 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Publish article"
          >
            <PenTool className="w-4 h-4" />
            <span className="hidden sm:inline">Publish</span>
          </button>

          {/* Offline Status Badge */}
          {!isOnline && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <WifiOff className="w-3.5 h-3.5 animate-pulse" /> Offline
            </span>
          )}

          {/* Keyboard Shortcuts Trigger */}
          <button
            type="button"
            onClick={() => setShowShortcutsHelp(true)}
            className="hidden sm:inline-flex p-2 rounded-xl text-[var(--text-secondary)] hover:text-sky-400 hover:bg-[var(--bg-secondary)] transition-colors border border-transparent hover:border-[var(--border-color)]"
            title="Keyboard Shortcuts Cheatsheet (Press '?')"
            aria-label="Keyboard Shortcuts"
          >
            <Keyboard className="w-5 h-5" />
          </button>

          {/* NOVA AI Assistant Trigger */}
          <button
            type="button"
            onClick={() => setIsNovaOpen(!isNovaOpen)}
            aria-label="Summon NOVA AI Companion"
            className={`relative flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl border border-sky-400/40 bg-sky-500/10 hover:bg-sky-500/20 text-xs sm:text-sm font-semibold transition-all group ${
              theme === 'light' ? 'text-sky-700' : 'text-sky-300'
            }`}
            title="Open NOVA AI Companion & Agent Command (Ctrl+J)"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-500 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline font-mono">NOVA</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-1 -right-1" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-1 -right-1" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotifications((prev) => !prev);
                setShowUserMenu(false);
              }}
              className="relative p-1.5 sm:p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors border border-transparent hover:border-[var(--border-color)]"
              aria-label="Notifications"
              aria-expanded={showNotifications}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                  <h4 className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-2">
                    <Bell className="w-4 h-4 text-sky-400" /> Notifications
                  </h4>
                  <span className="text-xs text-[var(--text-muted)] font-mono">{unreadCount} unread</span>
                </div>
                <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <button
                      type="button"
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`w-full text-left p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        notif.read
                          ? 'bg-transparent border-[var(--border-color)]/50 opacity-70'
                          : 'bg-sky-500/10 border-sky-500/30 font-medium'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[var(--text-primary)] font-semibold">{notif.title}</span>
                        <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">{notif.createdAt}</span>
                      </div>
                      <p className="text-[var(--text-secondary)] mt-1">{notif.message}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dedicated ThemeToggle Component */}
          <ThemeToggle />

          {/* User Profile Switcher */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => {
                setShowUserMenu((prev) => !prev);
                setShowNotifications(false);
              }}
              aria-label="User Profile Menu"
              aria-expanded={showUserMenu}
              className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-1.5 sm:pr-2 rounded-full border border-[var(--border-color)] hover:border-sky-500/40 bg-[var(--bg-secondary)] transition-all"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover ring-1 ring-sky-500/50"
              />
              <span className="hidden lg:inline text-xs font-semibold text-[var(--text-primary)]">{currentUser.name}</span>
              <ChevronDown className="hidden sm:inline w-3.5 h-3.5 text-[var(--text-muted)]" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel p-3 shadow-2xl z-50">
                <div className="p-2 border-b border-[var(--border-color)] mb-2">
                  <p className="text-xs font-semibold text-[var(--text-primary)]">{currentUser.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">@{currentUser.username}</p>
                  <span className="inline-block mt-1 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    Role: {currentUser.role}
                  </span>
                </div>
                <p className="text-[10px] uppercase font-mono text-[var(--text-muted)] px-2 mb-1">Switch Demo Identity</p>
                <div className="space-y-1">
                  {[CURRENT_USER, ...OTHER_USERS].map((u) => (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs transition-colors ${
                        currentUser.id === u.id
                          ? 'bg-sky-500/20 text-sky-300 font-semibold'
                          : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} referrerPolicy="no-referrer" className="w-6 h-6 rounded-full object-cover" />
                      <div className="truncate flex-1">
                        <p className="truncate text-xs">{u.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)] truncate">@{u.username}</p>
                      </div>
                      {currentUser.id === u.id && <CheckCircle className="w-3.5 h-3.5 text-sky-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Expandable Fuse.js Global Search Drawer */}
      {showMobileSearch && (
        <div className="md:hidden px-3 pb-3 pt-1 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/95 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              autoFocus
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search tasks, knowledge base, posts..."
              aria-label="Mobile Global Search"
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:outline-none focus:border-sky-500/50 text-[var(--text-primary)] placeholder-[var(--text-muted)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear mobile search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {renderSearchDropdown()}
        </div>
      )}
    </header>
  );
}
