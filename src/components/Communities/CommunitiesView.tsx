import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Globe, Users, Shield, BookOpen, Check, Plus, MessageSquare } from 'lucide-react';

export function CommunitiesView() {
  const { communities, toggleJoinCommunity, posts, setSelectedArticle } = useApp();
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>(communities[0]?.id || '');

  const activeCommunity = communities.find((c) => c.id === selectedCommunityId) || communities[0];
  const communityPosts = posts.filter((p) => p.communityId === activeCommunity?.id || p.tags.some((t) => activeCommunity?.topics.includes(t)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Topic Hubs
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">Curated Publishing Domains</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Community Worlds</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Dedicated spaces where creators, researchers, and engineers collaborate on specialized domains.
          </p>
        </div>
      </div>

      {/* Communities Directory & Active World */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Worlds Directory */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase text-[var(--text-muted)]">
            Active Worlds ({communities.length})
          </h3>
          <div className="space-y-2.5">
            {communities.map((comm) => {
              const isSelected = comm.id === selectedCommunityId;
              return (
                <div
                  key={comm.id}
                  onClick={() => setSelectedCommunityId(comm.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'glass-panel border-sky-500/60 shadow-lg shadow-sky-500/10'
                      : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)] hover:border-sky-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{comm.name}</span>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">
                      {comm.membersCount.toLocaleString()} members
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{comm.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Community Hub Detail */}
        {activeCommunity && (
          <div className="lg:col-span-8 space-y-6">
            {/* Community Banner Card */}
            <div className="relative rounded-3xl overflow-hidden glass-panel border border-[var(--border-color)]">
              <div className="h-44 sm:h-52 w-full relative">
                <img
                  src={activeCommunity.bannerImage}
                  alt={activeCommunity.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/50 to-transparent" />
              </div>

              <div className="relative p-6 -mt-16 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                      {activeCommunity.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-xl">
                      {activeCommunity.description}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleJoinCommunity(activeCommunity.id)}
                    className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      activeCommunity.isJoined
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/25'
                    }`}
                  >
                    {activeCommunity.isJoined ? '✓ Joined World' : '+ Join Community'}
                  </button>
                </div>

                {/* Topics & Moderators */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-color)]">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Core Topics:</span>
                  {activeCommunity.topics.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded text-[11px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Community Rules Card */}
            <div className="p-4 rounded-2xl glass-panel border border-[var(--border-color)] space-y-2">
              <h4 className="text-xs font-mono font-bold uppercase text-[var(--text-muted)] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sky-400" /> Community Standards
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[var(--text-secondary)]">
                {activeCommunity.rules.map((rule, idx) => (
                  <li key={idx} className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    • {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Community Posts Stream */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold font-mono uppercase text-[var(--text-muted)]">
                Discussions in this World ({communityPosts.length})
              </h3>
              {communityPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedArticle(post)}
                  className="p-4 rounded-2xl glass-panel glass-panel-hover border border-[var(--border-color)] cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
                    <span className="font-semibold text-[var(--text-primary)]">{post.author.name}</span>
                    <span>{post.readingTime} min read</span>
                  </div>
                  <h4 className="text-base font-bold text-[var(--text-primary)] hover:text-sky-400 transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{post.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
