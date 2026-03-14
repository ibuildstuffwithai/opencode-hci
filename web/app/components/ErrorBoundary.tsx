"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      const title = this.props.fallbackTitle || "Something went wrong";
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 bg-surface/50 rounded-xl border border-red-500/20 m-2">
          <div className="text-2xl mb-2">⚠️</div>
          <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
          <p className="text-xs text-muted text-center max-w-xs mb-3">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={this.handleReset}
              className="px-3 py-1.5 text-xs bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                const details = `${this.state.error?.message}\n\n${this.state.errorInfo?.componentStack || ""}`;
                navigator.clipboard.writeText(details);
              }}
              className="px-3 py-1.5 text-xs bg-surface-hover text-muted rounded-lg hover:text-white transition-colors"
            >
              Copy Error
            </button>
          </div>
          {this.state.errorInfo && (
            <details className="mt-3 w-full max-w-sm">
              <summary className="text-[10px] text-muted cursor-pointer hover:text-white">
                Stack trace
              </summary>
              <pre className="text-[9px] text-red-400/70 mt-1 p-2 bg-black/30 rounded overflow-auto max-h-32 whitespace-pre-wrap">
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
