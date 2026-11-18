import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { KnowledgeGraphNode } from '../../types';
import { INITIAL_KNOWLEDGE_NODES } from '../../mockData';
import { Share2, ExternalLink } from 'lucide-react';

const BASE_COORDINATES: Record<string, { x: number; y: number; color: string; stroke: string }> = {
  'node-post-1': { x: 300, y: 160, color: '#38bdf8', stroke: '#0284c7' },
  'node-post-2': { x: 580, y: 320, color: '#38bdf8', stroke: '#0284c7' },
  'node-post-3': { x: 180, y: 340, color: '#38bdf8', stroke: '#0284c7' },
  'node-topic-ai': { x: 420, y: 110, color: '#818cf8', stroke: '#4f46e5' },
  'node-topic-multi-agent': { x: 260, y: 260, color: '#818cf8', stroke: '#4f46e5' },
  'node-topic-design': { x: 620, y: 220, color: '#818cf8', stroke: '#4f46e5' },
  'node-author-alex': { x: 160, y: 130, color: '#22d3ee', stroke: '#0891b2' },
  'node-author-elena': { x: 690, y: 360, color: '#22d3ee', stroke: '#0891b2' },
  'node-author-marcus': { x: 200, y: 425, color: '#22d3ee', stroke: '#0891b2' },
  'node-comm-ai': { x: 440, y: 260, color: '#34d399', stroke: '#059669' },
  'node-comm-design': { x: 500, y: 400, color: '#34d399', stroke: '#059669' },
};

