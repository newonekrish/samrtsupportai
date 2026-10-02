import React from 'react';
import { Inbox, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'No tickets found',
  description = 'There are no support tickets matching your current view or filter criteria.',
  actionLink = '/tickets/new',
  actionLabel = 'Create Support Ticket',
}) {
  return (
    <div className="card border-dashed border-2 bg-light-subtle text-center p-5 rounded-4 my-4">
      <div className="card-body d-flex flex-column align-items-center">
        <div className="bg-primary-subtle text-primary p-3 rounded-circle mb-3">
          <Inbox size={32} />
        </div>
        <h5 className="fw-bold text-dark mb-1">{title}</h5>
        <p className="text-secondary mb-4 col-md-6 mx-auto" style={{ fontSize: '0.95rem' }}>
          {description}
        </p>
        {actionLink && (
          <Link to={actionLink} className="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-2 shadow-sm rounded-3">
            <PlusCircle size={18} />
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
