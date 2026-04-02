import { useState } from 'react';

const PRIORITY_BADGE = { High: 'danger', Medium: 'warning', Low: 'success' };
const PRIORITY_ICON = { High: '🔴', Medium: '🟡', Low: '🟢' };

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const el = document.createElement('textarea');
      el.value = text; document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className={`btn btn-sm ${copied ? 'btn-success' : 'btn-outline-primary'}`} onClick={handleCopy} title="Copy">
      {copied ? '✓ Copied!' : '📋 Copy'}
    </button>
  );
};

const ReplyBox = ({ data, onRegenerate, loading }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!data) return null;

  const { subject, replies = [], summary = {}, intent, emotion, priority, suggestions = {} } = data;
  const REPLY_LABELS = ['Direct & Concise', 'Balanced & Detailed', 'Friendly & Expressive'];

  return (
    <div className="mt-4">
      {/* Meta badges */}
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        <span className="badge bg-secondary">📧 {intent}</span>
        <span className="badge bg-info text-dark">😐 {emotion}</span>
        <span className={`badge bg-${PRIORITY_BADGE[priority] || 'secondary'}`}>
          {PRIORITY_ICON[priority]} {priority} Priority
        </span>
        {subject && <span className="badge bg-light text-dark border">Re: {subject}</span>}
        <button className="btn btn-sm btn-outline-secondary ms-auto" onClick={onRegenerate} disabled={loading} title="Regenerate">
          🔄 Regenerate
        </button>
      </div>

      {/* Reply tabs */}
      <div className="mb-1">
        <h6 className="fw-bold text-success mb-2">✅ Generated Replies</h6>
        <ul className="nav nav-tabs" role="tablist">
          {REPLY_LABELS.map((label, i) => (
            <li className="nav-item" key={i}>
              <button
                className={`nav-link py-1 px-3 small ${activeTab === i ? 'active' : ''}`}
                onClick={() => setActiveTab(i)}
                role="tab"
              >
                Option {i + 1}
                <span className="d-none d-sm-inline"> · {label}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="tab-content border border-top-0 rounded-bottom p-3 bg-white">
          <div
            className="reply-box"
            style={{ whiteSpace: 'pre-wrap', minHeight: '120px', fontFamily: 'inherit', lineHeight: '1.7', fontSize: '0.95rem' }}
            aria-live="polite"
          >
            {replies[activeTab] || '—'}
          </div>
          <div className="d-flex justify-content-end mt-2">
            <CopyButton text={replies[activeTab] || ''} />
          </div>
        </div>
      </div>

      {/* Summary */}
      {(summary.key_points?.length || summary.action_items?.length || summary.deadlines?.length) && (
        <div className="mt-3 p-3 rounded-3 border bg-light">
          <h6 className="fw-bold mb-2">📋 Thread Summary</h6>
          {summary.key_points?.filter(Boolean).length > 0 && (
            <div className="mb-2">
              <div className="small fw-semibold text-muted mb-1">Key Points</div>
              <ul className="mb-0 ps-3 small">{summary.key_points.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </div>
          )}
          {summary.action_items?.filter(Boolean).length > 0 && (
            <div className="mb-2">
              <div className="small fw-semibold text-muted mb-1">Action Items</div>
              <ul className="mb-0 ps-3 small">{summary.action_items.map((a, i) => <li key={i}>{a}</li>)}</ul>
            </div>
          )}
          {summary.deadlines?.filter(Boolean).length > 0 && (
            <div>
              <div className="small fw-semibold text-muted mb-1">Deadlines</div>
              <ul className="mb-0 ps-3 small">{summary.deadlines.map((d, i) => <li key={i}>{d}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      {/* Smart suggestions */}
      {(suggestions.attachment || suggestions.follow_up || suggestions.clarification) && (
        <div className="mt-3 p-3 rounded-3 border border-warning bg-warning bg-opacity-10">
          <h6 className="fw-bold mb-2">💡 Smart Suggestions</h6>
          {suggestions.attachment && <p className="small mb-1">📎 <strong>Attachment:</strong> {suggestions.attachment}</p>}
          {suggestions.follow_up && <p className="small mb-1">🔔 <strong>Follow-up:</strong> {suggestions.follow_up}</p>}
          {suggestions.clarification && <p className="small mb-0">❓ <strong>Clarification:</strong> {suggestions.clarification}</p>}
        </div>
      )}
    </div>
  );
};

export default ReplyBox;
