import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, PlusCircle, LayoutDashboard, Ticket as TicketIcon } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top py-2.5 px-3 px-lg-4 shadow-xs">
      <div className="container-fluid px-0">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2.5 text-dark fw-bold text-decoration-none">
          <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center shadow-sm">
            <Bot size={22} />
          </div>
          <div>
            <div className="fs-5 tracking-tight fw-bold text-dark lh-1">SmartSupport AI</div>
            <small className="text-secondary fw-normal" style={{ fontSize: '0.72rem' }}>
              Intelligent Ticket Assistant
            </small>
          </div>
        </Link>

        {/* Center / Navigation Links for mobile and desktop */}
        <div className="d-flex align-items-center gap-2 ms-auto me-3">
          <Link
            to="/dashboard"
            className={`btn btn-sm d-flex align-items-center gap-1.5 rounded-3 px-3 py-1.5 ${
              location.pathname === '/dashboard' || location.pathname === '/'
                ? 'btn-light fw-bold text-primary border'
                : 'btn-ghost text-secondary'
            }`}
          >
            <LayoutDashboard size={16} />
            <span className="d-none d-sm-inline">Dashboard</span>
          </Link>

          <Link
            to="/tickets"
            className={`btn btn-sm d-flex align-items-center gap-1.5 rounded-3 px-3 py-1.5 ${
              location.pathname === '/tickets'
                ? 'btn-light fw-bold text-primary border'
                : 'btn-ghost text-secondary'
            }`}
          >
            <TicketIcon size={16} />
            <span className="d-none d-sm-inline">Tickets</span>
          </Link>
        </div>

        {/* Right CTA */}
        <div className="d-flex align-items-center gap-3">
          <Link
            to="/tickets/new"
            className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3 shadow-sm"
          >
            <PlusCircle size={16} />
            <span className="fw-semibold">Create Ticket</span>
          </Link>

          <div className="vr d-none d-md-block my-1 text-muted" />

          {/* User badge */}
          <div className="d-none d-md-flex align-items-center gap-2">
            <div className="bg-primary-subtle text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
              SS
            </div>
            <div className="lh-sm">
              <div className="small fw-bold text-dark">Agent Portal</div>
              <div className="text-success small" style={{ fontSize: '0.7rem' }}>● Online</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
