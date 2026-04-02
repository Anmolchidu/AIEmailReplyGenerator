import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ darkMode, onToggleDark, onSearch }) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <div className={'topbar d-flex align-items-center px-4 gap-3' + (darkMode ? ' dark' : '')}>
      <form className="flex-grow-1" onSubmit={handleSearch}>
        <div className="input-group">
          <span className="input-group-text bg-transparent border-end-0">🔍</span>
          <input
            className="form-control border-start-0 ps-0"
            placeholder="Search emails..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </form>
      <button className="btn btn-sm btn-outline-secondary" onClick={onToggleDark} title="Toggle theme">
        {darkMode ? '☀️' : '🌙'}
      </button>
      <div className="d-flex align-items-center gap-2">
        <div className="avatar-circle">{user?.username?.[0]?.toUpperCase()}</div>
        <span className="small fw-semibold d-none d-md-inline">{user?.username}</span>
      </div>
    </div>
  );
}
