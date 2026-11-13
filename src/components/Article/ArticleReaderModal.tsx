import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Comment } from '../../types';
import {
  X,
  Clock,
  Heart,
  Bookmark,
  BookmarkCheck,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  List,
  Highlighter,
  MessageSquare,
  Send,
  CheckCircle,
  FileText,
  Sparkles,
  Sliders,
  Maximize2,
  Radio,
  Sun,
  Moon,
  BookOpen,
  Wifi,
  DownloadCloud,
  Check,
} from 'lucide-react';

export type ReaderTheme = 'light' | 'deep-space' | 'sepia';
export type ReaderFontSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type ReaderFontFamily = 'sans' | 'serif' | 'mono';

export function ArticleReaderModal() {
  const {
    posts,
    selectedArticle,
    setSelectedArticle,
    toggleLikePost,
    toggleBookmarkPost,
    currentUser,
    toggleReadLater,
    isReadLater,
    setActiveView,
  } = useApp();

  const liveArticle = selectedArticle
    ? posts.find((p) => p.id === selectedArticle.id) || selectedArticle
    : null;

  const [readingProgress, setReadingProgress] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showTOC, setShowTOC] = useState(false);
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>('deep-space');
  const [fontSize, setFontSize] = useState<ReaderFontSize>('base');
  const [fontFamily, setFontFamily] = useState<ReaderFontFamily>('sans');
  const [columnWidth, setColumnWidth] = useState<'compact' | 'standard' | 'wide'>('standard');
  const [showToast, setShowToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  const buildInitialComments = (articleId: string): Comment[] => [
    {
      id: `comm-1-${articleId || 'default'}`,
      postId: articleId,
      authorId: 'user-elena-2',
      author: {
        id: 'user-elena-2',
        name: 'Elena Rostova',
        username: 'elenarostova',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        coverImage: '',
        bio: '',
        interests: [],
        skills: [],
        followersCount: 0,
        followingCount: 0,
        isVerified: true,
        role: 'user',
        creatorBadges: [],
      },
      content:
        'The separation between Planner and Tester circuit breakers is the cleanest architecture I have seen for multi-agent workflows. Prevents infinite hallucination loops!',
      createdAt: '2 hours ago',
      likesCount: 14,
      isLiked: false,
    },
  ];

  const [comments, setComments] = useState<Comment[]>(() =>
    buildInitialComments(liveArticle?.id || '')
  );
  const [newCommentText, setNewCommentText] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const isSavedForOffline = liveArticle ? isReadLater(liveArticle.id) : false;

  useEffect(() => {
    setComments(buildInitialComments(liveArticle?.id || ''));
    setReadingProgress(0);
    setNewCommentText('');
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [liveArticle?.id]);

  useEffect(() => {
    if (!liveArticle) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedArticle(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [liveArticle, setSelectedArticle]);

  // Reading progress tracker
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 0) {
      setReadingProgress(100);
      return;
    }
    const progress = (el.scrollTop / maxScroll) * 100;
    setReadingProgress(Math.min(100, Math.max(0, progress)));
  };

  // Audio Speech Narration
  const toggleAudioNarration = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !liveArticle) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = `${liveArticle.title}. ${liveArticle.content.replace(/[*#`_]/g, '')}`;
    const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 1200));
    utterance.rate = 1.0;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleReadLater = () => {
    if (!liveArticle) return;
    const isNowSaved = toggleReadLater(liveArticle);
    setShowToast({
      message: isNowSaved
        ? 'Saved to "Read Later" collection in your Library for offline reading!'
        : 'Removed from "Read Later" collection.',
      visible: true,
    });
    setTimeout(() => {
      setShowToast((prev) => ({ ...prev, visible: false }));
    }, 3200);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !liveArticle) return;

    const newComm: Comment = {
      id: `comm-${Date.now()}`,
      postId: liveArticle.id,
      authorId: currentUser.id,
      author: currentUser,
      content: newCommentText,
      createdAt: 'Just now',
      likesCount: 0,
      isLiked: false,
    };

    setComments((prev) => [newComm, ...prev]);
    setNewCommentText('');
  };

  if (!liveArticle) return null;

  const headingSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const computedTOC =
    liveArticle.tableOfContents && liveArticle.tableOfContents.length > 0
      ? liveArticle.tableOfContents
      : liveArticle.content
          .split('\n\n')
          .filter((b) => b.startsWith('# ') || b.startsWith('## '))
          .map((b, idx) => {
            const level = b.startsWith('## ') ? 2 : 1;
            const text = b.replace(/^#{1,2}\s+/, '').trim();
            return {
              id: `heading-${headingSlug(text) || idx}`,
              text,
              level,
            };
          });

  const scrollToHeading = (itemId: string, itemText: string) => {
    const container = contentRef.current;
    if (!container) return;
    const slugId = `heading-${headingSlug(itemText)}`;
    const target =
      container.querySelector(`[data-toc-id="${itemId}"]`) ||
      container.querySelector(`#${CSS.escape(slugId)}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Responsive column widths
  const widthClasses = {
    compact: 'max-w-xl',
    standard: 'max-w-3xl',
    wide: 'max-w-5xl',
  };

  // Typographic font scaling
  const fontSizes = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-relaxed',
    xl: 'text-xl leading-loose',
    '2xl': 'text-2xl leading-loose',
  };

  const fontFamilies = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  };

  // Theme-specific styling classes
  const themeStyles = {
    'deep-space': {
      overlay: 'bg-[#020408]/95',
      modal: 'bg-[#040816] border-cyan-500/30 text-slate-100 shadow-[0_0_60px_rgba(34,211,238,0.15)]',
      header: 'bg-[#060b1b] border-cyan-500/20 text-slate-200',
      title: 'text-white',
      meta: 'text-cyan-400',
      authorName: 'text-white',
      authorBio: 'text-slate-300',
      prose: 'text-slate-200',
      code: 'bg-[#070b13] border-cyan-500/30 text-cyan-300',
      box: 'bg-[#091126] border-cyan-500/20 text-slate-200',
      input: 'bg-[#091126] border-cyan-500/30 text-white placeholder-slate-400 focus:border-cyan-400',
      button: 'bg-cyan-500 hover:bg-cyan-400 text-black font-bold',
      tagBadge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      toc: 'bg-[#060b1b] border-cyan-500/20 text-slate-200',
    },
    sepia: {
      overlay: 'bg-[#2a2016]/80',
      modal: 'bg-[#f4ecd8] border-[#d8c3a5] text-[#433422] shadow-2xl',
      header: 'bg-[#ebdcc0] border-[#d4b996] text-[#5c4632]',
      title: 'text-[#2a1c10]',
      meta: 'text-[#8c5825]',
      authorName: 'text-[#2a1c10]',
      authorBio: 'text-[#5a4430]',
      prose: 'text-[#433422]',
      code: 'bg-[#e5d2b3] border-[#cfb591] text-[#7a481c]',
      box: 'bg-[#eee2ca] border-[#d8c3a5] text-[#433422]',
      input: 'bg-[#fbf4e6] border-[#cfb591] text-[#433422] placeholder-[#8c745c] focus:border-[#8c5825]',
      button: 'bg-[#8c5825] hover:bg-[#73471c] text-[#fbf4e6] font-bold',
      tagBadge: 'bg-[#e0cbab] text-[#6d4218] border-[#cbb08c]',
      toc: 'bg-[#ebdcc0] border-[#d4b996] text-[#5c4632]',
    },
    light: {
      overlay: 'bg-slate-900/60',
      modal: 'bg-[#ffffff] border-slate-200 text-slate-900 shadow-2xl',
      header: 'bg-slate-50 border-slate-200 text-slate-700',
      title: 'text-slate-900',
      meta: 'text-sky-600',
      authorName: 'text-slate-900',
      authorBio: 'text-slate-600',
      prose: 'text-slate-700',
      code: 'bg-slate-100 border-slate-200 text-sky-700',
      box: 'bg-slate-50 border-slate-200 text-slate-700',
      input: 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500',
      button: 'bg-sky-600 hover:bg-sky-500 text-white font-bold',
      tagBadge: 'bg-sky-50 text-sky-700 border-sky-200',
      toc: 'bg-slate-50 border-slate-200 text-slate-700',
    },
  };

  const currentTheme = themeStyles[readerTheme];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 ${currentTheme.overlay} backdrop-blur-md animate-in fade-in`}>
      <div
        className={`relative w-full ${widthClasses[columnWidth]} h-[94vh] flex flex-col rounded-3xl transition-all duration-300 border ${currentTheme.modal} overflow-hidden`}
      >
        {/* Top Reading Progress Bar */}
        <div className="w-full h-1 bg-black/10 dark:bg-white/10">
          <div
            className={`h-full transition-all duration-150 ${
              readerTheme === 'sepia'
                ? 'bg-gradient-to-r from-amber-600 to-[#8c5825]'
                : readerTheme === 'light'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600'
                : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-400'
            }`}
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        {/* Modal Controls Header */}
        <div className={`flex flex-wrap items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 border-b ${currentTheme.header} gap-2`}>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-xs font-mono opacity-75 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> {Math.round(readingProgress)}% read
            </span>

            {/* Read Later Offline Button */}
            <button
              onClick={handleToggleReadLater}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold font-mono transition-all ${
                isSavedForOffline
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 opacity-90'
              }`}
              title="Save article to your Read Later library collection for offline reading"
            >
              {isSavedForOffline ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">Saved to Read Later</span>
                  <span className="sm:hidden">Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Read Later</span>
                </>
              )}
            </button>

            {/* Audio Narrator Button */}
            <button
              onClick={toggleAudioNarration}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold font-mono transition-all ${
                isPlayingAudio
                  ? 'bg-sky-500 text-white animate-pulse'
                  : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10'
              }`}
            >
              {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingAudio ? 'Pause' : 'Listen'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Switcher Toggle (Light / Deep Space / Sepia) */}
            <div className="flex items-center p-0.5 rounded-xl border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 text-xs font-mono">
              <button
                onClick={() => setReaderTheme('light')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                  readerTheme === 'light'
                    ? 'bg-white text-slate-900 font-bold shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="Light Mode (Paper White)"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Light</span>
              </button>

              <button
                onClick={() => setReaderTheme('deep-space')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                  readerTheme === 'deep-space'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="Deep Space Mode (Cosmic Dark)"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Deep Space</span>
              </button>

              <button
                onClick={() => setReaderTheme('sepia')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                  readerTheme === 'sepia'
                    ? 'bg-[#ebdcc0] text-[#433422] font-bold border border-[#cfb591] shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="Sepia Mode (Warm Parchment for Extended Reading Comfort)"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Sepia</span>
              </button>
            </div>

            {/* Font Size Stepper Toggle */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-xl border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 text-xs font-mono">
              <span className="text-[10px] uppercase font-bold opacity-60 mr-0.5">Size</span>
              {(['sm', 'base', 'lg', 'xl'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setFontSize(sz)}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    fontSize === sz
                      ? 'font-bold underline decoration-2 underline-offset-2'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  title={`Font size: ${sz}`}
                >
                  {sz === 'sm' ? 'A-' : sz === 'base' ? 'A' : sz === 'lg' ? 'A+' : 'A++'}
                </button>
              ))}
            </div>

            {/* Font Family Toggle */}
            <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded-xl border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 text-xs font-mono">
              <button
                onClick={() => setFontFamily('sans')}
                className={`px-1.5 py-0.5 rounded ${fontFamily === 'sans' ? 'font-bold underline' : 'opacity-60'}`}
                title="Sans-serif"
              >
                Sans
              </button>
              <button
                onClick={() => setFontFamily('serif')}
                className={`px-1.5 py-0.5 rounded font-serif ${fontFamily === 'serif' ? 'font-bold underline' : 'opacity-60'}`}
                title="Serif"
              >
                Serif
              </button>
              <button
                onClick={() => setFontFamily('mono')}
                className={`px-1.5 py-0.5 rounded font-mono ${fontFamily === 'mono' ? 'font-bold underline' : 'opacity-60'}`}
                title="Monospace"
              >
                Mono
              </button>
            </div>

            {/* Table of Contents Toggle */}
            {computedTOC.length > 0 && (
              <button
                type="button"
                onClick={() => setShowTOC((prev) => !prev)}
                className={`p-1.5 rounded-xl border border-black/15 dark:border-white/15 transition-colors ${
                  showTOC ? 'bg-sky-500/20 text-sky-400 border-sky-500/40' : 'opacity-80 hover:opacity-100'
                }`}
                title="Toggle Table of Contents"
                aria-label="Toggle Table of Contents"
              >
                <List className="w-4 h-4" />
              </button>
            )}

            {/* Column Width Toggle */}
            <button
              type="button"
              onClick={() =>
                setColumnWidth((prev) =>
                  prev === 'compact' ? 'standard' : prev === 'standard' ? 'wide' : 'compact'
                )
              }
              className="p-1.5 rounded-xl border border-black/15 dark:border-white/15 opacity-80 hover:opacity-100"
              title={`Column width: ${columnWidth}`}
              aria-label={`Column width: ${columnWidth}`}
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Bookmark */}
            <button
              type="button"
              onClick={() => toggleBookmarkPost(liveArticle.id)}
              className={`p-1.5 rounded-xl border border-black/15 dark:border-white/15 transition-colors ${
                liveArticle.isBookmarked ? 'text-sky-500 bg-sky-500/10' : 'opacity-80 hover:opacity-100'
              }`}
              title={liveArticle.isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
              aria-label="Bookmark article"
            >
              <Bookmark className={`w-4 h-4 ${liveArticle.isBookmarked ? 'fill-sky-500' : ''}`} />
            </button>

            {/* Like */}
            <button
              type="button"
              onClick={() => toggleLikePost(liveArticle.id)}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border border-black/15 dark:border-white/15 transition-colors text-xs font-mono ${
                liveArticle.isLiked ? 'text-rose-500 bg-rose-500/10' : 'opacity-80 hover:opacity-100'
              }`}
              aria-label="Like article"
            >
              <Heart className={`w-4 h-4 ${liveArticle.isLiked ? 'fill-rose-500' : ''}`} />
              <span>{liveArticle.likesCount}</span>
            </button>

            {/* Close Modal */}
            <button
              type="button"
              onClick={() => setSelectedArticle(null)}
              className="p-1.5 rounded-xl hover:text-rose-400 transition-colors opacity-80 hover:opacity-100"
              aria-label="Close reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Toast for Read Later */}
        {showToast.visible && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
            <Check className="w-4 h-4" />
            <span>{showToast.message}</span>
            <button
              onClick={() => {
                setSelectedArticle(null);
                setActiveView('library');
              }}
              className="ml-2 underline font-bold hover:text-emerald-100"
            >
              View in Library →
            </button>
          </div>
        )}

        {/* Content Body & Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Article Stream */}
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 space-y-6"
          >
            {/* Meta Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${currentTheme.tagBadge}`}>
                  {liveArticle.category}
                </span>
                <span className="text-xs font-mono opacity-50">•</span>
                <span className="text-xs font-mono opacity-75">
                  {liveArticle.readingTime} min read ({liveArticle.wordCount} words)
                </span>
                {isSavedForOffline && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                    <DownloadCloud className="w-3 h-3" /> Offline Ready
                  </span>
                )}
              </div>

              <h1 className={`text-2xl sm:text-4xl font-extrabold leading-tight ${currentTheme.title}`}>
                {liveArticle.title}
              </h1>

              {/* Author Preview */}
              <div className="flex items-center gap-3.5 mt-4 pt-4 border-t border-black/10 dark:border-white/10">
                <img
                  src={liveArticle.author.avatar}
                  alt={liveArticle.author.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-sky-500/40"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold text-sm ${currentTheme.authorName}`}>{liveArticle.author.name}</span>
                    {liveArticle.author.isVerified && <CheckCircle className="w-4 h-4 text-sky-500" />}
                  </div>
                  <p className={`text-xs ${currentTheme.authorBio}`}>{liveArticle.author.bio}</p>
                </div>
              </div>
            </div>

            {/* Cover Image */}
            {liveArticle.coverImage && (
              <div className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 max-h-96">
                <img
                  src={liveArticle.coverImage}
                  alt={liveArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Rendered Markdown Content with dynamic font size and family */}
            <div className={`prose max-w-none space-y-5 ${fontSizes[fontSize]} ${fontFamilies[fontFamily]} ${currentTheme.prose}`}>
              {liveArticle.content.split('\n\n').map((block, idx) => {
                if (block.startsWith('# ')) {
                  const text = block.replace('# ', '').trim();
                  return (
                    <h1
                      key={idx}
                      id={`heading-${headingSlug(text)}`}
                      className={`text-2xl font-bold pt-4 pb-1 border-b border-black/10 dark:border-white/10 ${currentTheme.title}`}
                    >
                      {text}
                    </h1>
                  );
                }
                if (block.startsWith('## ')) {
                  const text = block.replace('## ', '').trim();
                  return (
                    <h2
                      key={idx}
                      id={`heading-${headingSlug(text)}`}
                      className={`text-xl font-bold pt-3 pb-1 ${currentTheme.title}`}
                    >
                      {text}
                    </h2>
                  );
                }
                if (block.startsWith('```')) {
                  const code = block.replace(/```[a-z]*/g, '').trim();
                  return (
                    <pre key={idx} className={`p-4 rounded-2xl border font-mono text-xs sm:text-sm overflow-x-auto ${currentTheme.code}`}>
                      <code>{code}</code>
                    </pre>
                  );
                }
                if (block.startsWith('- ')) {
                  return (
                    <ul key={idx} className="list-disc list-inside space-y-1 pl-2">
                      {block.split('\n').map((item, i) => (
                        <li key={i}>{item.replace('- ', '')}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={idx}>{block}</p>;
              })}
            </div>

            {/* Discussions Section */}
            <div className="pt-8 mt-8 border-t border-black/10 dark:border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-bold flex items-center gap-2 ${currentTheme.title}`}>
                  <MessageSquare className="w-5 h-5 text-sky-400" /> Discussions ({comments.length})
                </h3>
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2.5">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Share constructive technical insight or question..."
                  className={`flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none ${currentTheme.input}`}
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-40 transition-colors ${currentTheme.button}`}
                >
                  Post Insight
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.map((comm) => (
                  <div
                    key={comm.id}
                    className={`p-4 rounded-2xl border space-y-2 ${currentTheme.box}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={comm.author.avatar}
                          alt={comm.author.name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-sky-500/30"
                        />
                        <span className={`font-semibold text-xs ${currentTheme.authorName}`}>{comm.author.name}</span>
                        <span className="text-[10px] opacity-60 font-mono">{comm.createdAt}</span>
                      </div>
                    </div>
                    <p className={`text-xs sm:text-sm pl-9 ${currentTheme.prose}`}>{comm.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table of Contents Drawer */}
          {showTOC && computedTOC.length > 0 && (
            <div className={`w-72 border-l p-5 space-y-3 overflow-y-auto ${currentTheme.toc}`}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase opacity-75">Table of Contents</h4>
                <button
                  type="button"
                  onClick={() => setShowTOC(false)}
                  className="text-xs opacity-60 hover:opacity-100"
                  aria-label="Close table of contents"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-1.5 text-xs">
                {computedTOC.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToHeading(item.id, item.text)}
                    className={`block w-full text-left cursor-pointer hover:underline transition-colors ${
                      item.level === 1 ? 'font-semibold' : 'pl-3 opacity-80'
                    }`}
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
