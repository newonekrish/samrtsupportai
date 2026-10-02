import React from 'react';

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }) {
  const spinnerSize = size === 'sm' ? 'spinner-border-sm' : '';

  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center">
      <div
        className={`spinner-border text-primary ${spinnerSize}`}
        role="status"
        style={{ width: size === 'lg' ? '3rem' : undefined, height: size === 'lg' ? '3rem' : undefined }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <p className="mt-3 text-secondary fw-medium mb-0">{message}</p>}
    </div>
  );
}
