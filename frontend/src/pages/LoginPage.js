import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data, data.user);
      toast.success('Welcome back, ' + data.user.username + '!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page d-flex align-items-center justify-content-center min-vh-100">
      <div className="auth-card card shadow border-0 p-4" style={{ width: '100%', maxWidth: 420 }}>
        <div className="text-center mb-4">
          <div className="fs-1">✉️</div>
          <h4 className="fw-bold mb-0">AI Email Assistant</h4>
          <p className="text-muted small">Sign in to your account</p>
        </div>
        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Username</label>
            <input name="username" className="form-control" placeholder="Enter username"
              value={form.username} onChange={handle} required disabled={loading} />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <input name="password" type="password" className="form-control" placeholder="Enter password"
              value={form.password} onChange={handle} required disabled={loading} />
          </div>
          <button className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</> : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-muted small mt-3 mb-0">
          No account? <Link to="/register" className="text-primary">Create one</Link>
        </p>
      </div>
    </div>
  );
}
