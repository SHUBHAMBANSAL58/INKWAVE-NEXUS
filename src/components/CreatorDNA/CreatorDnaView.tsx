import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateCreatorDNA } from '../../utils/creatorDna';
import { loadFromCache, saveToCache, CACHE_KEYS } from '../../utils/offlineStorage';
import { CreatorDNA } from '../../types';
import { Dna, ShieldCheck, RefreshCw, Edit3 } from 'lucide-react';

export function CreatorDnaView() {
  const { currentUser, posts } = useApp();
  const [dna, setDna] = useState<CreatorDNA>(() => {
    const calculated = calculateCreatorDNA(currentUser.id, posts);
    const savedOverrides = loadFromCache<Record<string, string>>(CACHE_KEYS.CREATOR_DNA_SUMMARY, {});
    return savedOverrides[currentUser.id]
      ? { ...calculated, summary: savedOverrides[currentUser.id] }
      : calculated;
  });
  const [isEditing, setIsEditing] = useState(false);
  const [customSummary, setCustomSummary] = useState(dna.summary);

  useEffect(() => {
    const calculated = calculateCreatorDNA(currentUser.id, posts);
    const savedOverrides = loadFromCache<Record<string, string>>(CACHE_KEYS.CREATOR_DNA_SUMMARY, {});
    const summary = savedOverrides[currentUser.id] || calculated.summary;
    setDna({ ...calculated, summary });
    setCustomSummary(summary);
  }, [currentUser.id, posts]);

  // Compute SVG Radar polygon points for 5 axes
  // Center is (150, 150), radius is 100
  const center = 150;
  const radius = 95;
  const axes = [
    { label: 'Analytical', value: dna.styleRadar.analytical, angle: -Math.PI / 2 },
    { label: 'Storytelling', value: dna.styleRadar.storytelling, angle: -Math.PI / 2 + (2 * Math.PI) / 5 },
    { label: 'Conciseness', value: dna.styleRadar.conciseness, angle: -Math.PI / 2 + (4 * Math.PI) / 5 },
    { label: 'Technical Depth', value: dna.styleRadar.technicalDepth, angle: -Math.PI / 2 + (6 * Math.PI) / 5 },
    { label: 'Engagement', value: dna.styleRadar.engagement, angle: -Math.PI / 2 + (8 * Math.PI) / 5 },
  ];

  const polygonPoints = axes
    .map((ax) => {
      const r = (ax.value / 100) * radius;
      const x = center + r * Math.cos(ax.angle);
      const y = center + r * Math.sin(ax.angle);
      return `${x},${y}`;
    })
    .join(' ');

  const handleSaveCustomSummary = () => {
    const trimmed = customSummary.trim();
    if (!trimmed) return;
    const savedOverrides = loadFromCache<Record<string, string>>(CACHE_KEYS.CREATOR_DNA_SUMMARY, {});
    saveToCache(CACHE_KEYS.CREATOR_DNA_SUMMARY, { ...savedOverrides, [currentUser.id]: trimmed });
    setDna((prev) => ({ ...prev, summary: trimmed }));
    setIsEditing(false);
  };

  const handleResetDna = () => {
    const savedOverrides = loadFromCache<Record<string, string>>(CACHE_KEYS.CREATOR_DNA_SUMMARY, {});
    delete savedOverrides[currentUser.id];
    saveToCache(CACHE_KEYS.CREATOR_DNA_SUMMARY, savedOverrides);
    const fresh = calculateCreatorDNA(currentUser.id, posts);
    setDna(fresh);
    setCustomSummary(fresh.summary);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5" /> Biometric Stylistics
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">Transparent Identity Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">INKWAVE Creator DNA</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Algorithmic insights into your stylistic consistency, technical depth, vocabulary richness, and topic affinity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDna}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-[var(--text-secondary)] hover:text-sky-400 border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"
            title="Recalculate DNA from latest posts"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Recalculate
          </button>
        </div>
      </div>

      {/* Main Grid: Radar on Left, Metrics & Topics on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Style Radar Card */}
        <div className="md:col-span-6 rounded-3xl glass-panel p-6 border border-[var(--border-color)] flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-full flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
            <h3 className="text-xs font-mono font-bold uppercase text-[var(--text-muted)]">5-Axis Stylistic Radar</h3>
            <span className="text-[11px] font-mono text-sky-400">0 - 100 Scale</span>
          </div>

          <div className="relative w-72 h-72">
            <svg viewBox="0 0 300 300" className="w-full h-full select-none">
              {/* Background Concentric Rings (25%, 50%, 75%, 100%) */}
              {[0.25, 0.5, 0.75, 1.0].map((level) => {
                const ringPoints = axes
                  .map((ax) => {
                    const r = level * radius;
                    const x = center + r * Math.cos(ax.angle);
                    const y = center + r * Math.sin(ax.angle);
                    return `${x},${y}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={level}
                    points={ringPoints}
                    fill="none"
                    stroke="rgba(148, 163, 184, 0.15)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Axis Spoke Lines */}
              {axes.map((ax, i) => {
                const x = center + radius * Math.cos(ax.angle);
                const y = center + radius * Math.sin(ax.angle);
                return (
                  <line
                    key={i}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="rgba(148, 163, 184, 0.2)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* User DNA Polygon */}
              <polygon
                points={polygonPoints}
                fill="rgba(56, 189, 248, 0.25)"
                stroke="#38bdf8"
                strokeWidth="2.5"
                className="transition-all duration-500"
              />

              {/* Data Points & Vertex Circles */}
              {axes.map((ax, i) => {
                const r = (ax.value / 100) * radius;
                const x = center + r * Math.cos(ax.angle);
                const y = center + r * Math.sin(ax.angle);

                // Label positions
                const labelR = radius + 22;
                const lx = center + labelR * Math.cos(ax.angle);
                const ly = center + labelR * Math.sin(ax.angle);

                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="4" fill="#38bdf8" stroke="#0a0e17" strokeWidth="2" />
                    <text
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#94a3b8"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="Space Grotesk, sans-serif"
                    >
                      {ax.label} ({ax.value})
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <p className="text-xs text-[var(--text-secondary)] italic">
            Visualizes balance between empirical analytical rigor and engaging storytelling cadence.
          </p>
        </div>

        {/* Metrics & Topic Breakdown */}
        <div className="md:col-span-6 space-y-4">
          {/* Consistency & Richness Gauges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl glass-panel border border-[var(--border-color)]">
              <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Consistency Score</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-sky-400">{dna.consistencyScore}%</span>
                <span className="text-[10px] text-emerald-400 font-mono">High Cadence</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--bg-secondary)] mt-2 overflow-hidden">
                <div className="h-full bg-sky-400 rounded-full" style={{ width: `${dna.consistencyScore}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-[var(--border-color)]">
              <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Vocabulary Richness</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-violet-400">{dna.vocabularyRichness}%</span>
                <span className="text-[10px] text-violet-400 font-mono">Lexical Depth</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--bg-secondary)] mt-2 overflow-hidden">
                <div className="h-full bg-violet-400 rounded-full" style={{ width: `${dna.vocabularyRichness}%` }} />
              </div>
            </div>
          </div>

          {/* Dominant Topics */}
          <div className="p-5 rounded-2xl glass-panel border border-[var(--border-color)] space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-[var(--text-muted)]">
              Dominant Topic Distribution
            </h4>
            <div className="space-y-2">
              {dna.dominantTopics.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-primary)]">{item.topic}</span>
                    <span className="font-mono text-sky-400">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transparent AI Persona Summary & Privacy */}
          <div className="p-5 rounded-2xl glass-panel border border-[var(--border-color)] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase text-[var(--text-muted)] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Transparent Identity Synthesis
              </h4>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-sky-400 hover:text-sky-300 font-mono flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> {isEditing ? 'Cancel' : 'Edit DNA'}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={customSummary}
                  onChange={(e) => setCustomSummary(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={handleSaveCustomSummary}
                  className="px-3 py-1.5 rounded-xl bg-sky-500 text-white font-semibold text-xs"
                >
                  Save Modifications
                </button>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                "{dna.summary}"
              </p>
            )}

            <p className="text-[10px] text-[var(--text-muted)] font-mono">
              Note: Creator DNA is calculated deterministically on approved public publications. Never shared with third
              parties without explicit consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
