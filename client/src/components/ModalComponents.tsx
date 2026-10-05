import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onCancel} disabled={isLoading} className="secondary-button">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`primary-button ${isDangerous ? 'danger' : ''}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AlertModalProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  actionText?: string;
  onAction: () => void;
}

export function AlertModal({ isOpen, type, title, message, actionText = 'OK', onAction }: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className={`alert-icon ${type}`}>
          {type === 'success' && '✓'}
          {type === 'error' && '✕'}
          {type === 'warning' && '!'}
          {type === 'info' && 'ℹ'}
        </div>
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onAction} className="primary-button">
          {actionText}
        </button>
      </div>
    </div>
  );
}
