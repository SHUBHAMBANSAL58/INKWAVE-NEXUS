import React from 'react';
import { SHORTCUTS } from '../../utils/keyboardShortcuts';
import { Command, X, Keyboard } from 'lucide-react';

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl rounded-3xl glass-panel p-6 shadow-2xl border border-sky-500/40 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-base text-[var(--text-primary)]">Global Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[var(--text-secondary)]">
          Navigate anywhere in INKWAVE NEXUS instantly or control NOVA without lifting your hands from the keyboard.
        </p>

        {/* Shortcuts Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
          {SHORTCUTS.map((sc, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between gap-2 text-xs"
            >
              <span className="text-[var(--text-secondary)] truncate">{sc.description}</span>
              <kbd className="px-2 py-1 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] font-mono text-[10px] font-bold text-sky-400 shrink-0">
                {sc.ctrlOrCmd ? 'Ctrl / ⌘ +' : ''} {sc.key.toUpperCase()}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[var(--border-color)] flex justify-between items-center text-xs text-[var(--text-muted)] font-mono">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-sky-400">?</kbd> anytime</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
