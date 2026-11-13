import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Post, Story } from '../../types';
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Clock,
  Sparkles,
  TrendingUp,
  Flame,
  Radio,
  Plus,
  Compass,
  CheckCircle,
  Eye,
  DownloadCloud,
  BookmarkCheck,
  Check,
} from 'lucide-react';

export function FeedView() {
  const {
    posts,
    toggleLikePost,
    toggleBookmarkPost,
    toggleReadLater,
    isReadLater,
    stories,
    addStory,
    setSelectedArticle,
    searchQuery,
    currentUser,
    theme,
  } = useApp();

  const [feedFilter, setFeedFilter] = useState<'for_you' | 'following' | 'trending' | 'latest'>('for_you');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [newStoryCaption, setNewStoryCaption] = useState('');
  const [activeStoryView, setActiveStoryView] = useState<Story | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Filter posts
  let filteredPosts = [...posts];

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredPosts = filteredPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (selectedTag) {
    filteredPosts = filteredPosts.filter((p) => p.tags.includes(selectedTag));
  }

  if (feedFilter === 'following') {
    filteredPosts = filteredPosts.filter(
      (p) => p.author.isVerified || p.authorId === currentUser.id || p.visibility === 'followers'
    );
  } else if (feedFilter === 'trending') {
    filteredPosts.sort((a, b) => b.likesCount + b.viewsCount - (a.likesCount + a.viewsCount));
  } else if (feedFilter === 'latest') {
    filteredPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)));

  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryCaption.trim()) return;
    addStory(newStoryCaption);
    setNewStoryCaption('');
    setShowStoryModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 24-Hour Stories Bar */}
      <div className="glass-panel rounded-3xl p-4 border border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> Ephemeral 24h Stories
          </span>
          <button
            onClick={() => setShowStoryModal(true)}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Story
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {/* Add Story Pill */}
          <button
            onClick={() => setShowStoryModal(true)}
            className="flex flex-col items-center gap-1.5 shrink-0 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 p-[2px] shadow-md group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[var(--bg-primary)] rounded-[14px] flex items-center justify-center text-sky-400">
                <Plus className="w-6 h-6" />
              </div>
            </div>
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">Your Story</span>
          </button>

          {/* Stories List */}
          {stories.map((story) => (
            <div
              key={story.id}
              onClick={() => setActiveStoryView(story)}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-2xl p-[2px] bg-gradient-to-tr from-rose-500 via-amber-400 to-violet-500 shadow-md group-hover:scale-105 transition-transform">
                <img
                  src={story.mediaUrl || story.author.avatar}
                  alt={story.author.name}
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <span className="text-[11px] font-medium text-[var(--text-primary)] max-w-[64px] truncate">
                {story.author.name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Feed Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(
            [
              { id: 'for_you', label: 'For You', icon: Sparkles },
              { id: 'trending', label: 'Trending', icon: Flame },
              { id: 'latest', label: 'Latest', icon: Clock },
              { id: 'following', label: 'Following', icon: Compass },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = feedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFeedFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  active
                    ? theme === 'light'
                      ? 'bg-sky-100 text-sky-700 border border-sky-300 shadow-sm'
                      : 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="px-2 py-0.5 rounded-lg text-[10px] font-mono whitespace-nowrap shrink-0 bg-rose-500/20 text-rose-500 border border-rose-500/30"
            >
              Clear Filter ✕
            </button>
          )}
          {allTags.slice(0, 5).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(selectedTag === t ? null : t)}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono whitespace-nowrap shrink-0 transition-all ${
                selectedTag === t
                  ? 'bg-sky-500 text-white font-bold'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>

      {/* Publications Grid */}
      <div className="space-y-5">
        {filteredPosts.length === 0 && (
          <div className="glass-panel rounded-3xl p-8 border border-[var(--border-color)] text-center space-y-3">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              No publications match your active feed filters.
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Try switching feeds or clearing your tag/search filters to see all dispatches.
            </p>
            <button
              onClick={() => {
                setFeedFilter('for_you');
                setSelectedTag(null);
              }}
              className="px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-mono font-bold hover:bg-sky-500/30 transition-colors"
            >
              Reset Feed Filters
            </button>
          </div>
        )}
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            className="glass-panel glass-panel-hover rounded-3xl p-5 sm:p-6 border border-[var(--border-color)] transition-all space-y-4"
          >
            {/* Author Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-sky-500/40"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{post.author.name}</span>
                    {post.author.isVerified && <CheckCircle className="w-3.5 h-3.5 text-sky-400" />}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
                    <span>@{post.author.username}</span>
                    <span>•</span>
                    <span>{new Date(post.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {post.readingTime} min read
                </span>
              </div>
            </div>

            {/* Post Title & Excerpt */}
            <div className="cursor-pointer" onClick={() => setSelectedArticle(post)}>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] hover:text-sky-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 line-clamp-2 leading-relaxed">
                {post.excerpt}
              </p>
            </div>

            {/* Optional Cover Image */}
            {post.coverImage && (
              <div
                className="rounded-2xl overflow-hidden cursor-pointer max-h-72 border border-[var(--border-color)]"
                onClick={() => setSelectedArticle(post)}
              >
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
                />
              </div>
            )}

            {/* Tags Bar */}
            <div className="flex flex-wrap items-center gap-1.5">
              {post.tags.map((t) => (
                <span
                  key={t}
                  onClick={() => setSelectedTag(t)}
                  className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 cursor-pointer transition-colors"
                >
                  #{t}
                </span>
              ))}
            </div>

            {/* Engagement Metrics & Interaction Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)] text-xs font-mono">
              <div className="flex items-center gap-4 sm:gap-6">
                <button
                  onClick={() => toggleLikePost(post.id)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    post.isLiked ? 'text-rose-400 font-bold' : 'text-[var(--text-muted)] hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-400' : ''}`} />
                  <span>{post.likesCount}</span>
                </button>

                <button
                  onClick={() => setSelectedArticle(post)}
                  className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-sky-400 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.commentsCount}</span>
                </button>

                <button
                  onClick={() => toggleBookmarkPost(post.id)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    post.isBookmarked ? 'text-sky-400 font-bold' : 'text-[var(--text-muted)] hover:text-sky-400'
                  }`}
                  title="Bookmark"
                >
                  <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-sky-400' : ''}`} />
                  <span>{post.bookmarksCount}</span>
                </button>

                {/* Read Later Quick Save Button */}
                <button
                  onClick={() => toggleReadLater(post)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono transition-all ${
                    isReadLater(post.id)
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                      : 'text-[var(--text-muted)] hover:text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                  title={isReadLater(post.id) ? 'Saved for offline in Read Later' : 'Save to Read Later for offline reading'}
                >
                  {isReadLater(post.id) ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Offline Ready</span>
                    </>
                  ) : (
                    <>
                      <DownloadCloud className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Read Later</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {post.viewsCount} views
                </span>
                <button
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.origin);
                      setCopiedPostId(post.id);
                      setTimeout(() => setCopiedPostId(null), 2500);
                    }
                  }}
                  className="flex items-center gap-1 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors text-xs"
                  title="Copy publication link"
                >
                  {copiedPostId === post.id ? (
                    <span className="text-emerald-400 text-[10px] flex items-center gap-0.5">
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </span>
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Story View Modal */}
      {activeStoryView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl overflow-hidden glass-panel border border-sky-500/40 shadow-2xl p-6 text-center space-y-4">
            <button
              onClick={() => setActiveStoryView(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 text-left">
              <img
                src={activeStoryView.author.avatar}
                alt={activeStoryView.author.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-400"
              />
              <div>
                <p className="font-bold text-sm text-white">{activeStoryView.author.name}</p>
                <p className="text-[11px] text-sky-300 font-mono">24h Ephemeral Update</p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden max-h-80 bg-black/40 border border-white/10">
              <img src={activeStoryView.mediaUrl} alt="Story" className="w-full h-full object-cover" />
            </div>

            <p className="text-sm text-white font-medium">{activeStoryView.caption}</p>
          </div>
        </div>
      )}

      {/* Add Story Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 shadow-2xl border border-sky-500/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-400" /> Share 24-Hour Ephemeral Story
              </h3>
              <button
                onClick={() => setShowStoryModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateStory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Story Caption</label>
                <textarea
                  value={newStoryCaption}
                  onChange={(e) => setNewStoryCaption(e.target.value)}
                  rows={3}
                  required
                  placeholder="What are you building or researching today?"
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStoryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold text-xs shadow-md"
                >
                  Publish Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
