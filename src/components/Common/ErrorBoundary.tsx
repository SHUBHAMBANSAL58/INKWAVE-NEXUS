import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected rendering error occurred.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.warn('[INKWAVE NEXUS ErrorBoundary]', error, info?.componentStack);
  }

  handleRecover = () => {
    this.setState({ hasError: false, errorMessage: '' });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="max-w-xl mx-auto my-12 p-6 sm:p-8 rounded-3xl glass-panel border border-rose-500/40 bg-[var(--bg-primary)] text-center space-y-4 shadow-2xl"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              {this.props.fallbackTitle || 'Workspace Module Interrupted'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              This panel encountered a runtime issue, while the rest of your workspace and saved cache remain safe.
            </p>
            <p className="text-[11px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2 break-words">
              {this.state.errorMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleRecover}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs sm:text-sm font-semibold shadow-md shadow-sky-500/20 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Recover View</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
