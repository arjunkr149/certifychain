// ---- APPLY SAVED THEME (all pages) ----
(function() {
  const t = localStorage.getItem('cc_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
})();

/* =============================================
   common.js — Shared Utilities
   CertifyChain
   ============================================= */

// ---- DEMO CERTIFICATE DATABASE ----
const CERT_DB = [
  { no:'CERT-2024-001234', student:'Priya Sharma',  studentId:'STU-2024-0011', course:'B.Tech Computer Science',           institution:'GNIOT, Greater Noida', date:'2024-05-15', grade:'8.9 / 10', notes:'First Class with Distinction', hash:'a3f1c9d2e8b74f5a', prevHash:'0000000000000000', valid:true },
  { no:'CERT-2024-001235', student:'Rohit Verma',   studentId:'STU-2024-0022', course:'MBA Finance',                       institution:'GNIOT, Greater Noida', date:'2024-05-16', grade:'7.8 / 10', notes:'First Class',                  hash:'b4e2f8c1d9a35678', prevHash:'a3f1c9d2e8b74f5a', valid:true },
  { no:'CERT-2024-001236', student:'Ananya Singh',  studentId:'STU-2024-0033', course:'M.Tech Artificial Intelligence & ML',institution:'GNIOT, Greater Noida', date:'2024-05-17', grade:'9.2 / 10', notes:'Gold Medal · University Topper', hash:'c5f3a2b1e0d47890', prevHash:'b4e2f8c1d9a35678', valid:true },
  { no:'CERT-2024-001237', student:'Vikram Patel',  studentId:'STU-2024-0044', course:'BCA Information Technology',        institution:'GNIOT, Greater Noida', date:'2024-05-18', grade:'8.1 / 10', notes:'First Class',                  hash:'d6a4c3b2f1e89012', prevHash:'c5f3a2b1e0d47890', valid:true },
  { no:'CERT-2025-000042', student:'Arjun Kumar',   studentId:'STU6612f44c529f81712518220', course:'AI-ML Virtual Internship (10 Weeks)', institution:'AICTE-EduSkills / Galgotias University', date:'2025-09-30', grade:'B (Good) · 60-69', notes:'Google for Developers · India Edu Program · National Internship Portal', hash:'e7b5d4c3a2f19034', prevHash:'d6a4c3b2f1e89012', valid:true },
];

let sessionCerts = JSON.parse(sessionStorage.getItem('cc_session_certs') || '[]');

function getAllCerts() { return [...CERT_DB, ...sessionCerts]; }

function saveSessionCert(cert) {
  sessionCerts.push(cert);
  sessionStorage.setItem('cc_session_certs', JSON.stringify(sessionCerts));
}

// ---- AUTH ----
function checkAuth() {
  const token = localStorage.getItem('cc_token');
  if (!token) { window.location.href = 'login.html'; return null; }
  return JSON.parse(localStorage.getItem('cc_user') || '{}');
}

function logout() {
  localStorage.removeItem('cc_token');
  sessionStorage.removeItem('cc_session_certs');
  window.location.href = 'login.html';
}

function populateUserUI(user) {
  if (!user) return;
  const initial = (user.name || user.username || 'A').charAt(0).toUpperCase();
  setText('sidebar-avatar',   initial);
  setText('sidebar-username', user.name || user.username);
  setText('topbar-username',  '@' + (user.username || 'admin'));
}

// ---- TOAST ----
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const icon  = document.getElementById('toast-icon');
  const msgEl = document.getElementById('toast-msg');
  if (!toast) return;
  msgEl.textContent = msg;
  icon.className = type === 'success' ? 'ti ti-check-circle' : 'ti ti-alert-circle';
  toast.className = `toast ${type} show`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.className = 'toast'; }, 3500);
}

// ---- SIDEBAR TOGGLE ----
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

// ---- HELPERS ----
function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}
function randomHash(bytes = 8) {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes))).map(b => b.toString(16).padStart(2,'0')).join('');
}
function formatDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || '';
}

// ---- AI ENDPOINT ----
// Always use same origin + /api/ai
// server.js must be running on port 3000
// Open http://localhost:3000 (NOT 127.0.0.1:3002 or any other port)
function getAIEndpoint() {
  if (window.location.protocol === 'file:') return null;
  // Use same host:port as current page — works on any port
  return window.location.origin + '/api/ai';
}

// ---- AI CALL (text only) ----
async function callAI(userMessage, systemPrompt) {
  const endpoint = getAIEndpoint();

  const defaultSystem = `You are CertifyChain AI, an expert assistant for a blockchain-based certificate verification system.
The platform uses SHA-256 hash chaining. Help verify certificates, detect fraud, explain blockchain.
Demo certificates: CERT-2024-001234 (Priya Sharma, B.Tech CS), CERT-2024-001235 (Rohit Verma, MBA),
CERT-2024-001236 (Ananya Singh, M.Tech AI), CERT-2024-001237 (Vikram Patel, BCA),
CERT-2025-000042 (Arjun Kumar, AI-ML Internship, AICTE-EduSkills/Galgotias).
Be concise and professional. No markdown symbols.`;

  if (!endpoint) {
    return 'AI requires the local server. Run: node server.js — then open http://localhost:3000';
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt || defaultSystem,
        messages: [{ role: 'user', content: userMessage }]
      })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    return data.content?.[0]?.text || 'No response from AI.';
  } catch (err) {
    console.error('AI Error:', err);
    console.error('AI Error:', err);
    if (err.message.includes('fetch')) {
      return 'Cannot reach server. Make sure node server.js is running, then open http://localhost:3000 (not any other port).';
    }
    return 'AI Error: ' + err.message;
  }
}

// ---- AI CALL (with image) ----
async function callAIWithImage(base64Data, mediaType, fileName, systemPrompt) {
  const endpoint = getAIEndpoint();
  if (!endpoint) return null;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
          { type: 'text',  text: `Analyze this certificate/document: "${fileName}". Extract all visible information and assess authenticity.` }
        ]
      }]
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data.content?.[0]?.text || '';
}

// ---- INIT ----
window.addEventListener('DOMContentLoaded', () => {
  const user = checkAuth();
  if (user) populateUserUI(user);
});

// ---- PORT WARNING — show if not on port 3000 ----
window.addEventListener('DOMContentLoaded', function() {
  const port = window.location.port;
  if (window.location.protocol !== 'file:' && port && port !== '3000') {
    const warn = document.createElement('div');
    warn.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#ffd166;color:#3d2800;padding:.6rem 1rem;font-size:.85rem;text-align:center;font-family:sans-serif;display:flex;align-items:center;justify-content:center;gap:10px;';
    warn.innerHTML = '<strong>⚠️ Wrong Port!</strong> Server runs on port 3000. Open <a href="http://localhost:3000" style="color:#3d2800;font-weight:700;text-decoration:underline">http://localhost:3000</a> for AI to work. &nbsp;<button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;font-size:1rem;color:#3d2800">✕</button>';
    document.body.prepend(warn);
  }
});
