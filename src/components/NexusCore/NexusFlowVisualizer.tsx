import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { AgentTask, TaskPriority } from '../../types';
import { wouldCreateDependencyCycle } from '../../utils/taskDependencies';
import {
  Link2,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';

interface NexusFlowVisualizerProps {
  tasks: AgentTask[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onLinkTasks?: (sourceTaskId: string, targetTaskId: string) => void;
  onUpdatePriority?: (taskId: string, priority: TaskPriority) => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  status: string;
  priority: TaskPriority;
  category: string;
  projectFolder?: string;
  activeAgent: string;
  blockedByCount: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

export function NexusFlowVisualizer({
  tasks,
  selectedTaskId,
  onSelectTask,
  onLinkTasks,
  onUpdatePriority,
}: NexusFlowVisualizerProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLinkingMode, setIsLinkingMode] = useState(false);
  const [linkingSourceId, setLinkingSourceId] = useState<string | null>(null);
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('all');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Refs prevent resetting D3 force simulation and zoom when selection or linking mode toggles
  const isLinkingModeRef = useRef(isLinkingMode);
  const linkingSourceIdRef = useRef(linkingSourceId);
  const tasksRef = useRef(tasks);
  useEffect(() => {
    isLinkingModeRef.current = isLinkingMode;
  }, [isLinkingMode]);
  useEffect(() => {
    linkingSourceIdRef.current = linkingSourceId;
  }, [linkingSourceId]);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // Derive unique project folders
  const folders = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.projectFolder) set.add(t.projectFolder);
    });
    return Array.from(set);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (selectedFolderFilter === 'all') return tasks;
    return tasks.filter((t) => t.projectFolder === selectedFolderFilter);
  }, [tasks, selectedFolderFilter]);

  // Color mappings
  const priorityColors: Record<TaskPriority, string> = {
    critical: '#c084fc',
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
  };

  const statusColors: Record<string, string> = {
    completed: '#10b981',
    building: '#0284c7',
    planning: '#8b5cf6',
    awaiting_approval: '#f59e0b',
    pending: '#64748b',
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = 520;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Define Arrow Marker
    const defs = svg.append('defs');

    defs
      .append('marker')
      .attr('id', 'nexus-flow-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 38)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#38bdf8');

    defs
      .append('marker')
      .attr('id', 'nexus-flow-arrow-highlight')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 38)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#a855f7');

    const g = svg.append('g').attr('class', 'main-flow-container');

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Prepare Nodes & Links
    const nodes: GraphNode[] = filteredTasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      category: t.category || 'work',
      projectFolder: t.projectFolder,
      activeAgent: t.activeAgent,
      blockedByCount: t.blockedByTaskIds?.length || 0,
    }));

    const taskIdsSet = new Set(nodes.map((n) => n.id));
    const links: GraphLink[] = [];

    filteredTasks.forEach((t) => {
      if (Array.isArray(t.blockedByTaskIds)) {
        t.blockedByTaskIds.forEach((prereqId) => {
          if (taskIdsSet.has(prereqId)) {
            // Prerequisite points to blocked task
            links.push({
              source: prereqId,
              target: t.id,
            });
          }
        });
      }
    });

    // Force Simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(110)
      )
      .force('charge', d3.forceManyBody().strength(-380))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(48));

    // Render Links
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#38bdf8')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,3')
      .attr('marker-end', 'url(#nexus-flow-arrow)');

    // Render Nodes Group
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node cursor-pointer')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Outer Aura Ring for Selected / Link Source
    node
      .append('circle')
      .attr('class', 'aura-ring transition-all')
      .attr('r', 32)
      .attr('fill', 'none')
      .attr('stroke', (d) =>
        d.id === linkingSourceId ? '#a855f7' : d.id === selectedTaskId ? '#38bdf8' : 'transparent'
      )
      .attr('stroke-width', 3);

    // Main Card Body Circle
    node
      .append('circle')
      .attr('r', 26)
      .attr('fill', '#090d16')
      .attr('stroke', (d) => priorityColors[d.priority] || '#38bdf8')
      .attr('stroke-width', 2.5);

    // Inner Agent Badge / Icon Symbol
    node
      .append('circle')
      .attr('r', 10)
      .attr('fill', (d) => statusColors[d.status] || '#38bdf8')
      .attr('fill-opacity', 0.25)
      .attr('stroke', (d) => statusColors[d.status] || '#38bdf8')
      .attr('stroke-width', 1.5);

    // Blocked Lock Icon indicator
    node
      .filter((d) => d.blockedByCount > 0)
      .append('circle')
      .attr('cx', 18)
      .attr('cy', -18)
      .attr('r', 8)
      .attr('fill', '#f59e0b')
      .attr('stroke', '#090d16')
      .attr('stroke-width', 1.5);

    // Label: Task Title (truncated)
    node
      .append('text')
      .attr('y', 42)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e2e8f0')
      .attr('font-size', '10px')
      .attr('font-family', 'Space Grotesk, sans-serif')
      .attr('font-weight', '600')
      .text((d) => (d.title.length > 20 ? d.title.slice(0, 18) + '...' : d.title));

    // Priority Indicator Dot
    node
      .append('text')
      .attr('y', 54)
      .attr('text-anchor', 'middle')
      .attr('fill', (d) => priorityColors[d.priority])
      .attr('font-size', '8px')
      .attr('font-family', 'monospace')
      .text((d) => `[${d.priority.toUpperCase()}]`);

    // Node Click Handlers (Selection or Link Creation via live refs)
    node.on('click', (event, d) => {
      event.stopPropagation();
      if (isLinkingModeRef.current) {
        const sourceId = linkingSourceIdRef.current;
        if (!sourceId) {
          setLinkingSourceId(d.id);
          setFeedbackNotice(`Selected "${d.title}". Now click the task that depends on it.`);
        } else if (sourceId === d.id) {
          setLinkingSourceId(null);
          setFeedbackNotice('Cancelled link selection.');
        } else {
          if (wouldCreateDependencyCycle(tasksRef.current, sourceId, d.id)) {
            setFeedbackNotice('Cannot create circular dependency cycle between tasks.');
            setLinkingSourceId(null);
            setIsLinkingMode(false);
            return;
          }
          if (onLinkTasks) {
            onLinkTasks(sourceId, d.id);
            setFeedbackNotice(`Linked! "${d.title}" now depends on prerequisite.`);
          }
          setLinkingSourceId(null);
          setIsLinkingMode(false);
        }
      } else {
        onSelectTask(d.id);
      }
    });

    // Double-click to cycle priority
    node.on('dblclick', (event, d) => {
      event.stopPropagation();
      const priorities: TaskPriority[] = ['low', 'medium', 'high', 'critical'];
      const nextIdx = (priorities.indexOf(d.priority) + 1) % priorities.length;
      const nextPriority = priorities[nextIdx];
      if (onUpdatePriority) {
        onUpdatePriority(d.id, nextPriority);
        setFeedbackNotice(`Updated priority to ${nextPriority.toUpperCase()} for "${d.title}"`);
      }
    });

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [filteredTasks]);

  // Lightweight selection/link-source ring update without restarting force simulation
  useEffect(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .selectAll<SVGCircleElement, GraphNode>('circle.aura-ring')
      .attr('stroke', (d) =>
        d.id === linkingSourceId ? '#a855f7' : d.id === selectedTaskId ? '#38bdf8' : 'transparent'
      );
  }, [selectedTaskId, linkingSourceId]);

  return (
    <div
      ref={containerRef}
      className="glass-panel rounded-3xl border border-[var(--border-color)] overflow-hidden relative"
    >
      {/* Visualizer Top Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[var(--bg-secondary)]/70 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>NEXUS FLOW: Force-Directed Dependency Visualizer</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-sky-500/15 text-sky-300 border border-sky-500/30">
                D3.js
              </span>
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Interactive task topologies. Drag nodes to reorder, double-click to cycle priority, or use Link mode.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Folder filter dropdown */}
          {folders.length > 0 && (
            <div className="flex items-center gap-1.5 bg-[var(--bg-primary)] px-2.5 py-1.5 rounded-xl border border-[var(--border-color)] text-xs">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <select
                value={selectedFolderFilter}
                onChange={(e) => setSelectedFolderFilter(e.target.value)}
                className="bg-transparent text-[var(--text-primary)] text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">All Project Clusters</option>
                {folders.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Connect / Link Mode */}
          <button
            onClick={() => {
              setIsLinkingMode((prev) => !prev);
              setLinkingSourceId(null);
              setFeedbackNotice(
                !isLinkingMode
                  ? 'Link Mode Active: Click a prerequisite task, then click the dependent task.'
                  : null
              );
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isLinkingMode
                ? 'bg-purple-500 text-white border-purple-400 shadow-md shadow-purple-500/30 animate-pulse'
                : 'glass-panel text-purple-300 border-purple-500/30 hover:bg-white/5'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>{isLinkingMode ? 'Exit Link Mode' : 'Link Dependency'}</span>
          </button>
        </div>
      </div>

      {/* Floating Notice / Feedback Toast */}
      {feedbackNotice && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-sky-950/90 text-sky-200 border border-sky-400/50 text-xs shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in">
          <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>{feedbackNotice}</span>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="text-xs text-sky-400 hover:text-white font-bold ml-1"
          >
            ×
          </button>
        </div>
      )}

      {/* SVG Canvas */}
      <div className="relative w-full h-[520px] bg-[#070b13]">
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[var(--text-muted)]">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> High
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Med
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full border border-sky-400 border-dashed" /> Directed Dependency
          </div>
        </div>
      </div>
    </div>
  );
}
