import { useState, useEffect } from 'react';
import { getDrafts, deleteDraft } from '../services/api';
import toast from 'react-hot-toast';

export default function DraftsPanel({ darkMode, onOpenDraft }) {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDrafts()
      .then((r) => setDrafts(r.data))
      .catch(() => toast.error('Failed to load drafts.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDraft(id);
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      toast.success('Draft deleted.');
    } catch { toast.error('Failed to delete draft.'); }
  };

  return (
    <div className={'panel-view p-4' + (darkMode ? ' dark' : '')}>
      <h5 className="fw-bold mb-4">📄 Drafts</h5>
      {loading && <div className="text-center"><span className="spinner-border spinner-border-sm" /></div>}
      {!loading && drafts.length === 0 && <p className="text-muted">No drafts saved.</p>}
      <div className="row g-3">
        {drafts.map((draft) => (
          <div className="col-md-6 col-lg-4" key={draft.id}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="fw-semibold mb-1 text-truncate">{draft.subject || '(No subject)'}</div>
                <div className="small text-muted mb-1">To: {draft.email_to || '—'}</div>
                <div className="small text-muted mb-2" style={{ overflow: 'hidden', maxHeight: 48 }}>
                  {draft.content?.slice(0, 100) || '(empty)'}
                </div>
                <div className="d-flex gap-2 mt-auto">
                  <button className="btn btn-sm btn-primary" onClick={() => onOpenDraft(draft)}>Open</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(draft.id)}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
