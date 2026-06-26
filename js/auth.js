/* =============================================
   auth.js — Login & Signup Logic
   CertifyChain
   ============================================= */

// ---- AUTO-REDIRECT IF ALREADY LOGGED IN ----
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('cc_token');
  if (token) {
    window.location.href = 'dashboard.html';
  }
});

// ---- SWITCH BETWEEN LOGIN / SIGNUP ----
function switchMode(mode) {
  const loginForm  = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const title      = document.getElementById('auth-title');
  const sub        = document.getElementById('auth-sub');
  const errBox     = document.getElementById('auth-error');

  errBox.classList.remove('show');
  errBox.textContent = '';

  if (mode === 'signup') {
    loginForm.style.display  = 'none';
    signupForm.style.display = 'flex';
    title.textContent = 'Create Account';
    sub.textContent   = 'Register as an admin user';
  } else {
    loginForm.style.display  = 'flex';
    signupForm.style.display = 'none';
    title.textContent = 'Welcome Back';
    sub.textContent   = 'Login to access the admin dashboard';
  }
}

// ---- SHOW ERROR ----
function showError(msg) {
  const errBox = document.getElementById('auth-error');
  errBox.textContent = msg;
  errBox.classList.add('show');
}

// ---- LOGIN FORM SUBMIT ----
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
      showError('Please fill in all fields.');
      return;
    }

    // Demo credential check
    if (username === 'admin' && password === 'admin123') {
      const user = { username: 'admin', name: 'Arjun Kumar', email: 'aksir648@gmail.com', institution: 'GNIOT, Greater Noida' };
      localStorage.setItem('cc_token', 'demo-token-' + Date.now());
      localStorage.setItem('cc_user', JSON.stringify(user));
      window.location.href = 'dashboard.html';
    } else {
      showError('Invalid username or password. Use admin / admin123 for demo.');
    }
  });
}

// ---- SIGNUP FORM SUBMIT ----
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name        = document.getElementById('signup-name').value.trim();
    const email       = document.getElementById('signup-email').value.trim();
    const username    = document.getElementById('signup-username').value.trim();
    const password    = document.getElementById('signup-password').value;
    const institution = document.getElementById('signup-institution').value.trim();

    if (!name || !email || !username || !password) {
      showError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      showError('Password must be at least 6 characters long.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      showError('Please enter a valid email address.');
      return;
    }

    const user = { username, name, email, institution: institution || 'Not specified' };
    localStorage.setItem('cc_token', 'demo-token-' + Date.now());
    localStorage.setItem('cc_user', JSON.stringify(user));
    window.location.href = 'dashboard.html';
  });
}
