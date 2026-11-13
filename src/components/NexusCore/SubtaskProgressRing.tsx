import React from 'react';
import { TaskSubtask } from '../../types';
import { calculateSubtaskProgress } from '../../utils/subtaskProgress';

interface SubtaskProgressRingProps {
  subtasks?: TaskSubtask[];
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  className?: string;
}

export function SubtaskProgressRing({
  subtasks,
  size = 36,
  strokeWidth = 3.5,
  showText = true,
  className = '',
}: SubtaskProgressRingProps) {
  const metrics = calculateSubtaskProgress(subtasks, size, strokeWidth);

  const ringStrokeClass =
    metrics.status === 'complete'
      ? 'stroke-emerald-400'
      : metrics.status === 'in_progress'
      ? 'stroke-sky-400'
      : 'stroke-slate-600/40';

  const percentageTextClass =
    metrics.status === 'complete'
      ? 'text-emerald-400'
      : metrics.status === 'in_progress'
      ? 'text-sky-300'
      : 'text-[var(--text-muted)]';

  return (
    <div
      role="progressbar"
      aria-valuenow={metrics.percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Subtask completion: ${metrics.completed} of ${metrics.total} (${metrics.percentage}%)`}
      className={`inline-flex items-center gap-2 ${className}`}
      data-testid="subtask-progress-ring"
    >
      <div
        className="relative flex items-center justify-center shrink-0"
        style={{ width: metrics.size, height: metrics.size }}
      >
        <svg
          width={metrics.size}
          height={metrics.size}
          viewBox={`0 0 ${metrics.size} ${metrics.size}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={metrics.center}
            cy={metrics.center}
            r={metrics.radius}
            fill="none"
            strokeWidth={metrics.strokeWidth}
            className="stroke-slate-500/20"
          />
          <circle
            cx={metrics.center}
            cy={metrics.center}
            r={metrics.radius}
            fill="none"
            strokeWidth={metrics.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={metrics.circumference}
            strokeDashoffset={metrics.strokeDashoffset}
            className={`${ringStrokeClass} transition-[stroke-dashoffset,stroke] duration-500 ease-out`}
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold tabular-nums leading-none ${percentageTextClass}`}
        >
          {metrics.percentage}%
        </span>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] font-mono font-semibold text-[var(--text-primary)] tabular-nums">
            {metrics.total > 0 ? `${metrics.completed}/${metrics.total} subtasks` : '0 subtasks'}
          </span>
          <span className="text-[9px] font-mono text-[var(--text-muted)]">
            {metrics.status === 'complete'
              ? 'All checks done'
              : metrics.status === 'in_progress'
              ? 'In progress'
              : 'No checklist yet'}
          </span>
        </div>
      )}
    </div>
  );
}
