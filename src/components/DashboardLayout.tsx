import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PageView } from '../types';
import { DashboardOverview } from './views/DashboardOverview';
import { VerifyView } from './views/VerifyView';
import { IssueView } from './views/IssueView';
import { BlockchainView } from './views/BlockchainView';
import { PrivacyRadarView } from './views/PrivacyRadarView';
import { ZKPStudioView } from './views/ZKPStudioView';
import { AIAssistantView } from './views/AIAssistantView';
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
      case 'ai-assistant':
        return 'AI Assistant';
      case 'profile':
        return 'Profile';
      default:
        return 'Dashboard';
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
          <div
            className={`nav-item ${page === 'dashboard' ? 'active' : ''}`}
            onClick={() => navTo('dashboard')}
          >
            <i className="ti ti-layout-dashboard"></i> Dashboard
          </div>
          <div
            className={`nav-item ${page === 'verify' ? 'active' : ''}`}
            onClick={() => navTo('verify')}
          >
            <i className="ti ti-shield-check"></i> Verify Certificate
          </div>
          <div
            className={`nav-item ${page === 'issue' ? 'active' : ''}`}
            onClick={() => navTo('issue')}
          >
            <i className="ti ti-upload"></i> Issue Certificate
          </div>
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

          <div
            className={`nav-item ${page === 'ai-assistant' ? 'active' : ''}`}
            onClick={() => navTo('ai-assistant')}
          >
            <i className="ti ti-robot"></i> AI Assistant
          </div>

          <div className="sidebar-sep"></div>

          <div
            className={`nav-item ${page === 'profile' ? 'active' : ''}`}
            onClick={() => navTo('profile')}
          >
            <i className="ti ti-user-circle"></i> Profile
          </div>

          <div
            className="nav-item"
            onClick={() => navTo('home')}
            style={{ color: 'var(--muted)' }}
          >
            <i className="ti ti-home"></i> Public Site
          </div>
        </nav>

        <div className="sidebar-footer">
          <div
            className="sidebar-user"
            onClick={() => navTo('profile')}
            style={{ cursor: 'pointer' }}
          >
            <div className="user-avatar">{initial}</div>
            <div>
              <div className="user-name">{user?.name || user?.username || 'Admin'}</div>
              <div className="user-role">Super Admin</div>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <i className="ti ti-logout"></i> Logout
          </button>
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
            <span className="topbar-user">
              @{user?.username || 'admin'}
            </span>
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
        {page === 'ai-assistant' && <AIAssistantView />}
        {page === 'profile' && <ProfileView />}
      </main>
    </div>
  );
};
