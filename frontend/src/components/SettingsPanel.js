import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SettingsPanel({ darkMode }) {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    email: user?.email || '',
    gmail_address: user?.gmail_address || '',
    gmail_app_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { email: form.email, gmail_address: form.gmail_address };
      if (form.gmail_app_password) payload.gmail_app_password = form.gmail_app_password;
      const { data } = await updateProfile(payload);
      setUser(data);
      toast.success('Settings saved.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={'panel-view p-4' + (darkMode ? ' dark' : '')}>
      <h5 className="fw-bold mb-4">⚙️ Settings</h5>
      <div className="card border-0 shadow-sm p-4" style={{ maxWidth: 520 }}>
        <form onSubmit={submit}>
          <h6 className="fw-semibold mb-3">Account</h6>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input name="email" type="email" className="form-control" value={form.email} onChange={handle} disabled={loading} />
          </div>
          <hr />
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-semibold mb-0">Gmail SMTP</h6>
            <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setShowHelp(!showHelp)}>Setup guide</button>
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
            <input name="gmail_address" type="email" className="form-control" placeholder="you@gmail.com"
              value={form.gmail_address} onChange={handle} disabled={loading} />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">App Password <span className="text-muted fw-normal">(leave blank to keep current)</span></label>
            <input name="gmail_app_password" type="password" className="form-control" placeholder="New app password"
              value={form.gmail_app_password} onChange={handle} disabled={loading} />
          </div>
          <button className="btn btn-primary fw-semibold" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
