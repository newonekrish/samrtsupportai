import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Sparkles, Clock, ArrowRight } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

export default function TicketTable({ tickets = [], onAnalyze, analyzingId }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="table-responsive bg-white rounded-4 shadow-sm border-0">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light text-secondary text-uppercase small" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
          <tr>
            <th className="py-3 px-4">Ticket ID</th>
            <th className="py-3">Customer</th>
            <th className="py-3">Category</th>
            <th className="py-3">Priority</th>
            <th className="py-3">Status</th>
            <th className="py-3">Created Date</th>
            <th className="py-3 px-4 text-end">Action</th>
          </tr>
        </thead>
        <tbody className="border-top-0">
          {tickets.map((ticket) => {
            const isAnalyzing = analyzingId === ticket.id;
            const hasAiAnalysis = ticket.summary || ticket.ai_reply;

            return (
              <tr key={ticket.id} className="transition-all">
                <td className="py-3 px-4">
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="fw-bold text-primary text-decoration-none"
                  >
                    #{ticket.id}
                  </Link>
                </td>
                <td className="py-3">
                  <div className="fw-semibold text-dark">{ticket.customer?.name || 'Unknown'}</div>
                  <div className="text-secondary small">{ticket.customer?.email}</div>
                </td>
                <td className="py-3">
                  <span className="badge bg-light text-dark border fw-medium px-2 py-1 rounded-2">
                    {ticket.category || 'Unassigned'}
                  </span>
                </td>
                <td className="py-3">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="py-3">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="py-3 text-secondary small">
                  <div className="d-flex align-items-center gap-1.5">
                    <Clock size={13} className="text-muted" />
                    <span>{formatDate(ticket.created_at)}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-end">
                  <div className="d-inline-flex align-items-center gap-2">
                    {!hasAiAnalysis && onAnalyze && (
                      <button
                        type="button"
                        onClick={() => onAnalyze(ticket.id)}
                        disabled={isAnalyzing}
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 rounded-3"
                        title="Analyze with AI"
                      >
                        <Sparkles size={14} className={isAnalyzing ? 'animate-spin' : ''} />
                        {isAnalyzing ? 'Analyzing...' : 'AI Analyze'}
                      </button>
                    )}
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1 rounded-3"
                    >
                      <Eye size={14} />
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
