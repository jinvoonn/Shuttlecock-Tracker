"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-rose-500 flex flex-col items-center justify-center min-h-screen bg-slate-900 font-['Lexend',_sans-serif]">
          <h2 className="text-2xl font-black mb-4 uppercase italic tracking-tighter">Something went wrong</h2>
          <p className="text-slate-400">Please try refreshing the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
