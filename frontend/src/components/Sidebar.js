import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const NAV = [
  { key: 'compose', icon: '✏️', label: 'Compose' },
  { key: 'inbox', icon: '📥', label: 'Inbox' },
  { key: 'drafts', icon: '📄', label: 'Drafts' },
  { key: 'history', icon: '🕐', label: 'History' },
  { key: 'analytics', icon: '📊', label: 'Analytics' },
  { key: 'settings', icon: '⚙️', label: 'Settings' },
];

export default function Sidebar({ active, onNav, darkMode }) {
  const { logoutUser, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    toast.success('Signed out.');
    navigate('/login');
  };

  return (
    <div className={'sidebar d-flex flex-column' + (darkMode ? ' dark' : '')}>
      <div className="sidebar-brand px-3 py-3 d-flex align-items-center gap-2">
        <span className="fs-4">✉️</span>
        <span className="fw-bold">AI Mail</span>
      </div>
      <nav className="flex-grow-1 px-2 mt-1">
        {NAV.map((item) => (
          <button
            key={item.key}
            className={'sidebar-nav-item w-100 text-start d-flex align-items-center gap-2 px-3 py-2 rounded mb-1' +
              (active === item.key ? ' active' : '')}
            onClick={() => onNav(item.key)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="px-3 py-3 border-top">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div className="avatar-circle">{user?.username?.[0]?.toUpperCase()}</div>
          <div className="small">
            <div className="fw-semibold lh-1">{user?.username}</div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.email}</div>
          </div>
        </div>
        <button className="btn btn-sm btn-outline-danger w-100" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
