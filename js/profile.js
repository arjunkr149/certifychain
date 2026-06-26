/* =============================================
   profile.js — Profile Page — Fully Working
   CertifyChain
   ============================================= */

let storedPassword = localStorage.getItem('cc_password') || 'admin123';

window.addEventListener('DOMContentLoaded', () => {
  loadProfileData();
});

// ---- LOAD user data into all fields ----
function loadProfileData() {
  const user = JSON.parse(localStorage.getItem('cc_user') || '{}');

  const name        = user.name        || 'Arjun Kumar';
  const username    = user.username    || 'admin';
  const email       = user.email       || 'aksir648@gmail.com';
  const phone       = user.phone       || '+91-6386416463';
  const institution = user.institution || 'GNIOT, Greater Noida';
  const initial     = name.charAt(0).toUpperCase();

  // Profile card (display only)
  setText('profile-avatar-big',        initial);
  setText('profile-display-name',      name);
  setText('profile-institution-text',  institution);
  setText('info-username',             username);
  setText('info-email',                email);

  // Sidebar + topbar
  setText('sidebar-avatar',   initial);
  setText('sidebar-username', name);
  setText('topbar-username',  '@' + username);

  // Form fields
  setInput('edit-name',        name);
  setInput('edit-username',    username);
  setInput('edit-email',       email);
  setInput('edit-phone',       phone);
  setInput('edit-institution', institution);
}

// ---- SAVE PROFILE ----
function saveProfile() {
  const name        = getInput('edit-name');
  const username    = getInput('edit-username');
  const email       = getInput('edit-email');
  const phone       = getInput('edit-phone');
  const institution = getInput('edit-institution');

  // Clear previous messages
  clearMsg('profile-save-msg');

  // Validation
  if (!name)  { showFieldErr('edit-name', 'Name cannot be empty'); return; }
  if (!username) { showFieldErr('edit-username', 'Username cannot be empty'); return; }
  if (!email) { showFieldErr('edit-email', 'Email cannot be empty'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldErr('edit-email', 'Enter a valid email address'); return;
  }

  // Save
  const existing = JSON.parse(localStorage.getItem('cc_user') || '{}');
  const updated  = { ...existing, name, username, email, phone, institution };
  localStorage.setItem('cc_user', JSON.stringify(updated));

  // Update all UI
  loadProfileData();

  // Show success under the button
  showMsg('profile-save-msg', '✓ Profile saved successfully!', 'success');
  showToast('Profile updated successfully!', 'success');

  // Animate save button
  const btn = document.getElementById('save-profile-btn');
  if (btn) {
    btn.innerHTML = '<i class="ti ti-check"></i> Saved!';
    btn.style.background = 'var(--success)';
    setTimeout(() => {
      btn.innerHTML = '<i class="ti ti-device-floppy"></i> Save Changes';
      btn.style.background = '';
    }, 2000);
  }
}

// ---- RESET FORM to saved values ----
function resetProfileForm() {
  loadProfileData();
  clearMsg('profile-save-msg');
  showToast('Form reset to saved values', 'success');
}

// ---- CHANGE PASSWORD ----
function changePassword() {
  const curPass  = getInput('cur-pass');
  const newPass  = getInput('new-pass');
  const confPass = getInput('conf-pass');

  clearMsg('password-msg');

  if (!curPass)  { showFieldErr('cur-pass',  'Enter your current password'); return; }
  if (!newPass)  { showFieldErr('new-pass',  'Enter a new password'); return; }
  if (!confPass) { showFieldErr('conf-pass', 'Please confirm new password'); return; }

  if (curPass !== storedPassword) {
    showFieldErr('cur-pass', 'Incorrect current password');
    showToast('Current password is wrong', 'error');
    return;
  }
  if (newPass.length < 6) {
    showFieldErr('new-pass', 'Password must be at least 6 characters');
    return;
  }
  if (newPass !== confPass) {
    showFieldErr('conf-pass', 'Passwords do not match');
    showToast('Passwords do not match', 'error');
    return;
  }

  // Save
  storedPassword = newPass;
  localStorage.setItem('cc_password', newPass);

  // Clear fields
  setInput('cur-pass',  '');
  setInput('new-pass',  '');
  setInput('conf-pass', '');

  showMsg('password-msg', '✓ Password updated successfully!', 'success');
  showToast('Password updated!', 'success');
}

// ---- DELETE ACCOUNT ----
function confirmDelete() {
  if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '../index.html';
  }
}

// ============ HELPERS ============
function getInput(id) {
  return (document.getElementById(id)?.value || '').trim();
}
function setInput(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || '';
}
function clearMsg(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = '';
}
function showMsg(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  const color = type === 'success' ? 'var(--success)' : 'var(--danger)';
  el.innerHTML = `<div style="color:${color};font-size:.85rem;display:flex;align-items:center;gap:6px">
    <i class="ti ti-${type === 'success' ? 'check-circle' : 'alert-circle'}"></i> ${text}
  </div>`;
}
function showFieldErr(id, msg) {
  const input = document.getElementById(id);
  if (!input) return;
  input.style.borderColor = 'var(--danger)';
  input.style.boxShadow   = '0 0 0 3px rgba(239,35,60,.12)';

  // Remove old error
  const wrap = input.closest('.form-group');
  wrap?.querySelectorAll('.field-err').forEach(e => e.remove());

  const tip = document.createElement('div');
  tip.className = 'field-err';
  tip.innerHTML = `<i class="ti ti-alert-circle"></i> ${msg}`;
  input.parentElement.after(tip);

  input.addEventListener('input', () => {
    input.style.borderColor = '';
    input.style.boxShadow   = '';
    tip.remove();
  }, { once: true });

  input.focus();
  showToast(msg, 'error');
}
