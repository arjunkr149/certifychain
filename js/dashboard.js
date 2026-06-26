/* =============================================
   dashboard.js — Dashboard Overview Logic
   CertifyChain
   ============================================= */

window.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('cc_user') || '{}');

  // ---- WELCOME MESSAGE ----
  const welcomeEl = document.getElementById('welcome-msg');
  if (welcomeEl) {
    welcomeEl.textContent = `${getGreeting()}, ${user.name || user.username || 'Admin'} 👋`;
  }

  // ---- POPULATE RECENT CERTS TABLE ----
  loadRecentCerts();
});

// ---- RECENT VERIFICATIONS TABLE ----
function loadRecentCerts() {
  const tbody = document.getElementById('recent-certs-body');
  if (!tbody) return;

  const timeAgo = ['2 min ago', '14 min ago', '1 hr ago', '3 hrs ago'];
  const certs   = getAllCerts().slice(0, 4);

  tbody.innerHTML = certs.map((c, i) => `
    <tr>
      <td>
        <span style="font-family:monospace;font-size:.82rem;color:var(--accent)">${c.no}</span>
      </td>
      <td>${c.student}</td>
      <td style="color:var(--muted);font-size:.84rem">${c.course}</td>
      <td style="color:var(--muted);font-size:.82rem">${timeAgo[i] || 'Earlier'}</td>
      <td>
        <span class="status-badge status-valid">
          <i class="ti ti-check" style="font-size:.7rem"></i> Verified
        </span>
      </td>
      <td>
        <a href="verify.html" class="btn btn-ghost btn-sm">
          <i class="ti ti-external-link"></i> Verify
        </a>
      </td>
    </tr>
  `).join('');
}
