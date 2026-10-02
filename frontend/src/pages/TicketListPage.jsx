import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { getTickets, analyzeTicket } from '../services/api';
import TicketTable from '../components/TicketTable';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export default function TicketListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial query params from URL
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [priority, setPriority] = useState(searchParams.get('priority') || 'All');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzingId, setAnalyzingId] = useState(null);

  // Sync state with URL params
  useEffect(() => {
    const urlStatus = searchParams.get('status');
    const urlPriority = searchParams.get('priority');
    if (urlStatus && urlStatus !== status) setStatus(urlStatus);
    if (urlPriority && urlPriority !== priority) setPriority(urlPriority);
  }, [searchParams]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (status !== 'All') params.status = status;
      if (priority !== 'All') params.priority = priority;
      if (category !== 'All') params.category = category;

      const data = await getTickets(params);
      setTickets(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch tickets.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search / trigger on filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, status, priority, category]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('All');
    setPriority('All');
    setCategory('All');
    setSearchParams({});
  };

  const handleAnalyze = async (ticketId) => {
    try {
      setAnalyzingId(ticketId);
      await analyzeTicket(ticketId);
      await fetchTickets();
    } catch (err) {
      alert(`AI Analysis Error: ${err.message}`);
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="container-fluid py-4 px-lg-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark tracking-tight mb-1">Customer Support Tickets</h2>
          <p className="text-secondary small mb-0">
            Browse, filter, search, and analyze all active customer conversations
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            onClick={fetchTickets}
            className="btn btn-light border btn-sm d-inline-flex align-items-center gap-1.5 rounded-3 px-3 py-2 text-secondary"
            title="Refresh tickets"
          >
            <RefreshCw size={15} />
            <span className="d-none d-sm-inline">Refresh</span>
          </button>
          <Link
            to="/tickets/new"
            className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5 rounded-3 shadow-sm px-3 py-2"
          >
            <PlusCircle size={16} />
            <span className="fw-semibold">Create Ticket</span>
          </Link>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={fetchTickets} />

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <div className="d-flex flex-column flex-md-row gap-3 align-items-stretch align-items-md-center justify-content-between">
          <SearchBar
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
          />
          <FilterPanel
            status={status}
            onStatusChange={setStatus}
            priority={priority}
            onPriorityChange={setPriority}
            category={category}
            onCategoryChange={setCategory}
            onReset={handleResetFilters}
          />
        </div>
      </div>

      {/* Results Content */}
      {loading ? (
        <LoadingSpinner message="Fetching matching tickets..." />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No matching tickets found"
          description={
            search || status !== 'All' || priority !== 'All' || category !== 'All'
              ? 'Try adjusting your search criteria or resetting filters.'
              : 'There are no support tickets in the database yet.'
          }
          actionLink="/tickets/new"
          actionLabel="Create New Ticket"
        />
      ) : (
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-2 px-1">
            <span className="text-secondary small fw-medium">
              Showing <strong>{tickets.length}</strong> ticket{tickets.length === 1 ? '' : 's'}
            </span>
          </div>
          <TicketTable
            tickets={tickets}
            onAnalyze={handleAnalyze}
            analyzingId={analyzingId}
          />
        </div>
      )}
    </div>
  );
}
