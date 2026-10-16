import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const AuthPage: React.FC = () => {
  const { login, register, setPage } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Form states
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');

  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginUser.trim() || !loginPass) {
      setError('Please fill in all fields.');
      return;
    }
    const ok = login(loginUser.trim(), loginPass);
    if (!ok) {
      setError('Invalid username or password. Use admin / admin123 for demo.');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !username.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    register(
      {
        username: username.trim(),
        name: name.trim(),
        email: email.trim(),
        institution: institution.trim() || 'GNIOT, Greater Noida',
      },
      password
    );
  };

  const fillDemo = () => {
    setLoginUser('admin');
    setLoginPass('admin123');
    setError('');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="grid-bg"></div>
      <div className="glow-orb orb1"></div>
      <div className="glow-orb orb2"></div>

      <div className="auth-page">
        <div className="auth-card">
          <div
            className="auth-logo"
            onClick={() => setPage('home')}
            style={{ cursor: 'pointer' }}
          >
            <i className="ti ti-certificate"></i>
            <span>CertifyChain</span>
          </div>

          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="auth-sub">
            {mode === 'login'
              ? 'Login to access the admin dashboard'
              : 'Register as an institutional admin'}
          </p>

          {mode === 'login' && (
            <div
              className="demo-hint"
              onClick={fillDemo}
              style={{ cursor: 'pointer' }}
              title="Click to autofill demo credentials"
            >
              <i className="ti ti-info-circle"></i>
              <span>
                Demo credentials: <strong>admin</strong> / <strong>admin123</strong>{' '}
                <span style={{ textDecoration: 'underline', opacity: 0.8 }}>(Click to fill)</span>
              </span>
            </div>
          )}

          {error && <div className="auth-error show">{error}</div>}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label>Username</label>
                <div className="input-wrap">
                  <i className="ti ti-user"></i>
                  <input
                    type="text"
                    placeholder="admin"
                    autoComplete="username"
                    value={loginUser}
                    onChange={e => setLoginUser(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrap">
                  <i className="ti ti-lock"></i>
                  <input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={loginPass}
                    onChange={e => setLoginPass(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-btn">
                <i className="ti ti-login"></i> Login to Dashboard
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                style={{ width: '100%', marginTop: '0.6rem', justifyContent: 'center', borderColor: 'var(--border)' }}
                onClick={() => {
                  login('admin', 'admin123');
                }}
              >
                <i className="ti ti-bolt" style={{ color: 'var(--accent)' }}></i> 1-Click Demo Admin Sign-In
              </button>

              <p className="auth-switch">
                Don't have an account?{' '}
                <a
                  onClick={() => {
                    setError('');
                    setMode('signup');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  Sign up here
                </a>
              </p>

              <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setPage('verify')}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '0.82rem', color: 'var(--accent)' }}
                >
                  <i className="ti ti-shield-check"></i> Continue as Public Guest to Verify Certificates
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="auth-form">
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrap">
                  <i className="ti ti-user-circle"></i>
                  <input
                    type="text"
                    placeholder="Arjun Kumar"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <div className="input-wrap">
                  <i className="ti ti-mail"></i>
                  <input
                    type="email"
                    placeholder="admin@institution.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Username</label>
                <div className="input-wrap">
                  <i className="ti ti-id"></i>
                  <input
                    type="text"
                    placeholder="arjun_admin"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrap">
                  <i className="ti ti-lock"></i>
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Institution</label>
                <div className="input-wrap">
                  <i className="ti ti-building"></i>
                  <input
                    type="text"
                    placeholder="GNIOT, Greater Noida"
                    value={institution}
                    onChange={e => setInstitution(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="auth-btn">
                <i className="ti ti-user-plus"></i> Create Account
              </button>

              <p className="auth-switch">
                Already have an account?{' '}
                <a
                  onClick={() => {
                    setError('');
                    setMode('login');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  Login here
                </a>
              </p>
            </form>
          )}

          <div
            className="back-home"
            onClick={() => setPage('home')}
            style={{ cursor: 'pointer' }}
          >
            <i className="ti ti-arrow-left"></i> Back to Homepage
          </div>
        </div>

        {/* Right side decorative panel */}
        <div className="auth-panel">
          <div className="auth-panel-content">
            <i className="ti ti-certificate auth-panel-icon"></i>
            <h3>Blockchain Certificate Verification</h3>
            <p>Secure, AI-powered, tamper-resistant certificate management for modern institutions.</p>
            <div className="auth-features">
              <div className="auth-feature">
                <i className="ti ti-check-circle"></i> Blockchain-secured records
              </div>
              <div className="auth-feature">
                <i className="ti ti-check-circle"></i> AI-powered fraud detection
              </div>
              <div className="auth-feature">
                <i className="ti ti-check-circle"></i> QR + File + Number verification
              </div>
              <div className="auth-feature">
                <i className="ti ti-check-circle"></i> Real-time analytics dashboard
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
