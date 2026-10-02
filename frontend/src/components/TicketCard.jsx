import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, User } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

export default function TicketCard({ ticket, onAnalyze, isAnalyzing }) {
  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 hover-shadow transition-all">
      <div className="card-body p-4 d-flex flex-column">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span className="fw-bold text-primary">#{ticket.id}</span>
          <div className="d-flex gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 mb-2 text-dark">
          <User size={16} className="text-secondary" />
          <span className="fw-semibold">{ticket.customer?.name}</span>
          <span className="text-secondary small">({ticket.customer?.email})</span>
        </div>

        <p className="text-secondary small mb-3 text-truncate-2 flex-grow-1" style={{ minHeight: '40px' }}>
          "{ticket.message}"
        </p>

        {ticket.summary && (
          <div className="p-2.5 rounded-3 bg-light border mb-3 small">
            <span className="fw-semibold text-dark d-block mb-1">AI Summary:</span>
            <span className="text-secondary">{ticket.summary}</span>
          </div>
        )}

        <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top">
          <span className="badge bg-light text-dark border small">{ticket.category}</span>
          <div className="d-flex gap-2">
            {!ticket.summary && onAnalyze && (
              <button
                type="button"
                onClick={() => onAnalyze(ticket.id)}
                disabled={isAnalyzing}
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 rounded-3"
              >
                <Sparkles size={14} />
                {isAnalyzing ? 'Analyzing...' : 'AI'}
              </button>
            )}
            <Link
              to={`/tickets/${ticket.id}`}
              className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 rounded-3"
            >
              Open
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
