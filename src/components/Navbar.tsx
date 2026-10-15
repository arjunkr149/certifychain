import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, user, page, setPage } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (page !== 'home') {
      setPage('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar" id="main-nav">
      <div className="nav-container">
        <div
          className="nav-logo"
          onClick={() => scrollToSection('hero')}
          style={{ cursor: 'pointer' }}
        >
          <i className="ti ti-certificate"></i>
          <span>CertifyChain</span>
        </div>

        <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`} id="nav-links">
          <li>
            <a onClick={() => scrollToSection('hero')} style={{ cursor: 'pointer' }}>
              Home
            </a>
          </li>
          <li>
            <a onClick={() => scrollToSection('features')} style={{ cursor: 'pointer' }}>
              Features
            </a>
          </li>
          <li>
            <a onClick={() => scrollToSection('about')} style={{ cursor: 'pointer' }}>
              About
            </a>
          </li>
          <li>
            <a onClick={() => scrollToSection('how-it-works')} style={{ cursor: 'pointer' }}>
              How It Works
            </a>
          </li>
          <li>
            <a onClick={() => scrollToSection('faq')} style={{ cursor: 'pointer' }}>
              FAQ
            </a>
          </li>
          <li>
            <a onClick={() => scrollToSection('contact')} style={{ cursor: 'pointer' }}>
              Contact
            </a>
          </li>
        </ul>

        <div className="nav-actions">
          <button
            className="theme-toggle"
            id="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle Dark/Light theme"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <i className="ti ti-moon icon-moon"></i>
            ) : (
              <i className="ti ti-sun icon-sun"></i>
            )}
          </button>

          {user ? (
            <button
              onClick={() => setPage('dashboard')}
              className="btn btn-primary"
            >
              <i className="ti ti-layout-dashboard"></i> Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => setPage('login')}
                className="btn btn-ghost"
              >
                Login
              </button>
              <button
                onClick={() => setPage('login')}
                className="btn btn-primary"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        <button
          className="hamburger"
          id="hamburger"
          aria-label="Toggle menu"
          onClick={() => setMobileMenuOpen(prev => !prev)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            padding: '1rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <a onClick={() => scrollToSection('hero')} style={{ cursor: 'pointer', color: 'var(--text)' }}>
            Home
          </a>
          <a onClick={() => scrollToSection('features')} style={{ cursor: 'pointer', color: 'var(--text)' }}>
            Features
          </a>
          <a onClick={() => scrollToSection('about')} style={{ cursor: 'pointer', color: 'var(--text)' }}>
            About
          </a>
          <a onClick={() => scrollToSection('how-it-works')} style={{ cursor: 'pointer', color: 'var(--text)' }}>
            How It Works
          </a>
          <a onClick={() => scrollToSection('faq')} style={{ cursor: 'pointer', color: 'var(--text)' }}>
            FAQ
          </a>
          <a onClick={() => scrollToSection('contact')} style={{ cursor: 'pointer', color: 'var(--text)' }}>
            Contact
          </a>
          <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setPage(user ? 'dashboard' : 'login');
              }}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {user ? 'Go to Dashboard' : 'Login / Register'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
