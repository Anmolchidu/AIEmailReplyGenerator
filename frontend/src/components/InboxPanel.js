import { useState, useEffect } from 'react';
import { getConversations, getConversation, deleteConversation } from '../services/api';
import toast from 'react-hot-toast';

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function InboxPanel({ darkMode, onCompose }) {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConversations()
      .then((r) => setConversations(r.data))
      .catch(() => toast.error('Failed to load conversations.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (conv) => {
    setSelected(conv.id);
    try {
      const { data } = await getConversation(conv.id);
      setDetail(data);
    } catch { toast.error('Failed to load thread.'); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (selected === id) { setSelected(null); setDetail(null); }
      toast.success('Thread deleted.');
    } catch { toast.error('Failed to delete.'); }
  };

  return (
    <div className={'inbox-panel d-flex h-100' + (darkMode ? ' dark' : '')}>
      {/* Thread list */}
      <div className="thread-list border-end">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0">📥 Inbox</h6>
          <button className="btn btn-sm btn-primary" onClick={onCompose}>+ Compose</button>
        </div>
        {loading && <div className="text-center p-4"><span className="spinner-border spinner-border-sm" /></div>}
        {!loading && conversations.length === 0 && (
          <div className="text-center text-muted p-4 small">No conversations yet.</div>
        )}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={'thread-item px-3 py-3 border-bottom cursor-pointer' + (selected === conv.id ? ' active' : '')}
            onClick={() => handleSelect(conv)}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div className="fw-semibold small text-truncate" style={{ maxWidth: 160 }}>{conv.subject}</div>
              <div className="d-flex align-items-center gap-1">
                <small className="text-muted">{formatTime(conv.updated_at)}</small>
                <button className="btn btn-link btn-sm p-0 text-danger" onClick={(e) => handleDelete(conv.id, e)}>×</button>
              </div>
            </div>
            <div className="small text-muted text-truncate mt-1">{conv.last_message || 'No messages'}</div>
          </div>
        ))}
      </div>

      {/* Thread detail */}
      <div className="thread-detail flex-grow-1 d-flex flex-column">
        {!detail && (
          <div className="d-flex align-items-center justify-content-center h-100 text-muted">
            Select a conversation to view
          </div>
        )}
        {detail && (
          <>
            <div className="p-3 border-bottom">
              <h6 className="fw-bold mb-0">{detail.subject}</h6>
            </div>
            <div className="flex-grow-1 overflow-auto p-3">
              {detail.messages.map((msg) => (
                <div key={msg.id} className={'chat-bubble mb-3 ' + (msg.sender === 'user' ? 'user-bubble' : 'ai-bubble')}>
                  <div className="bubble-meta small text-muted mb-1">
                    {msg.sender === 'user' ? '👤 You' : '🤖 AI'} · {new Date(msg.timestamp).toLocaleString()}
                  </div>
                  <div className="bubble-content p-3 rounded" style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
