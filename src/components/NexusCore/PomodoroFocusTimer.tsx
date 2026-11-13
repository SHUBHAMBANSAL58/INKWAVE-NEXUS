import React, { useState, useEffect, useRef } from 'react';
import { AgentTask } from '../../types';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Flame,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
} from 'lucide-react';

interface PomodoroFocusTimerProps {
  task?: AgentTask;
  onUpdateFocusTime?: (taskId: string, additionalSeconds: number) => void;
}

const PRESET_DURATIONS = [
  { label: '25m Focus', minutes: 25, type: 'focus' },
  { label: '50m Deep', minutes: 50, type: 'focus' },
  { label: '5m Break', minutes: 5, type: 'break' },
  { label: '15m Rest', minutes: 15, type: 'break' },
];

export function PomodoroFocusTimer({ task, onUpdateFocusTime }: PomodoroFocusTimerProps) {
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const accumulatedSecondsRef = useRef(0);

  // Countdown timer effect
  useEffect(() => {
    let interval: any = null;

    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setSessionCompleted(true);
            if (task && onUpdateFocusTime) {
              onUpdateFocusTime(task.id, accumulatedSecondsRef.current + 1);
              accumulatedSecondsRef.current = 0;
            }
            return 0;
          }
          accumulatedSecondsRef.current += 1;
          // Periodically sync every 30s to task
          if (accumulatedSecondsRef.current >= 30 && task && onUpdateFocusTime) {
            onUpdateFocusTime(task.id, accumulatedSecondsRef.current);
            accumulatedSecondsRef.current = 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining, task, onUpdateFocusTime]);

  const selectDuration = (mins: number) => {
    setIsActive(false);
    setTargetMinutes(mins);
    setSecondsRemaining(mins * 60);
    setSessionCompleted(false);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    setSessionCompleted(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsRemaining(targetMinutes * 60);
    setSessionCompleted(false);
    if (accumulatedSecondsRef.current > 0 && task && onUpdateFocusTime) {
      onUpdateFocusTime(task.id, accumulatedSecondsRef.current);
      accumulatedSecondsRef.current = 0;
    }
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalSeconds = targetMinutes * 60;
  const progressPct = ((totalSeconds - secondsRemaining) / totalSeconds) * 100;

  // Total recorded focus time on task
  const taskFocusMinutes = Math.floor((task?.focusTimeSeconds || 0) / 60);

  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-20 md:bottom-6 right-44 sm:right-52 z-40 p-3 rounded-2xl glass-panel border border-purple-500/50 bg-[var(--bg-primary)] shadow-2xl cursor-pointer hover:scale-105 transition-all flex items-center gap-3 animate-fade-in"
      >
        <div className={`p-2 rounded-xl ${isActive ? 'bg-purple-500/20 text-purple-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
          <Timer className="w-5 h-5" />
        </div>
        <div className="font-mono">
          <div className="text-xs font-bold text-[var(--text-primary)]">{formattedTime}</div>
          <div className="text-[10px] text-purple-400 font-bold">{isActive ? 'FOCUSING' : 'PAUSED'}</div>
        </div>
        <Maximize2 className="w-3.5 h-3.5 text-slate-400 ml-1" />
      </div>
    );
  }

  return (
    <div className="p-4 rounded-3xl glass-panel border border-purple-500/30 bg-[var(--bg-secondary)] shadow-xl relative overflow-hidden">
      {/* Ambient background glow when active */}
      {isActive && (
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-purple-500/15 blur-2xl pointer-events-none animate-pulse" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Timer className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Pomodoro Cosmic Focus Engine
            </h4>
            {task && (
              <p className="text-[10px] font-mono text-[var(--text-muted)] line-clamp-1">
                Linked Task: <strong className="text-purple-300">{task.title}</strong>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--text-primary)] transition-colors"
            title={soundEnabled ? 'Mute chimes' : 'Unmute chimes'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--text-primary)] transition-colors"
            title="Minimize focus timer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Timer Display & Controls */}
      <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Countdown Digits & Progress Ring */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={isActive ? 'text-purple-400 transition-all duration-1000' : 'text-slate-500 transition-all duration-1000'}
                strokeDasharray={`${progressPct}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
              <span className="text-sm font-bold text-[var(--text-primary)] tracking-tight">{formattedTime}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {isActive ? 'Active Sprint' : sessionCompleted ? 'Sprint Complete!' : 'Ready to Focus'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
              {taskFocusMinutes > 0 ? `${taskFocusMinutes}m logged on this task` : 'Attach focus time to active task'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTimer}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md ${
              isActive
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25'
            }`}
          >
            {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isActive ? 'Pause' : 'Start'}</span>
          </button>

          <button
            onClick={resetTimer}
            className="p-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Duration Buttons */}
      <div className="pt-2 border-t border-[var(--border-color)] flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mr-1">
          Presets:
        </span>
        {PRESET_DURATIONS.map((preset) => {
          const isSelected = targetMinutes === preset.minutes;
          return (
            <button
              key={preset.minutes}
              onClick={() => selectDuration(preset.minutes)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all border ${
                isSelected
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold'
                  : 'bg-[var(--bg-primary)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-slate-600'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
