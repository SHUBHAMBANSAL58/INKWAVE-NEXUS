import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CosmicCanvas, ConstellationNodeData } from '../Cosmic/CosmicCanvas';
import {
  Share2,
  Filter,
  Sparkles,
  BookOpen,
  ArrowRight,
  Globe,
  Compass,
  Cpu,
  Layers,
  Search,
} from 'lucide-react';

export function ConstellationView() {
  const { posts, communities, setSelectedArticle, setActiveView } = useApp();
  const [selectedNode, setSelectedNode] = useState<ConstellationNodeData | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'article' | 'community' | 'idea'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenTarget = (node: ConstellationNodeData) => {
    if (node.type === 'article' && node.targetId) {
      const post = posts.find((p) => p.id === node.targetId);
      if (post) setSelectedArticle(post);
    } else if (node.type === 'community') {
      setActiveView('communities');
    } else if (node.id === 'node-nexus-core') {
      setActiveView('nexus-core');
    }
  };

  const normalizedQuery = searchTerm.trim().toLowerCase();
  const filteredPosts =
    filterType === 'all' || filterType === 'article'
      ? posts.filter(
          (p) =>
            !normalizedQuery ||
            p.title.toLowerCase().includes(normalizedQuery) ||
            p.excerpt.toLowerCase().includes(normalizedQuery) ||
            p.category.toLowerCase().includes(normalizedQuery)
        )
      : [];

  const filteredCommunities =
    filterType === 'all' || filterType === 'community'
      ? communities.filter(
          (c) =>
            !normalizedQuery ||
            c.name.toLowerCase().includes(normalizedQuery) ||
            c.description.toLowerCase().includes(normalizedQuery) ||
            c.topics.some((t) => t.toLowerCase().includes(normalizedQuery))
        )
      : [];

  const showNexusNode =
    (filterType === 'all' || filterType === 'idea') &&
    (!normalizedQuery ||
      'nexus mesh core 4-agent ai collective'.includes(normalizedQuery));

  const visibleCount = filteredPosts.length + filteredCommunities.length + (showNexusNode ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header with Title and Filtering */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-sky-400 font-bold mb-1">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Spatial Knowledge Universe</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            Idea Constellation 3D
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Navigate ideas across non-linear spatial dimensions. Click any celestial body to inspect connections.
          </p>
        </div>

        {/* Search + Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter celestial nodes..."
              aria-label="Filter celestial nodes"
              className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500 w-full sm:w-48"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium font-mono transition-all ${
                filterType === 'all'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)]'
              }`}
            >
              All Celestial Nodes
            </button>
            <button
              onClick={() => setFilterType('article')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium font-mono transition-all ${
                filterType === 'article'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)]'
              }`}
            >
              Articles
            </button>
            <button
              onClick={() => setFilterType('community')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium font-mono transition-all ${
                filterType === 'community'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)]'
              }`}
            >
              Communities
            </button>
            <button
              onClick={() => setFilterType('idea')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium font-mono transition-all ${
                filterType === 'idea'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)]'
              }`}
            >
              NEXUS Core Mesh
            </button>
          </div>
        </div>
      </div>

      {/* Main 3D Canvas Stage */}
      <div className="relative">
        <CosmicCanvas
          interactive={true}
          onNodeSelect={setSelectedNode}
          heightClass="h-[580px] sm:h-[640px]"
          filterType={filterType}
          searchTerm={searchTerm}
        />

        {/* Selected Node Inspector Drawer (Bottom Left Overlay) */}
        {selectedNode && (
          <div className="absolute bottom-6 left-6 z-30 max-w-md w-[calc(100%-3rem)] sm:w-96 p-5 rounded-2xl glass-panel border border-sky-500/40 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider mb-1"
                  style={{ backgroundColor: `${selectedNode.color}25`, color: selectedNode.color }}
                >
                  {selectedNode.type} • {selectedNode.category || 'Topic Cluster'}
                </span>
                <h3 className="font-bold text-base text-white leading-tight">
                  {selectedNode.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-[var(--text-muted)] hover:text-white p-1 text-sm"
                aria-label="Close inspector"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)] line-clamp-3 mb-4 leading-relaxed">
              {selectedNode.details}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenTarget(selectedNode)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-sky-500/20"
              >
                <BookOpen className="w-4 h-4" />
                <span>
                  {selectedNode.type === 'article'
                    ? 'Read Publication'
                    : selectedNode.type === 'community'
                    ? 'Enter Community World'
                    : 'Open Agent Engine'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Constellation Discovery Directory */}
      <div className="p-6 rounded-3xl glass-panel border border-[var(--border-color)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <h3 className="font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
            <Share2 className="w-4 h-4 text-sky-400" />
            <span>Active Celestial Nodes in Topology</span>
          </h3>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            {visibleCount} matching vertices
          </span>
        </div>

        {visibleCount === 0 ? (
          <div className="py-10 text-center space-y-3">
            <p className="text-sm text-[var(--text-secondary)]">
              No celestial nodes match your current filter criteria.
            </p>
            <button
              onClick={() => {
                setFilterType('all');
                setSearchTerm('');
              }}
              className="px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-mono font-bold hover:bg-sky-500/30"
            >
              Reset Constellation Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {showNexusNode && (
              <div
                onClick={() => setActiveView('nexus-core')}
                className="p-4 rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    4-Agent Collective
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400">Core Vertex</span>
                </div>
                <h4 className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-cyan-300 transition-colors">
                  NEXUS MESH CORE
                </h4>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1.5">
                  Autonomous multi-agent intelligence orchestrating design, planning, code, and verification.
                </p>
                <div className="mt-3 pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>Multi-Agent Engine</span>
                  <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">Open Engine →</span>
                </div>
              </div>
            )}

            {filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedArticle(post)}
                className="p-4 rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-sky-500/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {post.category}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    {post.readingTime}m read
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-sky-300 transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1.5">
                  {post.excerpt}
                </p>
                <div className="mt-3 pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>By {post.author.name}</span>
                  <span className="text-sky-400 group-hover:translate-x-1 transition-transform">Explore →</span>
                </div>
              </div>
            ))}

            {filteredCommunities.map((comm) => (
              <div
                key={comm.id}
                onClick={() => setActiveView('communities')}
                className="p-4 rounded-2xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-purple-500/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Community World
                  </span>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    {comm.membersCount} members
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-purple-300 transition-colors line-clamp-1">
                  {comm.name}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1.5">
                  {comm.description}
                </p>
                <div className="mt-3 pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span>{comm.topics.join(', ')}</span>
                  <span className="text-purple-400 group-hover:translate-x-1 transition-transform">Enter World →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
