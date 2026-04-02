import { useState, useEffect } from 'react';
import { getHistory } from '../services/api';
import toast from 'react-hot-toast';

export default function HistoryPanel({ darkMode }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getHistory()
      .then((r) => setHistory(r.data))
      .catch(() => toast.error('Failed to load history.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={'panel-view p-4' + (darkMode ? ' dark' : '')}>
      <h5 className="fw-bold mb-4">🕐 Email History</h5>
      {loading && <div className="text-center"><span className="spinner-border spinner-border-sm" /></div>}
      {!loading && history.length === 0 && <p className="text-muted">No emails sent yet.</p>}
      <div className="d-flex flex-column gap-3">
        {history.map((item) => (
          <div key={item.id} className="card border-0 shadow-sm">
            <div
              className="card-body cursor-pointer"
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-semibold">{item.subject || '(No subject)'}</div>
                  <div className="small text-muted">To: {item.sent_to} · Tone: {item.tone}</div>
                </div>
                <small className="text-muted">{new Date(item.created_at).toLocaleDateString()}</small>
              </div>
              {expanded === item.id && (
                <div className="mt-3">
                  <div className="small fw-semibold text-muted mb-1">ORIGINAL EMAIL</div>
                  <div className="p-2 rounded bg-light small mb-3" style={{ whiteSpace: 'pre-wrap' }}>{item.original_email}</div>
                  <div className="small fw-semibold text-muted mb-1">SENT REPLY</div>
                  <div className="p-2 rounded bg-light small" style={{ whiteSpace: 'pre-wrap' }}>{item.generated_reply}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
