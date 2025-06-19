"use client";
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-red-500 text-xl">⚠️</span>
            <h3 className="text-red-800 font-semibold">Произошла ошибка</h3>
          </div>
          <p className="text-red-600 text-sm mb-3">
            К сожалению, произошла ошибка при загрузке этого компонента.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Хук для обработки ошибок в функциональных компонентах
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}

// Компонент для отображения ошибок
export function ErrorDisplay({ 
  error, 
  onRetry 
}: { 
  error: Error; 
  onRetry?: () => void;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-red-500">⚠️</span>
        <h3 className="text-red-800 font-semibold">Ошибка загрузки</h3>
      </div>
      <p className="text-red-600 text-sm mb-3">
        {error.message || 'Произошла неизвестная ошибка'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          Попробовать снова
        </button>
      )}
    </div>
  );
} 