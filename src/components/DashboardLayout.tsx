import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageView } from '../types';
import { DashboardOverview } from './views/DashboardOverview';
import { VerifyView } from './views/VerifyView';
import { IssueView } from './views/IssueView';
import { BlockchainView } from './views/BlockchainView';
import { PrivacyRadarView } from './views/PrivacyRadarView';
import { ZKPStudioView } from './views/ZKPStudioView';
import { DataMinimizationView } from './views/DataMinimizationView';
import { ProfileView } from './views/ProfileView';

export const DashboardLayout: React.FC = () => {
  const { page, setPage, user, logout, theme, toggleTheme, privacySummary } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = (p: PageView) => {
    switch (p) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'verify':
        return 'Verify Certificate & Fraud Detection';
      case 'issue':
        return 'Issue Certificate';
      case 'blockchain':
        return 'Blockchain Explorer';
      case 'privacy-radar':
        return 'Privacy Leakage Radar & Automated Testing';
      case 'zkp-studio':
        return 'Zero-Knowledge Proof Studio & Selective Disclosure';
      case 'data-minimization':
        return 'Context-Sensitive Data Minimization Policy Engine';
      case 'profile':
        return 'Profile';
      default:
        return 'CertifyChain';
    }
  };

  const navTo = (target: PageView) => {
    setPage(target);
    setSidebarOpen(false);
  };

  const initial = (user?.name || user?.username || 'A').charAt(0).toUpperCase();

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex' }}>
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="sidebar">
        <div
          className="sidebar-logo"
          onClick={() => navTo('dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <i className="ti ti-certificate"></i>
          <span>CertifyChain</span>
        </div>

        <nav className="sidebar-nav">
          {user && (
            <div
              className={`nav-item ${page === 'dashboard' ? 'active' : ''}`}
              onClick={() => navTo('dashboard')}
            >
              <i className="ti ti-layout-dashboard"></i> Dashboard
            </div>
          )}
          <div
            className={`nav-item ${page === 'verify' ? 'active' : ''}`}
            onClick={() => navTo('verify')}
          >
            <i className="ti ti-shield-check"></i> Verify Certificate
          </div>
          {user && (
            <div
              className={`nav-item ${page === 'issue' ? 'active' : ''}`}
              onClick={() => navTo('issue')}
            >
              <i className="ti ti-upload"></i> Issue Certificate
            </div>
          )}
          <div
            className={`nav-item ${page === 'blockchain' ? 'active' : ''}`}
            onClick={() => navTo('blockchain')}
          >
            <i className="ti ti-link"></i> Blockchain Explorer
          </div>

          {/* PRIVACY LEAKAGE RADAR NAV */}
          <div
            className={`nav-item ${page === 'privacy-radar' ? 'active' : ''}`}
            onClick={() => navTo('privacy-radar')}
            style={{ position: 'relative' }}
          >
            <i className="ti ti-radar" style={{ color: 'var(--success)' }}></i>
            <span style={{ flex: 1 }}>Privacy Radar</span>
            {privacySummary.piiExposureCount > 0 ? (
              <span
                style={{
                  background: 'rgba(239,35,60,.2)',
                  color: 'var(--danger)',
                  fontSize: '0.68rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: 700,
                }}
              >
                {privacySummary.piiExposureCount}
              </span>
            ) : (
              <span
                style={{
                  background: 'rgba(6,214,160,.2)',
                  color: 'var(--success)',
                  fontSize: '0.68rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: 700,
                }}
              >
                100%
              </span>
            )}
          </div>

          {/* ZERO KNOWLEDGE PROOF STUDIO */}
          <div
            className={`nav-item ${page === 'zkp-studio' ? 'active' : ''}`}
            onClick={() => navTo('zkp-studio')}
          >
            <i className="ti ti-lock-access" style={{ color: 'var(--accent)' }}></i> ZK Proof Studio
          </div>

          {/* CONTEXT-SENSITIVE DATA MINIMIZATION POLICY ENGINE */}
          <div
            className={`nav-item ${page === 'data-minimization' ? 'active' : ''}`}
            onClick={() => navTo('data-minimization')}
            style={{ position: 'relative' }}
          >
            <i className="ti ti-filter-check" style={{ color: 'var(--success)' }}></i>
            <span style={{ flex: 1 }}>Policy Engine</span>
            <span
              style={{
                background: 'rgba(67,97,238,.2)',
                color: 'var(--accent)',
                fontSize: '0.68rem',
                padding: '1px 6px',
                borderRadius: '10px',
                fontWeight: 700,
              }}
            >
              GDPR
            </span>
          </div>

          <div className="sidebar-sep"></div>

          {user && (
            <div
              className={`nav-item ${page === 'profile' ? 'active' : ''}`}
              onClick={() => navTo('profile')}
            >
              <i className="ti ti-user-circle"></i> Profile &amp; Settings
            </div>
          )}

          <div
            className="nav-item"
            onClick={() => navTo('home')}
            style={{ color: 'var(--muted)' }}
          >
            <i className="ti ti-home"></i> Public Site
          </div>
        </nav>

        <div className="sidebar-footer">
          {user ? (
            <>
              <div
                className="sidebar-user"
                onClick={() => navTo('profile')}
                style={{ cursor: 'pointer' }}
              >
                <div className="user-avatar">{initial}</div>
                <div>
                  <div className="user-name">{user.name || user.username}</div>
                  <div className="user-role">Institutional Admin</div>
                </div>
              </div>
              <button className="logout-btn" onClick={logout}>
                <i className="ti ti-logout"></i> Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="ti ti-shield-check"></i> Public Verifier Access
              </div>
              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setPage('login')}
              >
                <i className="ti ti-login"></i> Admin Login
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content" style={{ flex: 1, minWidth: 0 }}>
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mob-menu-btn"
              onClick={() => setSidebarOpen(prev => !prev)}
            >
              <i className="ti ti-menu-2"></i>
            </button>
            <h1 className="page-title">{getPageTitle(page)}</h1>
          </div>

          <div className="topbar-right">
            <span
              className="online-badge"
              onClick={() => navTo('privacy-radar')}
              style={{ cursor: 'pointer' }}
              title="Click to view Privacy Radar"
            >
              <span className="dot"></span> Privacy Shield: {privacySummary.overallScore}%
            </span>
            {user ? (
              <span className="topbar-user">
                @{user.username}
              </span>
            ) : (
              <button
                onClick={() => setPage('login')}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
              >
                <i className="ti ti-login"></i> Login
              </button>
            )}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <i className="ti ti-moon icon-moon"></i>
              ) : (
                <i className="ti ti-sun icon-sun"></i>
              )}
            </button>
          </div>
        </header>

        {/* ACTIVE SUBVIEW */}
        {page === 'dashboard' && <DashboardOverview />}
        {page === 'verify' && <VerifyView />}
        {page === 'issue' && <IssueView />}
        {page === 'blockchain' && <BlockchainView />}
        {page === 'privacy-radar' && <PrivacyRadarView />}
        {page === 'zkp-studio' && <ZKPStudioView />}
        {page === 'data-minimization' && <DataMinimizationView />}
        {page === 'profile' && <ProfileView />}
      </main>
    </div>
  );
};
