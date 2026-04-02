import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { generateReply, sendEmail, saveDraft, updateDraft, createConversation } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TONES = ['professional', 'friendly', 'formal', 'casual', 'apologetic', 'confident'];
const LENGTHS = ['short', 'medium', 'long'];

export default function Composer({ darkMode, initialDraft, onDraftSaved }) {
  const { gmailAddress, gmailAppPassword } = useAuth();
  const [currentEmail, setCurrentEmail] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [toAddr, setToAddr] = useState('');
  const [subject, setSubject] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [aiData, setAiData] = useState(null);
  const [activeReply, setActiveReply] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [draftId, setDraftId] = useState(null);
  const [convId, setConvId] = useState(null);

  // Load initial draft if provided
  useEffect(() => {
    if (initialDraft) {
      setSubject(initialDraft.subject || '');
      setToAddr(initialDraft.email_to || '');
      setEditorContent(initialDraft.content || '');
      setTone(initialDraft.tone || 'professional');
      setDraftId(initialDraft.id);
    }
  }, [initialDraft]);

  // Auto-save draft every 30s if content exists
  useEffect(() => {
    if (!editorContent.trim()) return;
    const timer = setTimeout(() => autoSave(), 30000);
    return () => clearTimeout(timer);
  }, [editorContent, subject, toAddr, tone]);

  const autoSave = useCallback(async () => {
    try {
      const payload = { subject, email_to: toAddr, content: editorContent, tone };
      if (draftId) {
        await updateDraft(draftId, payload);
      } else {
        const { data } = await saveDraft(payload);
        setDraftId(data.id);
        if (onDraftSaved) onDraftSaved(data);
      }
    } catch { /* silent */ }
  }, [subject, toAddr, editorContent, tone, draftId, onDraftSaved]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); handleGenerate(); }
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); handleSaveDraft(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentEmail, tone, length, editorContent]);

  const handleGenerate = async () => {
    if (!currentEmail.trim()) { toast.error('Paste the email you want to reply to.'); return; }
    setLoading(true);
    setAiData(null);
    try {
      let cid = convId;
      if (!cid) {
        const { data: conv } = await createConversation({ subject: subject || 'New Thread' });
        cid = conv.id;
        setConvId(cid);
      }
      const { data } = await generateReply({ current_email: currentEmail, conversation_id: cid, tone, length });
      if (data.success) {
        setAiData(data.data);
        setActiveReply(0);
        if (!subject && data.data.subject) setSubject(data.data.subject);
        setEditorContent(data.data.replies[0] || '');
        toast.success('Replies generated!');
      } else {
        toast.error(data.error || 'Generation failed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate reply.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReply = (idx) => {
    setActiveReply(idx);
    setEditorContent(aiData.replies[idx] || '');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editorContent).then(() => toast.success('Copied to clipboard!'));
  };

  const handleSaveDraft = async () => {
    try {
      const payload = { subject, email_to: toAddr, content: editorContent, tone };
      if (draftId) {
        await updateDraft(draftId, payload);
        toast.success('Draft updated.');
      } else {
        const { data } = await saveDraft(payload);
        setDraftId(data.id);
        if (onDraftSaved) onDraftSaved(data);
        toast.success('Draft saved.');
      }
    } catch { toast.error('Failed to save draft.'); }
  };

  const handleSend = async () => {
    if (!toAddr.trim()) { toast.error('Enter recipient email.'); return; }
    if (!editorContent.trim()) { toast.error('Write a message first.'); return; }
    if (!gmailAddress || !gmailAppPassword) {
      toast.error('Gmail credentials not set. Go to Settings first.');
      return;
    }
    setSending(true);
    try {
      const { data } = await sendEmail({
        to: toAddr, subject, message: editorContent,
        gmail_address: gmailAddress, gmail_app_password: gmailAppPassword,
        conversation_id: convId, original_email: currentEmail, tone,
      });
      toast.success(data.message || 'Email sent!');
      setEditorContent('');
      setCurrentEmail('');
      setAiData(null);
      setConvId(null);
      setDraftId(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  const PRIORITY_COLOR = { High: 'danger', Medium: 'warning', Low: 'success' };
  const REPLY_LABELS = ['Direct & Concise', 'Balanced', 'Friendly'];

  return (
    <div className={'composer-panel h-100 d-flex flex-column' + (darkMode ? ' dark' : '')}>
      {/* Header */}
      <div className="composer-header px-4 py-3 border-bottom d-flex align-items-center justify-content-between">
        <h6 className="fw-bold mb-0">✏️ Compose & Generate</h6>
        <div className="d-flex gap-2">
          <select className="form-select form-select-sm" style={{ width: 140 }} value={tone} onChange={(e) => setTone(e.target.value)}>
            {TONES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <select className="form-select form-select-sm" style={{ width: 110 }} value={length} onChange={(e) => setLength(e.target.value)}>
            {LENGTHS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="composer-body flex-grow-1 overflow-auto p-4">
        {/* To / Subject */}
        <div className="row g-2 mb-3">
          <div className="col-md-5">
            <input className="form-control form-control-sm" placeholder="To: recipient@email.com"
              value={toAddr} onChange={(e) => setToAddr(e.target.value)} />
          </div>
          <div className="col-md-7">
            <input className="form-control form-control-sm" placeholder="Subject"
              value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
        </div>

        {/* Original email input */}
        <div className="mb-3">
          <label className="form-label small fw-semibold text-muted">ORIGINAL EMAIL TO REPLY TO</label>
          <textarea
            className="form-control"
            rows={5}
            placeholder="Paste the email you received and want to reply to..."
            value={currentEmail}
            onChange={(e) => setCurrentEmail(e.target.value)}
            maxLength={5000}
          />
          <div className="d-flex justify-content-between mt-1">
            <small className="text-muted">{currentEmail.length}/5000</small>
            <small className="text-muted">Ctrl+Enter to generate</small>
          </div>
        </div>

        {/* Generate button */}
        <button
          className="btn btn-primary w-100 mb-4 fw-semibold"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading
            ? <><span className="spinner-border spinner-border-sm me-2" />Generating...</>
            : '✨ Generate Reply (Ctrl+Enter)'}
        </button>

        {/* AI Output Panel */}
        {aiData && (
          <div className="ai-panel mb-4">
            {/* Meta row */}
            <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
              <span className="badge bg-secondary">📧 {aiData.intent}</span>
              <span className="badge bg-info text-dark">😐 {aiData.emotion}</span>
              <span className={'badge bg-' + (PRIORITY_COLOR[aiData.priority] || 'secondary')}>
                {aiData.priority === 'High' ? '🔴' : aiData.priority === 'Medium' ? '🟡' : '🟢'} {aiData.priority}
              </span>
              {aiData.subject && <span className="badge bg-light text-dark border">Re: {aiData.subject}</span>}
            </div>

            {/* 3 reply option cards */}
            <p className="small fw-semibold text-muted mb-2">SELECT A REPLY OPTION</p>
            <div className="row g-2 mb-3">
              {(aiData.replies || []).map((reply, i) => (
                <div className="col-md-4" key={i}>
                  <div
                    className={'reply-card p-3 rounded border cursor-pointer' + (activeReply === i ? ' active' : '')}
                    onClick={() => handleSelectReply(i)}
                  >
                    <div className="small fw-semibold mb-1">Option {i + 1} · {REPLY_LABELS[i]}</div>
                    <div className="small text-muted" style={{ overflow: 'hidden', maxHeight: 60 }}>
                      {reply.slice(0, 100)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            {aiData.summary && (
              <div className="summary-panel p-3 rounded border mb-3">
                <p className="small fw-semibold mb-2">📋 Thread Summary</p>
                {aiData.summary.key_points?.length > 0 && (
                  <div className="mb-2">
                    <div className="small text-muted fw-semibold">Key Points</div>
                    <ul className="small mb-0 ps-3">{aiData.summary.key_points.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  </div>
                )}
                {aiData.summary.action_items?.length > 0 && (
                  <div className="mb-2">
                    <div className="small text-muted fw-semibold">Action Items</div>
                    <ul className="small mb-0 ps-3">{aiData.summary.action_items.map((a, i) => <li key={i}>{a}</li>)}</ul>
                  </div>
                )}
                {aiData.summary.deadlines?.length > 0 && (
                  <div>
                    <div className="small text-muted fw-semibold">Deadlines</div>
                    <ul className="small mb-0 ps-3">{aiData.summary.deadlines.map((d, i) => <li key={i}>{d}</li>)}</ul>
                  </div>
                )}
              </div>
            )}

            {/* Smart suggestions */}
            {(aiData.suggestions?.follow_up || aiData.suggestions?.clarification || aiData.suggestions?.attachment) && (
              <div className="suggestions-panel p-3 rounded border mb-3">
                <p className="small fw-semibold mb-2">💡 Smart Suggestions</p>
                {aiData.suggestions.attachment && <p className="small mb-1">📎 {aiData.suggestions.attachment}</p>}
                {aiData.suggestions.follow_up && <p className="small mb-1">🔔 {aiData.suggestions.follow_up}</p>}
                {aiData.suggestions.clarification && <p className="small mb-0">❓ {aiData.suggestions.clarification}</p>}
              </div>
            )}
          </div>
        )}

        {/* Editable reply editor */}
        <div className="mb-3">
          <label className="form-label small fw-semibold text-muted">EDIT YOUR REPLY</label>
          <textarea
            className="form-control reply-editor"
            rows={10}
            placeholder="Your reply will appear here. You can edit it before sending."
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
          />
        </div>

        {/* Action buttons */}
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-primary fw-semibold" onClick={handleSend} disabled={sending || !editorContent.trim()}>
            {sending ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</> : '📤 Send'}
          </button>
          <button className="btn btn-outline-secondary" onClick={handleCopy} disabled={!editorContent.trim()}>
            📋 Copy
          </button>
          <button className="btn btn-outline-secondary" onClick={handleSaveDraft}>
            💾 Save Draft (Ctrl+S)
          </button>
          {aiData && (
            <button className="btn btn-outline-primary" onClick={handleGenerate} disabled={loading}>
              🔄 Regenerate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
