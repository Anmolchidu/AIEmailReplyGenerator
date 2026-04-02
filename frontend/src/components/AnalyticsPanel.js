import { useState, useEffect } from 'react';
import { getHistory } from '../services/api';

export default function AnalyticsPanel({ darkMode }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getHistory().then((r) => {
      const data = r.data;
      const toneCounts = {};
      data.forEach((item) => {
        toneCounts[item.tone] = (toneCounts[item.tone] || 0) + 1;
      });
      setStats({ total: data.length, toneCounts, recent: data.slice(0, 5) });
    }).catch(() => {});
  }, []);

  if (!stats) return <div className="p-4"><span className="spinner-border spinner-border-sm" /></div>;

  const topTone = Object.entries(stats.toneCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className={'panel-view p-4' + (darkMode ? ' dark' : '')}>
      <h5 className="fw-bold mb-4">📊 Analytics</h5>
      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="fs-2 fw-bold text-primary">{stats.total}</div>
            <div className="small text-muted">Emails Sent</div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="fs-2 fw-bold text-success">{Object.keys(stats.toneCounts).length}</div>
            <div className="small text-muted">Tones Used</div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card border-0 shadow-sm text-center p-3">
            <div className="fs-5 fw-bold text-warning">{topTone ? topTone[0] : '—'}</div>
            <div className="small text-muted">Favourite Tone</div>
          </div>
        </div>
      </div>

      <h6 className="fw-semibold mb-3">Tone Breakdown</h6>
      {Object.entries(stats.toneCounts).map(([tone, count]) => (
        <div key={tone} className="mb-2">
          <div className="d-flex justify-content-between small mb-1">
            <span className="text-capitalize">{tone}</span>
            <span>{count}</span>
          </div>
          <div className="progress" style={{ height: 8 }}>
            <div
              className="progress-bar"
              style={{ width: (count / stats.total * 100) + '%' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
