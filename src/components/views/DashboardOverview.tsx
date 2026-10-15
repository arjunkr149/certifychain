import React from 'react';
import { useApp } from '../../context/AppContext';

export const DashboardOverview: React.FC = () => {
  const { user, certs, setPage, privacySummary } = useApp();

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  const recentCerts = certs.slice(-4).reverse();
  const timeLabels = ['2 min ago', '14 min ago', '1 hr ago', '3 hrs ago'];

  return (
    <div className="page-content">
      {/* WELCOME BANNER */}
      <div className="welcome-banner">
        <div>
          <h2>
            {getGreeting()}, {user?.name || user?.username || 'Admin'} 👋
          </h2>
          <p>Here&apos;s what&apos;s happening with CertifyChain today.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setPage('verify')} className="btn btn-primary">
            <i className="ti ti-shield-check"></i> Quick Verify
          </button>
          <button
            onClick={() => setPage('privacy-radar')}
            className="btn btn-ghost"
            style={{ borderColor: 'rgba(6,214,160,.3)', color: 'var(--success)' }}
          >
            <i className="ti ti-radar"></i> Privacy Radar ({privacySummary.overallScore}%)
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <p className="stat-label">Total Certificates</p>
            <div className="stat-icon accent">
              <i className="ti ti-certificate"></i>
            </div>
          </div>
          <h3 className="stat-number">{1242 + certs.length}</h3>
          <p className="stat-desc">Certificates Issued</p>
          <div className="trend up">
            <i className="ti ti-trending-up"></i> +12% this month
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <p className="stat-label">Verifications Today</p>
            <div className="stat-icon success">
              <i className="ti ti-shield-check"></i>
            </div>
          </div>
          <h3 className="stat-number">342</h3>
          <p className="stat-desc">Requests Processed</p>
          <div className="trend up">
            <i className="ti ti-trending-up"></i> +8% vs yesterday
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <p className="stat-label">Fraud Detected &amp; Blocked</p>
            <div className="stat-icon danger">
              <i className="ti ti-alert-triangle"></i>
            </div>
          </div>
          <h3 className="stat-number">7</h3>
          <p className="stat-desc">Tampered Certificates</p>
          <div className="trend down">
            <i className="ti ti-shield-x"></i> AI OCR Blocked
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <p className="stat-label">Privacy Shield Radar</p>
            <div className="stat-icon success">
              <i className="ti ti-radar"></i>
            </div>
          </div>
          <h3 className="stat-number" style={{ color: 'var(--success)' }}>
            {privacySummary.overallScore}%
          </h3>
          <p className="stat-desc">{privacySummary.status}</p>
          <div className="trend up">
            <i className="ti ti-lock"></i> Zero-Knowledge Salting
          </div>
        </div>
      </div>

      {/* RECENT VERIFICATIONS TABLE */}
      <div className="card">
        <div className="card-header">
          <h2>
            <i className="ti ti-clock-history"></i> Recent Verifications &amp; Ledger Checks
          </h2>
          <button onClick={() => setPage('verify')} className="btn btn-ghost btn-sm">
            View All
          </button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Certificate No.</th>
                <th>Student</th>
                <th>Course</th>
                <th>Verified At</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentCerts.map((c, i) => (
                <tr key={c.no}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--accent)' }}>
                      {c.no}
                    </span>
                  </td>
                  <td>{c.student}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.84rem' }}>{c.course}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{timeLabels[i] || 'Earlier'}</td>
                  <td>
                    <span className="status-badge status-valid">
                      <i className="ti ti-check" style={{ fontSize: '0.7rem' }}></i> Verified Authentic
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setPage('verify')}
                      className="btn btn-ghost btn-sm"
                    >
                      <i className="ti ti-external-link"></i> Verify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="quick-actions">
        <h2 className="card-title">
          <i className="ti ti-bolt"></i> Quick Actions &amp; Security Tools
        </h2>
        <div className="action-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
          <div className="action-card" onClick={() => setPage('verify')}>
            <i className="ti ti-shield-check"></i>
            <span>Verify Certificate</span>
          </div>
          <div className="action-card" onClick={() => setPage('issue')}>
            <i className="ti ti-upload"></i>
            <span>Issue Certificate</span>
          </div>
          <div className="action-card" onClick={() => setPage('blockchain')}>
            <i className="ti ti-link"></i>
            <span>View Blockchain</span>
          </div>
          <div className="action-card" onClick={() => setPage('privacy-radar')}>
            <i className="ti ti-radar" style={{ color: 'var(--success)' }}></i>
            <span>Privacy Radar</span>
          </div>
          <div className="action-card" onClick={() => setPage('ai-assistant')}>
            <i className="ti ti-robot"></i>
            <span>AI Fraud Assistant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
