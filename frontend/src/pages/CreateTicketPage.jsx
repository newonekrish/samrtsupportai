import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  ArrowLeft,
  Sparkles,
  Send,
  HelpCircle,
} from 'lucide-react';
import { createTicket } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

const SAMPLE_SCENARIOS = [
  {
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '9876543210',
    message: 'My payment was deducted from my account but my order is still showing pending.',
    label: 'Payment Pending',
  },
  {
    name: 'Priya Patel',
    email: 'priya@example.com',
    phone: '9123456780',
    message: 'I cannot log into my account. The page shows an authentication failure error.',
    label: 'Login Issue',
  },
  {
    name: 'Arjun Verma',
    email: 'arjun@example.com',
    phone: '9845123456',
    message: 'My delivery package is delayed by three days and the tracking link is not updating.',
    label: 'Delayed Delivery',
  },
  {
    name: 'Ananya Roy',
    email: 'ananya@example.com',
    phone: '9988776655',
    message: 'I requested a refund for order #4829 last week but have not received the amount yet.',
    label: 'Refund Inquiry',
  },
];

export default function CreateTicketPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Customer name is required.';
    }
    if (!formData.email.trim()) {
      errs.email = 'Customer email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (formData.phone && !/^[0-9+() -]{7,20}$/.test(formData.phone)) {
      errs.phone = 'Please enter a valid phone number (e.g. 9876543210).';
    }
    if (!formData.message.trim()) {
      errs.message = 'Customer support message is required.';
    } else if (formData.message.trim().length < 5) {
      errs.message = 'Message must be at least 5 characters long.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePrefill = (scenario) => {
    setFormData({
      name: scenario.name,
      email: scenario.email,
      phone: scenario.phone,
      message: scenario.message,
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setApiError(null);

      const payload = {
        customer: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        },
        message: formData.message.trim(),
      };

      const response = await createTicket(payload);
      // Redirect directly to ticket details page for AI analysis
      navigate(`/tickets/${response.ticket_id}`);
    } catch (err) {
      setApiError(err.message || 'Failed to create support ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-4 px-lg-4">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8 col-xl-7">
          {/* Back button */}
          <Link
            to="/tickets"
            className="btn btn-sm btn-link text-decoration-none text-secondary d-inline-flex align-items-center gap-1.5 p-0 mb-3"
          >
            <ArrowLeft size={16} />
            Back to Tickets
          </Link>

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-white border-bottom p-4">
              <h4 className="fw-bold mb-1 text-dark">Create Support Ticket</h4>
              <p className="text-secondary small mb-0">
                Log a new customer issue. Once submitted, you can run AI analysis to categorize and draft responses.
              </p>
            </div>

            <div className="card-body p-4">
              <ErrorMessage message={apiError} />

              {/* Quick sample scenarios helper for testing/interviews */}
              <div className="p-3 bg-light-subtle rounded-3 border mb-4">
                <span className="text-secondary small fw-bold d-block mb-2 text-uppercase" style={{ fontSize: '0.72rem' }}>
                  Quick Fill Sample Scenarios (For Demonstrations):
                </span>
                <div className="d-flex flex-wrap gap-2">
                  {SAMPLE_SCENARIOS.map((sc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePrefill(sc)}
                      className="btn btn-sm btn-light border rounded-3 small px-2.5 py-1 text-secondary hover-bg-primary"
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  {/* Customer Name */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-dark">
                      Customer Name <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-light-subtle text-secondary">
                        <User size={16} />
                      </span>
                      <input
                        type="text"
                        name="name"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                    </div>
                    {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
                  </div>

                  {/* Customer Email */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small text-dark">
                      Customer Email <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-light-subtle text-secondary">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        name="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="e.g. rahul@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                    </div>
                    {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                  </div>
                </div>

                {/* Customer Phone */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-dark">Customer Phone</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-light-subtle text-secondary">
                      <Phone size={16} />
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                  </div>
                  {errors.phone && <div className="text-danger small mt-1">{errors.phone}</div>}
                </div>

                {/* Support Message */}
                <div className="mb-4">
                  <label className="form-label fw-semibold small text-dark">
                    Customer Support Message <span className="text-danger">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                    placeholder="Enter the customer's verbatim support message or complaint..."
                    value={formData.message}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  {errors.message && <div className="text-danger small mt-1">{errors.message}</div>}
                  <small className="text-secondary d-block mt-1">
                    AI will automatically analyze this message to extract Category, Urgency/Priority, and draft a response.
                  </small>
                </div>

                {/* Actions */}
                <div className="d-flex align-items-center justify-content-end gap-2 pt-2 border-top">
                  <Link to="/tickets" className="btn btn-light border px-3 py-2 rounded-3 text-secondary">
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2 rounded-3 shadow-sm fw-semibold"
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" />
                        Creating Ticket...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Create Ticket & Review
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