export function KnowledgeGraphView() {
  const { setSelectedArticle, posts, focusedNodeId, setFocusedNodeId } = useApp();
  const [selectedNodeId, setSelectedNodeId] = useState<string>(focusedNodeId || 'node-post-1');
  const [typeFilter, setTypeFilter] = useState<'all' | 'article' | 'topic' | 'author' | 'community'>('all');

  React.useEffect(() => {
    if (focusedNodeId) {
      setSelectedNodeId(focusedNodeId);
      setTypeFilter('all');
      setFocusedNodeId(null);
    }
  }, [focusedNodeId, setFocusedNodeId]);

  // Merge initial graph with any newly published articles created in this session
  const { nodes, nodeCoords } = useMemo(() => {
    const knownLabels = INITIAL_KNOWLEDGE_NODES.map((n) => n.label.toLowerCase());
    const dynamicNodes: KnowledgeGraphNode[] = [...INITIAL_KNOWLEDGE_NODES];
    const coords: Record<string, { x: number; y: number; color: string; stroke: string }> = { ...BASE_COORDINATES };

    const extraPosts = posts
      .filter((p) => {
        const lowerTitle = p.title.toLowerCase();
        return !knownLabels.some((lbl) => lowerTitle.startsWith(lbl) || lbl.startsWith(lowerTitle));
      })
      .slice(0, 4);

    extraPosts.forEach((post, idx) => {
      const nodeId = `node-dyn-${post.id}`;
      const angle = (idx / Math.max(1, extraPosts.length)) * Math.PI * 1.4 - 0.6;
      coords[nodeId] = {
        x: Math.round(400 + Math.cos(angle) * 230),
        y: Math.round(250 + Math.sin(angle) * 155),
        color: '#38bdf8',
        stroke: '#0284c7',
      };
      dynamicNodes.push({
        id: nodeId,
        label: post.title.length > 28 ? `${post.title.slice(0, 26)}…` : post.title,
        type: 'article',
        group: post.category || 'Published',
        connections: ['node-topic-ai', 'node-author-alex'],
      });
    });

    return { nodes: dynamicNodes, nodeCoords: coords };
  }, [posts]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const filteredNodes = typeFilter === 'all' ? nodes : nodes.filter((n) => n.type === typeFilter);
  const connectedNodeIds = new Set(selectedNode?.connections || []);

  const handleOpenLinkedArticle = () => {
    if (!selectedNode) return;
    const targetPrefix = selectedNode.label.replace(/…$/, '').toLowerCase().slice(0, 10);
    const post =
      posts.find((p) => `node-dyn-${p.id}` === selectedNode.id) ||
      posts.find((p) => p.title.toLowerCase().includes(targetPrefix));
    if (post) setSelectedArticle(post);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5" /> Semantic Mesh
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">Relational Knowledge Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Interactive Knowledge Graph</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xl">
            Explore interconnected pathways between published research, creators, topic tags, and community worlds.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl glass-panel border border-[var(--border-color)]">
          {(['all', 'article', 'topic', 'author', 'community'] as const).map((t) => (
            <button
              type="button"
              key={t}
              aria-pressed={typeFilter === t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold capitalize transition-all ${
                typeFilter === t
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Graph & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Graph Surface */}
        <div className="lg:col-span-8 rounded-3xl glass-panel p-4 border border-[var(--border-color)] relative overflow-hidden min-h-[500px] flex items-center justify-center">
          <svg viewBox="0 0 800 500" className="w-full h-full select-none" role="img" aria-label="Interactive knowledge topology graph">
            {/* Edges / Connections */}
            {nodes.map((node) => {
              const startCoords = nodeCoords[node.id];
              if (!startCoords) return null;

              return node.connections.map((targetId) => {
                const endCoords = nodeCoords[targetId];
                if (!endCoords) return null;

                const isHighlighted =
                  node.id === selectedNodeId ||
                  targetId === selectedNodeId ||
                  (connectedNodeIds.has(node.id) && connectedNodeIds.has(targetId));

                return (
                  <line
                    key={`${node.id}-${targetId}`}
                    x1={startCoords.x}
                    y1={startCoords.y}
                    x2={endCoords.x}
                    y2={endCoords.y}
                    stroke={isHighlighted ? '#38bdf8' : 'rgba(148, 163, 184, 0.22)'}
                    strokeWidth={isHighlighted ? 2.5 : 1}
                    strokeDasharray={isHighlighted ? 'none' : '3 3'}
                    className="transition-all duration-300"
                  />
                );
              });
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const coords = nodeCoords[node.id] || { x: 400, y: 250, color: '#38bdf8', stroke: '#0284c7' };
              const isSelected = node.id === selectedNodeId;

              return (
                <g
                  key={node.id}
                  transform={`translate(${coords.x}, ${coords.y})`}
                  onClick={() => setSelectedNodeId(node.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedNodeId(node.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${node.type}: ${node.label}`}
                  className="cursor-pointer group focus:outline-none"
                >
                  {isSelected && (
                    <circle r="26" fill="none" stroke={coords.color} strokeWidth="2" opacity="0.6" className="animate-ping" />
                  )}

                  <circle
                    r={isSelected ? 18 : 13}
                    fill={coords.color}
                    stroke="#0a0e17"
                    strokeWidth="3"
                    className="transition-all duration-200 group-hover:scale-125"
                  />

                  <text
                    y={isSelected ? 32 : 26}
                    textAnchor="middle"
                    fill={isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'}
                    fontSize={isSelected ? '12' : '10'}
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    className="pointer-events-none transition-all"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Graph Legend HUD */}
          <div className="absolute top-4 right-4 p-2.5 rounded-xl bg-[var(--bg-primary)]/85 backdrop-blur-md border border-[var(--border-color)] text-[10px] font-mono space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
              <span className="text-[var(--text-secondary)]">Articles</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#818cf8]" />
              <span className="text-[var(--text-secondary)]">Topics</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22d3ee]" />
              <span className="text-[var(--text-secondary)]">Creators</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
              <span className="text-[var(--text-secondary)]">Communities</span>
            </div>
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        <div className="lg:col-span-4 rounded-3xl glass-panel p-6 border border-[var(--border-color)] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold">
              Entity Type: {selectedNode.type}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">{selectedNode.group}</span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">{selectedNode.label}</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5">
              Semantic node with {selectedNode.connections.length} bidirectional connections across the INKWAVE NEXUS graph.
            </p>
          </div>

          {/* Connected Entities List */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-[var(--text-muted)] mb-2">
              Connected Nodes ({selectedNode.connections.length})
            </h4>
            <div className="space-y-1.5">
              {selectedNode.connections.map((connId) => {
                const targetNode = nodes.find((n) => n.id === connId);
                if (!targetNode) return null;
                return (
                  <button
                    type="button"
                    key={connId}
                    onClick={() => setSelectedNodeId(connId)}
                    className="w-full text-left p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-sky-500/40 text-xs flex items-center justify-between cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  >
                    <span className="font-semibold text-[var(--text-primary)]">{targetNode.label}</span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">{targetNode.type}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedNode.type === 'article' && (
            <button
              type="button"
              onClick={handleOpenLinkedArticle}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-sky-500/20"
            >
              <ExternalLink className="w-4 h-4" /> Open Article in Reader
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
