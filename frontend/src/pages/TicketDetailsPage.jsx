import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  RefreshCw,
  Send,
} from 'lucide-react';
import { getTicket, analyzeTicket, updateTicket } from '../services/api';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import AIAnalysis from '../components/AIAnalysis';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Resolved'];

export default function TicketDetailsPage() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSavingReply, setIsSavingReply] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState(false);

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTicket(id);
      setTicket(data);
    } catch (err) {
      setError(err.message || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      const res = await analyzeTicket(id);
      setTicket(res.ticket);
    } catch (err) {
      setError(err.message || 'AI Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === ticket.status) return;

    try {
      setIsUpdatingStatus(true);
      setError(null);
      const res = await updateTicket(id, { status: newStatus });
      setTicket(res.ticket);
      setStatusSuccess(true);
      setTimeout(() => setStatusSuccess(false), 2500);
    } catch (err) {
      setError(err.message || 'Failed to update ticket status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveReply = async (newReply) => {
    try {
      setIsSavingReply(true);
      setError(null);
      const res = await updateTicket(id, { ai_reply: newReply });
      setTicket(res.ticket);
    } catch (err) {
      setError(err.message || 'Failed to save updated response.');
      throw err;
    } finally {
      setIsSavingReply(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message={`Loading ticket #${id}...`} size="lg" />;
  }

  if (error && !ticket) {
    return (
      <div className="container-fluid py-5 px-lg-4">
        <ErrorMessage message={error} onRetry={loadTicket} />
        <Link to="/tickets" className="btn btn-outline-primary rounded-3">
          Return to Ticket Queue
        </Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container-fluid py-4 px-lg-4">
      {/* Top Navigation */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <Link
          to="/tickets"
          className="btn btn-sm btn-link text-decoration-none text-secondary d-inline-flex align-items-center gap-1.5 p-0"
        >
          <ArrowLeft size={16} />
          Back to Tickets Queue
        </Link>

        {/* Ticket Status Selector */}
        <div className="d-flex align-items-center gap-2">
          {statusSuccess && (
            <span className="text-success small fw-semibold d-inline-flex align-items-center gap-1 me-2">
              <CheckCircle2 size={15} /> Status updated!
            </span>
          )}
          <span className="text-secondary small fw-medium text-nowrap">Ticket Status:</span>
          <select
            className="form-select form-select-sm rounded-3 border-light-subtle shadow-sm fw-semibold"
            style={{ width: '150px' }}
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdatingStatus}
          >
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className="row g-4">
        {/* Left Column: Customer Details & Original Message */}
        <div className="col-12 col-xl-5">
          {/* Header Info Card */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="badge bg-primary-subtle text-primary px-3 py-1.5 rounded-pill fw-bold fs-6">
                  Ticket #{ticket.id}
                </span>
                <div className="d-flex gap-2">
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
              </div>

              <div className="text-secondary small d-flex align-items-center gap-1.5 mb-4">
                <Calendar size={14} />
                Created {formatDate(ticket.created_at)}
              </div>

              {/* Customer Profile Box */}
              <div className="p-3 bg-light rounded-3 border">
                <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <User size={16} className="text-primary" />
                  Customer Information
                </h6>
                <div className="mb-2">
                  <span className="text-secondary small d-block">Full Name:</span>
                  <span className="fw-semibold text-dark">{ticket.customer?.name}</span>
                </div>
                <div className="mb-2">
                  <span className="text-secondary small d-block">Email Address:</span>
                  <span className="text-dark d-flex align-items-center gap-1.5">
                    <Mail size={13} className="text-muted" />
                    {ticket.customer?.email}
                  </span>
                </div>
                <div>
                  <span className="text-secondary small d-block">Phone Number:</span>
                  <span className="text-dark d-flex align-items-center gap-1.5">
                    <Phone size={13} className="text-muted" />
                    {ticket.customer?.phone || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Original Customer Message */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-bottom p-4">
              <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <MessageSquare size={18} className="text-primary" />
                Original Customer Message
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="p-3 bg-light-subtle rounded-3 border text-dark fs-6 lh-base">
                "{ticket.message}"
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis, Recommendations & Editable Reply */}
        <div className="col-12 col-xl-7">
          <AIAnalysis
            ticket={ticket}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            onSaveReply={handleSaveReply}
            isSavingReply={isSavingReply}
          />
        </div>
      </div>
    </div>
  );
}
