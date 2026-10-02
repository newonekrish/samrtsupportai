import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, MessageSquare, ShieldCheck, Save, Send } from 'lucide-react';
import PriorityBadge from './PriorityBadge';

export default function AIAnalysis({
  ticket,
  onAnalyze,
  isAnalyzing,
  onSaveReply,
  isSavingReply,
}) {
  const [editedReply, setEditedReply] = useState(ticket?.ai_reply || '');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  useEffect(() => {
    setEditedReply(ticket?.ai_reply || '');
  }, [ticket?.ai_reply]);

  const handleSave = async () => {
    await onSaveReply(editedReply);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const hasAnalysis = Boolean(ticket?.summary || ticket?.ai_reply);

  const sentimentStyles = {
    Positive: 'badge bg-success-subtle text-success border border-success-subtle',
    Neutral: 'badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle',
    Negative: 'badge bg-danger-subtle text-danger border border-danger-subtle',
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
      {/* Header */}
      <div className="card-header bg-white border-bottom p-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-2.5">
          <div className="p-2 rounded-3 bg-primary-subtle text-primary">
            <Sparkles size={20} />
          </div>
          <div>
            <h5 className="fw-bold mb-0 text-dark">AI Intelligence & Assistant Analysis</h5>
            <small className="text-secondary">
              Structured insights and automated response draft for agent review
            </small>
          </div>
        </div>

        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-sm"
        >
          <Sparkles size={16} className={isAnalyzing ? 'spinner-border spinner-border-sm border-0' : ''} />
          {isAnalyzing ? 'Analyzing with AI...' : hasAnalysis ? 'Re-Analyze with AI' : 'Analyze with AI'}
        </button>
      </div>

      <div className="card-body p-4">
        {isAnalyzing && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
              <span className="visually-hidden">Analyzing...</span>
            </div>
            <h6 className="fw-bold text-dark">Analyzing customer message with AI...</h6>
            <p className="text-secondary small mb-0">
              Evaluating sentiment, category, priority, and generating recommended action
            </p>
          </div>
        )}

        {!isAnalyzing && !hasAnalysis && (
          <div className="text-center py-4 bg-light-subtle rounded-3 border border-dashed p-4">
            <Sparkles size={36} className="text-secondary mb-2 opacity-50" />
            <h6 className="fw-semibold text-dark">No AI Analysis Yet</h6>
            <p className="text-secondary small col-md-8 mx-auto mb-3">
              Click the "Analyze with AI" button above to extract structured category, priority, sentiment, summary, and a professional suggested reply.
            </p>
            <button
              onClick={onAnalyze}
              className="btn btn-sm btn-outline-primary rounded-3"
            >
              Run AI Analysis Now
            </button>
          </div>
        )}

        {!isAnalyzing && hasAnalysis && (
          <div className="space-y-4">
            {/* Top Metrics Row: Category, Priority, Sentiment */}
            <div className="row g-3 mb-4">
              <div className="col-sm-4">
                <div className="p-3 bg-light rounded-3 border">
                  <span className="text-secondary small text-uppercase fw-semibold d-block mb-1">
                    AI Category
                  </span>
                  <span className="fw-bold text-dark fs-6">{ticket.category}</span>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="p-3 bg-light rounded-3 border">
                  <span className="text-secondary small text-uppercase fw-semibold d-block mb-1">
                    Assessed Priority
                  </span>
                  <PriorityBadge priority={ticket.priority} />
                </div>
              </div>
              <div className="col-sm-4">
                <div className="p-3 bg-light rounded-3 border">
                  <span className="text-secondary small text-uppercase fw-semibold d-block mb-1">
                    Customer Sentiment
                  </span>
                  <span className={sentimentStyles[ticket.sentiment] || sentimentStyles.Neutral}>
                    {ticket.sentiment || 'Neutral'}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="mb-4">
              <label className="fw-bold text-dark d-flex align-items-center gap-1.5 mb-2 small text-uppercase tracking-wider">
                <CheckCircle2 size={16} className="text-primary" />
                Problem Summary
              </label>
              <div className="p-3 bg-light-subtle rounded-3 border text-dark">
                {ticket.summary}
              </div>
            </div>

            {/* Recommended Action */}
            <div className="mb-4">
              <label className="fw-bold text-dark d-flex align-items-center gap-1.5 mb-2 small text-uppercase tracking-wider">
                <AlertTriangle size={16} className="text-warning-emphasis" />
                Recommended Support Action
              </label>
              <div className="p-3 bg-warning-subtle text-warning-emphasis rounded-3 border border-warning-subtle">
                {ticket.recommended_action}
              </div>
            </div>

            {/* Editable Suggested Reply */}
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <label className="fw-bold text-dark d-flex align-items-center gap-1.5 small text-uppercase tracking-wider mb-0">
                  <MessageSquare size={16} className="text-success" />
                  Suggested AI Customer Reply (Editable)
                </label>
                <div className="d-flex align-items-center gap-1.5 text-secondary small">
                  <ShieldCheck size={14} className="text-muted" />
                  <span>Agent review required before sending</span>
                </div>
              </div>

              <textarea
                className="form-control rounded-3 border-light-subtle shadow-sm p-3 font-monospace small"
                rows={5}
                value={editedReply}
                onChange={(e) => setEditedReply(e.target.value)}
                placeholder="AI suggested response will appear here..."
              />

              <div className="d-flex align-items-center justify-content-between mt-3">
                <div>
                  {isSavedNotice && (
                    <span className="text-success small fw-semibold d-inline-flex align-items-center gap-1">
                      <CheckCircle2 size={15} /> Response saved successfully!
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSavingReply || editedReply === ticket?.ai_reply}
                  className="btn btn-outline-primary d-inline-flex align-items-center gap-2 rounded-3 px-3 py-1.5 shadow-sm"
                >
                  <Save size={15} />
                  {isSavingReply ? 'Saving...' : 'Save Response'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
