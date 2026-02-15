'use client';
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-center py-12">
          <p className="text-red-400 text-sm">Something went wrong</p>
          <button onClick={() => this.setState({ hasError: false })}
            className="text-xs text-gray-500 mt-2 hover:text-white">Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
