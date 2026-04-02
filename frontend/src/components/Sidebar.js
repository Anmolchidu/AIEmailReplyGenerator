const NAV = [
  { key: 'compose', icon: '✏️', label: 'Compose' },
  { key: 'inbox', icon: '📥', label: 'Inbox' },
  { key: 'drafts', icon: '📄', label: 'Drafts' },
  { key: 'history', icon: '🕐', label: 'History' },
  { key: 'analytics', icon: '📊', label: 'Analytics' },
  { key: 'settings', icon: '⚙️', label: 'Settings' },
];

export default function Sidebar({ active, onNav, darkMode }) {
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
    </div>
  );
}
