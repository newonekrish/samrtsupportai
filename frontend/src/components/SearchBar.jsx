import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, onClear, placeholder = 'Search tickets by customer, email, or message...' }) {
  return (
    <div className="position-relative flex-grow-1">
      <div className="position-absolute top-50 start-0 translate-middle-y ps-3 pointer-events-none text-secondary">
        <Search size={18} />
      </div>
      <input
        type="text"
        className="form-control ps-5 pe-5 py-2 rounded-3 border-light-subtle shadow-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          onClick={onClear}
          type="button"
          className="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y pe-3 text-secondary text-decoration-none"
          title="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
