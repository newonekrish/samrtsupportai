import React from 'react';

const STATUS_OPTIONS = ['All', 'Pending', 'In Progress', 'Resolved'];
const PRIORITY_OPTIONS = ['All', 'Low', 'Medium', 'High', 'Critical'];
const CATEGORY_OPTIONS = [
  'All',
  'Payment Issue',
  'Order Issue',
  'Account Issue',
  'Technical Issue',
  'Delivery Issue',
  'Refund Issue',
  'Other',
];

export default function FilterPanel({
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  category,
  onCategoryChange,
  onReset,
}) {
  const hasActiveFilters =
    status !== 'All' || priority !== 'All' || category !== 'All';

  return (
    <div className="d-flex flex-wrap align-items-center gap-2">
      {/* Status Filter */}
      <div className="d-flex align-items-center gap-1.5">
        <label className="text-secondary small fw-medium text-nowrap">Status:</label>
        <select
          className="form-select form-select-sm rounded-3 border-light-subtle shadow-sm"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Priority Filter */}
      <div className="d-flex align-items-center gap-1.5">
        <label className="text-secondary small fw-medium text-nowrap">Priority:</label>
        <select
          className="form-select form-select-sm rounded-3 border-light-subtle shadow-sm"
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      <div className="d-flex align-items-center gap-1.5">
        <label className="text-secondary small fw-medium text-nowrap">Category:</label>
        <select
          className="form-select form-select-sm rounded-3 border-light-subtle shadow-sm"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="btn btn-sm btn-link text-decoration-none text-danger small p-0 ms-1 fw-medium"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
