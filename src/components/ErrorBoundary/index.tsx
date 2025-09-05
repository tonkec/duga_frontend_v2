import React from 'react';

type Props = {
  fallback?: React.ReactNode;
  children?: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('🔥 ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <p>❌ Something went wrong.</p>;
    }
    return this.props.children;
  }
}
