import React from 'react';

export default function DashboardCard({ title, value, icon: Icon, color = 'primary', subtitle }) {
  const colorMap = {
    primary: {
      bg: 'bg-primary-subtle',
      text: 'text-primary',
      border: 'border-primary-subtle',
    },
    warning: {
      bg: 'bg-warning-subtle',
      text: 'text-warning-emphasis',
      border: 'border-warning-subtle',
    },
    danger: {
      bg: 'bg-danger-subtle',
      text: 'text-danger',
      border: 'border-danger-subtle',
    },
    success: {
      bg: 'bg-success-subtle',
      text: 'text-success',
      border: 'border-success-subtle',
    },
    info: {
      bg: 'bg-info-subtle',
      text: 'text-info-emphasis',
      border: 'border-info-subtle',
    },
  };

  const currentTheme = colorMap[color] || colorMap.primary;

  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative">
      <div className="card-body p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span className="text-secondary fw-semibold text-uppercase tracking-wider" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            {title}
          </span>
          <div className={`p-2.5 rounded-3 ${currentTheme.bg} ${currentTheme.text}`}>
            {Icon && <Icon size={22} />}
          </div>
        </div>
        <div className="d-flex align-items-baseline gap-2">
          <h2 className="fw-bold mb-0 text-dark tracking-tight">{value}</h2>
        </div>
        {subtitle && (
          <p className="text-secondary small mt-2 mb-0">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
