import React from 'react';

const priorityConfig = {
  Critical: {
    bg: 'bg-danger-subtle',
    text: 'text-danger',
    border: 'border-danger-subtle',
    dot: 'bg-danger',
  },
  High: {
    bg: 'bg-warning-subtle',
    text: 'text-warning-emphasis',
    border: 'border-warning-subtle',
    dot: 'bg-warning',
  },
  Medium: {
    bg: 'bg-primary-subtle',
    text: 'text-primary',
    border: 'border-primary-subtle',
    dot: 'bg-primary',
  },
  Low: {
    bg: 'bg-secondary-subtle',
    text: 'text-secondary-emphasis',
    border: 'border-secondary-subtle',
    dot: 'bg-secondary',
  },
};

export default function PriorityBadge({ priority = 'Medium' }) {
  const config = priorityConfig[priority] || priorityConfig.Medium;

  return (
    <span
      className={`badge rounded-pill px-2.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 border ${config.bg} ${config.text} ${config.border}`}
      style={{ fontSize: '0.8rem' }}
    >
      <span
        className={`rounded-circle d-inline-block ${config.dot}`}
        style={{ width: '6px', height: '6px' }}
      />
      {priority}
    </span>
  );
}
