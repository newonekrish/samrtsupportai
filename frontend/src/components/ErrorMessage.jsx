import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 border-danger-subtle rounded-3 shadow-sm mb-4" role="alert">
      <div className="d-flex align-items-center gap-2">
        <AlertCircle size={20} className="text-danger flex-shrink-0" />
        <span className="fw-medium text-danger-emphasis">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1.5 ms-3 flex-shrink-0"
        >
          <RotateCcw size={14} />
          Retry
        </button>
      )}
    </div>
  );
}
