import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function SettingsPanel({ darkMode }) {
  const { gmailAddress, setGmailAddress, gmailAppPassword, setGmailAppPassword } = useAuth();
  const [form, setForm] = useState({
    gmail_address: gmailAddress,
    gmail_app_password: gmailAppPassword,
  });
  const [showHelp, setShowHelp] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setGmailAddress(form.gmail_address);
    setGmailAppPassword(form.gmail_app_password);
    toast.success('Gmail credentials saved for this session.');
  };

  return (
    <div className={'panel-view p-4' + (darkMode ? ' dark' : '')}>
      <h5 className="fw-bold mb-4">⚙️ Settings</h5>
      <div className="card border-0 shadow-sm p-4" style={{ maxWidth: 520 }}>
        <form onSubmit={submit}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-semibold mb-0">Gmail SMTP Credentials</h6>
            <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setShowHelp(!showHelp)}>
              Setup guide
            </button>
          </div>
          {showHelp && (
            <div className="alert alert-info small py-2 mb-3">
              1. Go to <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer">Google Security</a><br />
              2. Enable 2-Step Verification<br />
              3. Search "App Passwords" → Select Mail + Windows<br />
              4. Copy the 16-char password and paste below
            </div>
          )}
          <div className="mb-3">
            <label className="form-label fw-semibold">Gmail Address</label>
            <input
              name="gmail_address"
              type="email"
              className="form-control"
              placeholder="you@gmail.com"
              value={form.gmail_address}
              onChange={handle}
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">App Password</label>
            <input
              name="gmail_app_password"
              type="password"
              className="form-control"
              placeholder="16-char app password"
              value={form.gmail_app_password}
              onChange={handle}
            />
          </div>
          <button type="submit" className="btn btn-primary fw-semibold">
            Save Credentials
          </button>
        </form>
      </div>
    </div>
  );
}
