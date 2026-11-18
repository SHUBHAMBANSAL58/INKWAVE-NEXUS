import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * Dedicated ThemeToggle component synchronizing 'dark-theme' and 'light-theme'
 * CSS classes on document.body and persisting the preference in localStorage.
 */
export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useApp();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} Theme`}
      title={`Current: ${isLight ? 'Light' : 'Dark'} Theme • Switch to ${isLight ? 'Dark' : 'Light'} Theme (Ctrl+T)`}
      data-testid="theme-toggle"
      data-theme-class={isLight ? 'light-theme' : 'dark-theme'}
      onClick={toggleTheme}
      className={`inline-flex items-center gap-1.5 p-1.5 sm:p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors border border-transparent hover:border-[var(--border-color)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${className}`}
    >
      {isLight ? (
        <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 shrink-0" />
      ) : (
        <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
      )}
      {showLabel && (
        <span className="text-xs font-mono font-semibold whitespace-nowrap">
          {isLight ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
