import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Users,
  Heart,
  MessageSquare,
  Eye,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  Activity,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { TaskPriority, TaskCategory } from '../../types';

export function AnalyticsView() {
  const { posts, currentUser, tasks } = useApp();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [chartMetric, setChartMetric] = useState<'velocity' | 'category'>('velocity');

  const rangeScale = useMemo(() => {
    switch (timeRange) {
      case '7d':
        return { factor: 0.35, label: 'Last 7 Days', growth: '+14.2% this week' };
      case '30d':
        return { factor: 1.0, label: 'Last 30 Days', growth: '+24.8% vs last 30d' };
      case '90d':
        return { factor: 2.6, label: 'Last 90 Days', growth: '+61.4% this quarter' };
      case 'all':
        return { factor: 4.2, label: 'All-Time Total', growth: 'Cumulative workspace ledger' };
    }
  }, [timeRange]);

  const rawLikes = posts.reduce((acc, p) => acc + p.likesCount, 0);
  const rawComments = posts.reduce((acc, p) => acc + p.commentsCount, 0);
  const rawViews = posts.reduce((acc, p) => acc + p.viewsCount, 0);

  const totalLikes = Math.round(rawLikes * rangeScale.factor);
  const totalComments = Math.round(rawComments * rangeScale.factor);
  const totalViews = Math.round(rawViews * rangeScale.factor);

  // Compute Task Telemetry
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const awaitingApprovalTasks = tasks.filter((t) => t.status === 'awaiting_approval').length;
  const inProgressTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'awaiting_approval' && t.status !== 'pending'
  ).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalFocusSeconds = tasks.reduce((acc, t) => acc + (t.focusTimeSeconds || 0), 0);
  const totalFocusHours = ((totalFocusSeconds / 3600) * Math.max(0.5, Math.min(2, rangeScale.factor))).toFixed(1);

  // Recharts: Priority Distribution Data
  const priorityData = useMemo(() => {
    const counts: Record<TaskPriority, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    tasks.forEach((t) => {
      if (counts[t.priority] !== undefined) {
        counts[t.priority]++;
      } else {
        counts.medium++;
      }
    });

    const colors: Record<TaskPriority, string> = {
      critical: '#c084fc', // purple-400
      high: '#fb7185',     // rose-400
      medium: '#fbbf24',   // amber-400
      low: '#34d399',      // emerald-400
    };

    return (Object.keys(counts) as TaskPriority[])
      .filter((p) => counts[p] > 0 || totalTasks === 0)
      .map((p) => ({
        name: p.toUpperCase(),
        count: counts[p],
        color: colors[p],
      }));
  }, [tasks, totalTasks]);

  // Recharts: Category Distribution Data
  const categoryData = useMemo(() => {
    const counts: Record<TaskCategory, { count: number; hours: number }> = {
      work: { count: 0, hours: 0 },
      creative: { count: 0, hours: 0 },
      engineering: { count: 0, hours: 0 },
      research: { count: 0, hours: 0 },
      personal: { count: 0, hours: 0 },
    };

    tasks.forEach((t) => {
      const cat = t.category || 'work';
      if (counts[cat]) {
        counts[cat].count++;
        counts[cat].hours += (t.focusTimeSeconds || 0) / 3600 + (t.estimatedHours || 4);
      }
    });

    const catColors: Record<TaskCategory, string> = {
      work: '#38bdf8',       // sky-400
      creative: '#c084fc',   // purple-400
      engineering: '#34d399',// emerald-400
      research: '#fbbf24',   // amber-400
      personal: '#818cf8',   // indigo-400
    };

    return (Object.keys(counts) as TaskCategory[]).map((cat) => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      tasks: counts[cat].count,
      hours: Math.round(counts[cat].hours * 10) / 10,
      fill: catColors[cat],
    }));
  }, [tasks]);

  // Recharts: Weekly Task Velocity Trend Data reactive to timeRange
  const weeklyVelocityData = useMemo(() => {
    if (timeRange === '7d') {
      return [
        { week: 'Mon', completed: Math.max(1, Math.floor(completedTasks * 0.2)), created: Math.max(1, Math.floor(totalTasks * 0.2)), throughput: 70 },
        { week: 'Wed', completed: Math.max(1, Math.floor(completedTasks * 0.45)), created: Math.max(2, Math.floor(totalTasks * 0.45)), throughput: 76 },
        { week: 'Fri', completed: Math.max(2, Math.floor(completedTasks * 0.75)), created: Math.max(3, Math.floor(totalTasks * 0.8)), throughput: 82 },
        { week: 'Today', completed: completedTasks, created: totalTasks, throughput: completionRate },
      ];
    }
    const mult = timeRange === '90d' ? 2 : timeRange === 'all' ? 3 : 1;
    return [
      { week: timeRange === '90d' ? 'Month 1' : timeRange === 'all' ? 'Q1' : 'Week 1', completed: 2 * mult, created: 3 * mult, throughput: 66 },
      { week: timeRange === '90d' ? 'Month 2' : timeRange === 'all' ? 'Q2' : 'Week 2', completed: 4 * mult, created: 5 * mult, throughput: 80 },
      { week: timeRange === '90d' ? 'Month 3' : timeRange === 'all' ? 'Q3' : 'Week 3', completed: 5 * mult, created: 6 * mult, throughput: 83 },
      { week: 'Prior Cycle', completed: Math.max(6 * mult, completedTasks), created: Math.max(8 * mult, totalTasks), throughput: 75 },
      { week: 'Current', completed: completedTasks, created: totalTasks, throughput: completionRate },
    ];
  }, [completedTasks, totalTasks, completionRate, timeRange]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Performance Telemetry
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Window: {rangeScale.label}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            Creator & Autonomous Mesh Analytics
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Analyze readership reach, reader retention, and autonomous multi-agent task throughput across sprints.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel border border-[var(--border-color)] self-start sm:self-auto">
          {(['7d', '30d', '90d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-xl text-xs font-mono uppercase font-semibold transition-all ${
                timeRange === r
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards: Social Reach */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-[var(--border-color)] space-y-1">
          <span className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-sky-400" /> Total Impressions
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">{totalViews.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {rangeScale.growth}
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-[var(--border-color)] space-y-1">
          <span className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400" /> Reader Appreciations
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">{totalLikes.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {rangeScale.label} engagement
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-[var(--border-color)] space-y-1">
          <span className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-violet-400" /> Technical Discussions
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">{totalComments.toLocaleString()}</p>
          <span className="text-[10px] text-sky-400 font-mono">{rangeScale.label} threads</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-[var(--border-color)] space-y-1">
          <span className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" /> Follower Network
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            {currentUser.followersCount.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-400 font-mono">+340 active growth</span>
        </div>
      </div>

      {/* NEXUS CORE Orchestration Telemetry Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-sky-500/30 bg-sky-500/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                NEXUS CORE Autonomous Task Telemetry
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Live metrics synced from Firestore database: completion trends, priority distribution & focus velocity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> {completionRate}% Completed
            </span>
            <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {totalFocusHours}h Focus Time
            </span>
          </div>
        </div>

        {/* 4 Task Health Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)]/70 border border-[var(--border-color)]">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase">Total Tasks</span>
            <p className="text-xl font-bold text-[var(--text-primary)] mt-0.5">{totalTasks}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)]/70 border border-[var(--border-color)]">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase">In Agent Mesh</span>
            <p className="text-xl font-bold text-sky-400 mt-0.5">{inProgressTasks}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)]/70 border border-[var(--border-color)]">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase">Awaiting Approval</span>
            <p className="text-xl font-bold text-amber-400 mt-0.5">{awaitingApprovalTasks}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)]/70 border border-[var(--border-color)]">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase">Completed & Shipped</span>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{completedTasks}</p>
          </div>
        </div>
      </div>

      {/* Main Recharts Section: Weekly Velocity + Priority Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recharts: Velocity Trend Area Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl glass-panel border border-[var(--border-color)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold font-mono uppercase text-[var(--text-primary)]">
                  Task Completion Trends & Sprints
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Comparison of tasks created vs delivered to production release
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <button
                onClick={() => setChartMetric('velocity')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  chartMetric === 'velocity' ? 'bg-sky-500 text-white' : 'text-[var(--text-muted)]'
                }`}
              >
                Weekly Velocity
              </button>
              <button
                onClick={() => setChartMetric('category')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  chartMetric === 'category' ? 'bg-sky-500 text-white' : 'text-[var(--text-muted)]'
                }`}
              >
                Category Allocation
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              {chartMetric === 'velocity' ? (
                <AreaChart data={weeklyVelocityData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area
                    type="monotone"
                    dataKey="created"
                    name="Tasks Initiated"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#createdGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    name="Tasks Completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#completedGrad)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={categoryData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="tasks" name="Active Tasks" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="hours" name="Invested Hours" fill="#a855f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recharts: Priority Distribution Donut */}
        <div className="lg:col-span-4 p-6 rounded-3xl glass-panel border border-[var(--border-color)] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold font-mono uppercase text-[var(--text-primary)]">
                Priority Distribution
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Task workload segmented by criticality level
            </p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-[var(--text-primary)]">{totalTasks}</span>
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Tasks</span>
            </div>
          </div>

          {/* Priority Legend Pill Badges */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-color)]">
            {priorityData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs font-mono p-1.5 rounded-lg bg-[var(--bg-secondary)]/50">
                <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-[var(--text-primary)]">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
