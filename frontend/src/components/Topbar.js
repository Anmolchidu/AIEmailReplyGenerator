import { useState } from 'react';

export default function Topbar({ darkMode, onToggleDark, onSearch }) {
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
      <span className="fs-5">✉️</span>
    </div>
  );
}
