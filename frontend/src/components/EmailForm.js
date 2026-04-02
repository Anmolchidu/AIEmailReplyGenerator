import { useState } from 'react';

const TONES = ['professional', 'friendly', 'formal', 'casual', 'apologetic', 'confident'];
const LENGTHS = ['short', 'medium', 'long'];
const MAX_CHARS = 5000;

const EmailForm = ({ onSubmit, loading }) => {
  const [email, setEmail] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [conversationHistory, setConversationHistory] = useState('');
  const [userName, setUserName] = useState('');
  const [signature, setSignature] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setValidationError('Please paste or type an email to reply to.');
      return;
    }
    if (email.trim().length < 10) {
      setValidationError('Email content is too short (minimum 10 characters).');
      return;
    }
    setValidationError('');
    onSubmit({ email: email.trim(), tone, length, conversationHistory, userName, signature });
  };

  const charCount = email.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <form onSubmit={handleSubmit} noValidate>

      <div className="mb-3">
        <label htmlFor="emailInput" className="form-label fw-semibold">Original Email</label>
        <textarea
          id="emailInput"
          className={'form-control' + (validationError ? ' is-invalid' : '')}
          rows={7}
          placeholder="Paste the email you want to reply to..."
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (validationError) setValidationError('');
          }}
          disabled={loading}
          maxLength={MAX_CHARS}
        />
        <div className="d-flex justify-content-between mt-1">
          {validationError
            ? <div className="text-danger small">{validationError}</div>
            : <div />
          }
          <small className={'text-end ' + (isOverLimit ? 'text-danger fw-bold' : 'text-muted')}>
            {charCount} / {MAX_CHARS}
          </small>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-6">
          <label htmlFor="toneSelect" className="form-label fw-semibold">Tone</label>
          <select
            id="toneSelect"
            className="form-select"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            disabled={loading}
          >
            {TONES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="col-6">
          <label htmlFor="lengthSelect" className="form-label fw-semibold">Reply Length</label>
          <select
            id="lengthSelect"
            className="form-select"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            disabled={loading}
          >
            {LENGTHS.map((l) => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <button
          type="button"
          className="btn btn-link p-0 text-decoration-none text-secondary small"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '▲ Hide advanced options' : '▼ Advanced options (history, name, signature)'}
        </button>
      </div>

      {showAdvanced && (
        <div className="mb-3 p-3 rounded-3 border bg-light">
          <div className="mb-3">
            <label htmlFor="historyInput" className="form-label fw-semibold small">
              Conversation History <span className="text-muted fw-normal">(optional)</span>
            </label>
            <textarea
              id="historyInput"
              className="form-control form-control-sm"
              rows={4}
              placeholder="Paste prior emails in the thread (oldest first)..."
              value={conversationHistory}
              onChange={(e) => setConversationHistory(e.target.value)}
              disabled={loading}
              maxLength={10000}
            />
          </div>
          <div className="row g-3">
            <div className="col-sm-6">
              <label htmlFor="userNameInput" className="form-label fw-semibold small">
                Your Name <span className="text-muted fw-normal">(optional)</span>
              </label>
              <input
                id="userNameInput"
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. Sarah"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={loading}
                maxLength={100}
              />
            </div>
            <div className="col-sm-6">
              <label htmlFor="signatureInput" className="form-label fw-semibold small">
                Signature <span className="text-muted fw-normal">(optional)</span>
              </label>
              <input
                id="signatureInput"
                type="text"
                className="form-control form-control-sm"
                placeholder="e.g. Best, Sarah | Product Lead"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                disabled={loading}
                maxLength={500}
              />
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary w-100 py-2 fw-semibold"
        disabled={loading || isOverLimit}
      >
        {loading
          ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Generating...</>
          : '✨ Generate Reply'
        }
      </button>

    </form>
  );
};

export default EmailForm;
