import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner-ring"></div>
      <p>Loading...</p>
    </div>
  );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: string | null; onRetry?: () => void }) {
  return (
    <div className="error-state">
      <div className="error-icon">⚠</div>
      <h3>Error</h3>
      <p>{error || 'An unexpected error occurred'}</p>
      {onRetry && (
        <button onClick={onRetry} className="primary-button">
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, message, action }: { title: string; message?: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📭</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action && (
        <button onClick={action.onClick} className="primary-button">
          {action.label}
        </button>
      )}
    </div>
  );
}
