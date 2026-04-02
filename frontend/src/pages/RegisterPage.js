import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', password: '', gmail_address: '', gmail_app_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showGmailHelp, setShowGmailHelp] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await register(form);
      loginUser(data, data.user);
      toast.success('Account created! Welcome, ' + data.user.username + '!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page d-flex align-items-center justify-content-center min-vh-100 py-4">
      <div className="auth-card card shadow border-0 p-4" style={{ width: '100%', maxWidth: 460 }}>
        <div className="text-center mb-4">
          <div className="fs-1">✉️</div>
          <h4 className="fw-bold mb-0">Create Account</h4>
          <p className="text-muted small">AI Email Assistant</p>
        </div>
        <form onSubmit={submit}>
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="form-label fw-semibold">Username</label>
              <input name="username" className="form-control" placeholder="username"
                value={form.username} onChange={handle} required disabled={loading} />
            </div>
            <div className="col-6">
              <label className="form-label fw-semibold">Email</label>
              <input name="email" type="email" className="form-control" placeholder="you@email.com"
                value={form.email} onChange={handle} disabled={loading} />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Password <span className="text-muted fw-normal">(min 6 chars)</span></label>
            <input name="password" type="password" className="form-control" placeholder="Password"
              value={form.password} onChange={handle} required disabled={loading} />
          </div>
          <hr className="my-3" />
          <div className="d-flex justify-content-between align-items-center mb-2">
            <p className="fw-semibold mb-0 small">Gmail SMTP <span className="text-muted fw-normal">(optional — for sending emails)</span></p>
            <button type="button" className="btn btn-link btn-sm p-0" onClick={() => setShowGmailHelp(!showGmailHelp)}>
              How?
            </button>
          </div>
          {showGmailHelp && (
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
            <label className="form-label fw-semibold">Gmail App Password</label>
            <input name="gmail_app_password" type="password" className="form-control" placeholder="16-char app password"
              value={form.gmail_app_password} onChange={handle} disabled={loading} />
          </div>
          <button className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating...</> : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-muted small mt-3 mb-0">
          Already have an account? <Link to="/login" className="text-primary">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
