import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const ProfileView: React.FC = () => {
  const { user, updateProfile, changePassword, logout, certs, showToast } = useApp();

  // Profile fields
  const [name, setName] = useState(user?.name || 'Arjun Kumar');
  const [username, setUsername] = useState(user?.username || 'admin');
  const [email, setEmail] = useState(user?.email || 'aksir648@gmail.com');
  const [phone, setPhone] = useState(user?.phone || '+91-6386416463');
  const [institution, setInstitution] = useState(user?.institution || 'GNIOT, Greater Noida');

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Password fields
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confPass, setConfPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    if (!username.trim()) {
      showToast('Username cannot be empty', 'error');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setSavingProfile(true);
    setTimeout(() => {
      updateProfile({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        institution: institution.trim(),
      });
      setSavingProfile(false);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    }, 600);
  };

  const handleResetProfile = () => {
    setName(user?.name || 'Arjun Kumar');
    setUsername(user?.username || 'admin');
    setEmail(user?.email || 'aksir648@gmail.com');
    setPhone(user?.phone || '+91-6386416463');
    setInstitution(user?.institution || 'GNIOT, Greater Noida');
    showToast('Form reset to saved values', 'success');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (!curPass) {
      setPassError('Enter your current password');
      return;
    }
    if (!newPass) {
      setPassError('Enter a new password');
      return;
    }
    if (newPass.length < 6) {
      setPassError('Password must be at least 6 characters');
      return;
    }
    if (newPass !== confPass) {
      setPassError('Passwords do not match');
      return;
    }

    const success = changePassword(curPass, newPass);
    if (!success) {
      setPassError('Incorrect current password');
    } else {
      setPassSuccess(true);
      setCurPass('');
      setNewPass('');
      setConfPass('');
      setTimeout(() => setPassSuccess(false), 3000);
    }
  };

  const initial = (name || username || 'A').charAt(0).toUpperCase();

  return (
    <div className="page-content">
      <div className="profile-layout">
        {/* Left Side: Profile Card */}
        <div className="profile-side">
          <div className="card profile-info-card">
            <div className="profile-avatar-big">{initial}</div>
            <h2 className="profile-full-name">{name}</h2>
            <p className="profile-role-tag">@{username}</p>
            <div className="profile-institution">
              <i className="ti ti-building"></i>
              <span>{institution}</span>
            </div>

            <div className="profile-stats">
              <div className="pstat">
                <span>{1242 + certs.length}</span>
                <small>Issued</small>
              </div>
              <div className="pstat">
                <span>342</span>
                <small>Verified</small>
              </div>
              <div className="pstat">
                <span>99.9%</span>
                <small>Accuracy</small>
              </div>
            </div>

            <div className="profile-badge-row">
              <span className="role-badge">
                <i className="ti ti-shield"></i> Super Admin
              </span>
              <span className="role-badge verified">
                <i className="ti ti-check-circle"></i> Verified Node
              </span>
            </div>
          </div>

          <div className="card">
            <div className="card-section-title">Account Details</div>
            <ul className="info-list">
              <li>
                <i className="ti ti-id"></i>
                <span>User ID:</span>
                <strong>{username}</strong>
              </li>
              <li>
                <i className="ti ti-mail"></i>
                <span>Email:</span>
                <strong>{email}</strong>
              </li>
              <li>
                <i className="ti ti-phone"></i>
                <span>Phone:</span>
                <strong>{phone || 'Not specified'}</strong>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: Edit Form & Password */}
        <div className="profile-main">
          {/* Edit Profile */}
          <div className="card">
            <div className="card-header">
              <h2>
                <i className="ti ti-edit"></i> Edit Profile Information
              </h2>
            </div>
            <form onSubmit={handleProfileSave}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <div className="input-wrap">
                    <i className="ti ti-user"></i>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Username *</label>
                  <div className="input-wrap">
                    <i className="ti ti-id"></i>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <div className="input-wrap">
                    <i className="ti ti-mail"></i>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="input-wrap">
                    <i className="ti ti-phone"></i>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Institution / Organization</label>
                  <div className="input-wrap">
                    <i className="ti ti-building"></i>
                    <input
                      type="text"
                      value={institution}
                      onChange={e => setInstitution(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: '1.25rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    backgroundColor: profileSaved ? 'var(--success)' : undefined,
                  }}
                  disabled={savingProfile}
                >
                  {profileSaved ? (
                    <>
                      <i className="ti ti-check"></i> Saved!
                    </>
                  ) : savingProfile ? (
                    <>
                      <span className="spinner"></span> Saving...
                    </>
                  ) : (
                    <>
                      <i className="ti ti-device-floppy"></i> Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleResetProfile}
                >
                  <i className="ti ti-rotate"></i> Reset
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="card">
            <div className="card-header">
              <h2>
                <i className="ti ti-key"></i> Security &amp; Password
              </h2>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Current Password</label>
                  <div className="input-wrap">
                    <i className="ti ti-lock"></i>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={curPass}
                      onChange={e => setCurPass(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-wrap">
                    <i className="ti ti-lock"></i>
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="input-wrap">
                    <i className="ti ti-lock-check"></i>
                    <input
                      type="password"
                      placeholder="Re-enter new password"
                      value={confPass}
                      onChange={e => setConfPass(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {passError && (
                <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ti ti-alert-circle"></i> {passError}
                </div>
              )}

              {passSuccess && (
                <div style={{ color: 'var(--success)', fontSize: '0.85rem', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ti ti-check-circle"></i> Password updated successfully!
                </div>
              )}

              <div className="form-actions" style={{ marginTop: '1.25rem' }}>
                <button type="submit" className="btn btn-primary">
                  <i className="ti ti-lock"></i> Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="card danger-zone">
            <div className="card-header">
              <h2 style={{ color: 'var(--danger)' }}>
                <i className="ti ti-alert-triangle" style={{ color: 'var(--danger)' }}></i> Danger Zone
              </h2>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Logging out ends your current administrative session. You can clear temporary cache or switch users anytime.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-ghost"
                style={{ color: 'var(--danger)', borderColor: 'rgba(239,35,60,.3)' }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to log out of CertifyChain?')) {
                    logout();
                  }
                }}
              >
                <i className="ti ti-logout"></i> Logout of Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
