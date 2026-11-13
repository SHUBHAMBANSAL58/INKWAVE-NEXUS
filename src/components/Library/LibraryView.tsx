import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookMarked,
  Search,
  Folder,
  Trash2,
  ExternalLink,
  Plus,
  StickyNote,
  BookmarkCheck,
  DownloadCloud,
  Clock,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { READ_LATER_COLLECTION, filterLibraryItems } from '../../utils/readLater';

export function LibraryView() {
  const { libraryItems, setSelectedArticle, isOnline, toggleReadLater } = useApp();
  const [selectedCollection, setSelectedCollection] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect distinct collections, prioritizing 'All' and 'Read Later'
  const customCollections = Array.from(
    new Set(libraryItems.map((item) => item.collection).filter((c) => c !== READ_LATER_COLLECTION))
  );
  const collections = ['All', READ_LATER_COLLECTION, ...customCollections];

  const filteredItems = filterLibraryItems(libraryItems, selectedCollection, searchQuery);

  const readLaterCount = libraryItems.filter(
    (item) => item.collection === READ_LATER_COLLECTION
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
              <BookMarked className="w-3.5 h-3.5" /> Private Knowledge Vault
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1">
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" /> Synced to Local Storage
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-400" /> Offline Reading Mode
                </>
              )}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Personal Library</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Access curated research references, private highlights, and articles saved for offline reading.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved vault..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* Collections Tabs with Read Later highlighted */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {collections.map((coll) => {
          const isSelected = selectedCollection === coll;
          const isReadLaterColl = coll === READ_LATER_COLLECTION;

          return (
            <button
              key={coll}
              onClick={() => setSelectedCollection(coll)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-mono whitespace-nowrap transition-all ${
                isSelected
                  ? isReadLaterColl
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
              }`}
            >
              {isReadLaterColl ? (
                <DownloadCloud className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Folder className="w-3.5 h-3.5" />
              )}
              <span>{coll}</span>
              {isReadLaterColl && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400">
                  {readLaterCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Empty State for Read Later */}
      {filteredItems.length === 0 && selectedCollection === READ_LATER_COLLECTION && (
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-[var(--border-color)] text-center space-y-3">
          <DownloadCloud className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
          <h3 className="font-bold text-base text-[var(--text-primary)]">No Read-Later Articles Yet</h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            Click &ldquo;Read Later&rdquo; on any article in your feed or within the reader modal to store it locally for instant offline access without internet connection.
          </p>
        </div>
      )}

      {/* Library Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isReadLater = item.collection === READ_LATER_COLLECTION;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl glass-panel glass-panel-hover border transition-all space-y-3 flex flex-col justify-between ${
                isReadLater ? 'border-emerald-500/30' : 'border-[var(--border-color)]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span
                    className={`px-2 py-0.5 rounded font-bold uppercase ${
                      isReadLater
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {isReadLater && <DownloadCloud className="w-3 h-3" />}
                    {item.collection}
                  </span>
                  <span className="text-[var(--text-muted)]">{item.createdAt}</span>
                </div>

                {item.post && (
                  <div>
                    <h3
                      onClick={() => setSelectedArticle(item.post!)}
                      className="font-bold text-sm text-[var(--text-primary)] hover:text-sky-400 cursor-pointer transition-colors line-clamp-2"
                    >
                      {item.post.title}
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      Author: {item.post.author.name} • {item.post.readingTime}m read
                    </p>
                  </div>
                )}

                {item.note && (
                  <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] italic">
                    &ldquo;{item.note}&rdquo;
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)] text-xs">
                {isReadLater ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-medium">
                    <BookmarkCheck className="w-3.5 h-3.5" /> Cached Offline
                  </span>
                ) : (
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">Vault Stored</span>
                )}

                <div className="flex items-center gap-2">
                  {item.post && isReadLater && (
                    <button
                      onClick={() => toggleReadLater(item.post!)}
                      className="p-1 text-[var(--text-muted)] hover:text-rose-400 transition-colors"
                      title="Remove from Read Later"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {item.post && (
                    <button
                      onClick={() => setSelectedArticle(item.post!)}
                      className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
