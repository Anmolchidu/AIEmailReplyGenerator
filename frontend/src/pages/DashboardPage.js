import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Composer from '../components/Composer';
import InboxPanel from '../components/InboxPanel';
import DraftsPanel from '../components/DraftsPanel';
import HistoryPanel from '../components/HistoryPanel';
import AnalyticsPanel from '../components/AnalyticsPanel';
import SettingsPanel from '../components/SettingsPanel';

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState('compose');
  const [darkMode, setDarkMode] = useState(false);
  const [draftToOpen, setDraftToOpen] = useState(null);

  const handleOpenDraft = (draft) => {
    setDraftToOpen(draft);
    setActiveNav('compose');
  };

  const renderMain = () => {
    switch (activeNav) {
      case 'compose':
        return <Composer darkMode={darkMode} initialDraft={draftToOpen} onDraftSaved={() => {}} />;
      case 'inbox':
        return <InboxPanel darkMode={darkMode} onCompose={() => setActiveNav('compose')} />;
      case 'drafts':
        return <DraftsPanel darkMode={darkMode} onOpenDraft={handleOpenDraft} />;
      case 'history':
        return <HistoryPanel darkMode={darkMode} />;
      case 'analytics':
        return <AnalyticsPanel darkMode={darkMode} />;
      case 'settings':
        return <SettingsPanel darkMode={darkMode} />;
      default:
        return null;
    }
  };

  return (
    <div className={'app-shell' + (darkMode ? ' dark-mode' : '')}>
      <Sidebar active={activeNav} onNav={setActiveNav} darkMode={darkMode} />
      <div className="main-area d-flex flex-column">
        <Topbar darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)} />
        <div className="main-content flex-grow-1 overflow-auto">
          {renderMain()}
        </div>
      </div>
    </div>
  );
}
