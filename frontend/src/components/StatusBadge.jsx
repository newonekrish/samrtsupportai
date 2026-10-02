import React from 'react';

const statusConfig = {
  Pending: {
    bg: 'bg-warning-subtle',
    text: 'text-warning-emphasis',
    border: 'border-warning-subtle',
  },
  'In Progress': {
    bg: 'bg-info-subtle',
    text: 'text-info-emphasis',
    border: 'border-info-subtle',
  },
  Resolved: {
    bg: 'bg-success-subtle',
    text: 'text-success-emphasis',
    border: 'border-success-subtle',
  },
};

export default function StatusBadge({ status = 'Pending' }) {
  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <span
      className={`badge rounded-pill px-2.5 py-1.5 fw-semibold border ${config.bg} ${config.text} ${config.border}`}
      style={{ fontSize: '0.8rem' }}
    >
      {status}
    </span>
  );
}
