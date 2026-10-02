import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  Cpu,
} from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="d-none d-lg-block bg-white border-end p-3" style={{ width: '260px', minHeight: 'calc(100vh - 61px)' }}>
      <div className="d-flex flex-column h-100 justify-content-between">
        <div>
          <div className="text-uppercase text-secondary fw-semibold small px-3 mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
            Main Menu
          </div>
          <nav className="nav flex-column gap-1 mb-4">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2.5 px-3 py-2 rounded-3 fw-medium transition-all ${
                  isActive ? 'bg-primary-subtle text-primary fw-bold' : 'text-dark hover-bg-light'
                }`
              }
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>

            <NavLink
              to="/tickets"
              end
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2.5 px-3 py-2 rounded-3 fw-medium transition-all ${
                  isActive ? 'bg-primary-subtle text-primary fw-bold' : 'text-dark hover-bg-light'
                }`
              }
            >
              <Ticket size={18} />
              All Tickets
            </NavLink>

            <NavLink
              to="/tickets/new"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2.5 px-3 py-2 rounded-3 fw-medium transition-all ${
                  isActive ? 'bg-primary-subtle text-primary fw-bold' : 'text-dark hover-bg-light'
                }`
              }
            >
              <PlusCircle size={18} />
              Create Ticket
            </NavLink>
          </nav>

          <div className="text-uppercase text-secondary fw-semibold small px-3 mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
            Quick Views
          </div>
          <nav className="nav flex-column gap-1">
            <NavLink
              to="/tickets?status=Pending"
              className="nav-link d-flex align-items-center justify-content-between px-3 py-2 rounded-3 text-secondary hover-bg-light small"
            >
              <span className="d-flex align-items-center gap-2 text-dark">
                <Clock size={16} className="text-warning" />
                Pending
              </span>
            </NavLink>

            <NavLink
              to="/tickets?priority=High"
              className="nav-link d-flex align-items-center justify-content-between px-3 py-2 rounded-3 text-secondary hover-bg-light small"
            >
              <span className="d-flex align-items-center gap-2 text-dark">
                <AlertCircle size={16} className="text-danger" />
                High Priority
              </span>
            </NavLink>

            <NavLink
              to="/tickets?status=Resolved"
              className="nav-link d-flex align-items-center justify-content-between px-3 py-2 rounded-3 text-secondary hover-bg-light small"
            >
              <span className="d-flex align-items-center gap-2 text-dark">
                <CheckCircle2 size={16} className="text-success" />
                Resolved
              </span>
            </NavLink>
          </nav>
        </div>

        {/* System info badge */}
        <div className="p-3 bg-light rounded-4 border mt-4">
          <div className="d-flex align-items-center gap-2 text-dark fw-bold small mb-2">
            <Cpu size={16} className="text-primary" />
            System Status
          </div>
          <div className="d-flex align-items-center justify-content-between text-secondary small mb-1">
            <span className="d-flex align-items-center gap-1.5">
              <Database size={13} /> MySQL
            </span>
            <span className="badge bg-success-subtle text-success border border-success-subtle">Connected</span>
          </div>
          <div className="d-flex align-items-center justify-content-between text-secondary small">
            <span className="d-flex align-items-center gap-1.5">
              <Cpu size={13} /> AI Engine
            </span>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle">Ready</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
