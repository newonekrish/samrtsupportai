import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PlusCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { getStats, getTickets, analyzeTicket } from '../services/api';
import DashboardCard from '../components/DashboardCard';
import TicketTable from '../components/TicketTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    high_priority: 0,
    pending: 0,
    resolved: 0,
    in_progress: 0,
    categories: [],
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzingId, setAnalyzingId] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, ticketsData] = await Promise.all([
        getStats(),
        getTickets(),
      ]);
      setStats(statsData);
      setRecentTickets(ticketsData.slice(0, 7)); // Top recent tickets
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleQuickAnalyze = async (ticketId) => {
    try {
      setAnalyzingId(ticketId);
      await analyzeTicket(ticketId);
      await loadDashboardData(); // Refresh metrics and status
    } catch (err) {
      alert(`AI Analysis Error: ${err.message}`);
    } finally {
      setAnalyzingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading SmartSupport AI dashboard..." size="lg" />;
  }

  return (
    <div className="container-fluid py-4 px-lg-4">
      {/* Page Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark tracking-tight mb-1">Support Operations Dashboard</h2>
          <p className="text-secondary small mb-0">
            Real-time customer support queue powered by AI intelligence
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Link to="/tickets/new" className="btn btn-primary d-inline-flex align-items-center gap-2 rounded-3 shadow-sm px-3 py-2">
            <PlusCircle size={18} />
            <span className="fw-semibold">New Ticket</span>
          </Link>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={loadDashboardData} />

      {/* 4 Primary Metric Cards: Total | High Priority | Pending | Resolved */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard
            title="Total Tickets"
            value={stats.total}
            icon={Inbox}
            color="primary"
            subtitle="All lifetime tickets"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard
            title="High / Critical"
            value={stats.high_priority}
            icon={AlertTriangle}
            color="danger"
            subtitle="Requires rapid attention"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard
            title="Pending Review"
            value={stats.pending}
            icon={Clock}
            color="warning"
            subtitle="Awaiting triage or response"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard
            title="Resolved Tickets"
            value={stats.resolved}
            icon={CheckCircle2}
            color="success"
            subtitle="Successfully closed"
          />
        </div>
      </div>

      {/* Recent Tickets Section */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-header bg-white border-bottom p-4 d-flex align-items-center justify-content-between">
          <div>
            <h5 className="fw-bold mb-0 text-dark">Recent Support Tickets</h5>
            <small className="text-secondary">Latest tickets created in the system</small>
          </div>
          <Link
            to="/tickets"
            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 rounded-3 px-3"
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card-body p-0">
          {recentTickets.length === 0 ? (
            <EmptyState
              title="No tickets yet"
              description="Get started by creating your first customer ticket."
              actionLink="/tickets/new"
              actionLabel="Create First Ticket"
            />
          ) : (
            <TicketTable
              tickets={recentTickets}
              onAnalyze={handleQuickAnalyze}
              analyzingId={analyzingId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
