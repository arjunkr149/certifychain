/* =============================================
   issue.js — Certificate Issuance Logic
   CertifyChain — Issue Certificate Page
   ============================================= */

// ---- SET TODAY'S DATE AS DEFAULT ----
window.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('f-date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
  renderIssuedTable();
});

// ---- ISSUE FORM SUBMIT ----
const issueForm = document.getElementById('issue-form');
if (issueForm) {
  issueForm.addEventListener('submit', (e) => {
    e.preventDefault();
    issueCertificate();
  });
}

function issueCertificate() {
  const student     = document.getElementById('f-student')?.value.trim();
  const studentId   = document.getElementById('f-student-id')?.value.trim();
  const course      = document.getElementById('f-course')?.value.trim();
  const institution = document.getElementById('f-institution')?.value.trim();
  const date        = document.getElementById('f-date')?.value;
  const grade       = document.getElementById('f-grade')?.value.trim();
  const notes       = document.getElementById('f-notes')?.value.trim();

  const resultEl  = document.getElementById('issue-result');
  const loadingEl = document.getElementById('issue-loading');

  if (!student || !course || !institution || !date) {
    resultEl.innerHTML = `
      <div style="color:var(--danger);display:flex;align-items:center;gap:6px;font-size:.87rem;margin-top:.75rem">
        <i class="ti ti-alert-circle"></i> Please fill in all required fields (marked with *).
      </div>`;
    return;
  }

  // Show loading
  loadingEl.style.display = 'flex';
  resultEl.innerHTML = '';

  setTimeout(() => {
    loadingEl.style.display = 'none';

    // Generate unique cert number
    const year  = new Date().getFullYear();
    const num   = String(Math.floor(Math.random() * 9000) + 1000);
    const certNo = `CERT-${year}-${num.padStart(6, '0')}`;

    // Generate hash chain
    const allCerts  = getAllCerts();
    const prevHash  = allCerts.length > 0 ? allCerts[allCerts.length - 1].hash : '0000000000000000';
    const hash      = randomHash(8);

    // Build cert object
    const newCert = { no: certNo, student, studentId, course, institution, date, grade, notes, hash, prevHash, valid: true };

    // Save to session
    saveSessionCert(newCert);

    // Show success
    resultEl.innerHTML = `
      <div class="result-card valid" style="margin-top:.75rem">
        <div class="result-header">
          <div class="result-icon" style="background:rgba(6,214,160,.15);color:var(--success)">
            <i class="ti ti-check"></i>
          </div>
          <div>
            <h3 style="color:var(--success)">Certificate Issued Successfully!</h3>
            <p>Certificate No: <strong style="font-family:monospace">${certNo}</strong> — recorded on blockchain</p>
          </div>
        </div>
      </div>`;

    // Show certificate preview with QR
    showCertPreview(newCert);

    // Update issued table
    renderIssuedTable();

    showToast('Certificate issued & QR code generated!', 'success');
  }, 1600);
}

// ---- SHOW CERTIFICATE PREVIEW + QR ----
function showCertPreview(cert) {
  const previewCard = document.getElementById('cert-preview-card');
  if (!previewCard) return;

  previewCard.style.display = 'block';
  previewCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Fill cert paper
  document.getElementById('cp-student').textContent     = cert.student;
  document.getElementById('cp-course').textContent      = cert.course;
  document.getElementById('cp-institution').textContent = cert.institution;
  document.getElementById('cp-date').textContent        = formatDate(cert.date);
  document.getElementById('cp-grade').textContent       = cert.grade || 'N/A';
  document.getElementById('cp-no').textContent          = cert.no;
  document.getElementById('cp-hash').textContent        = `Hash: ${cert.hash}`;
  document.getElementById('qr-cert-no').textContent     = cert.no;

  // Generate QR code
  const qrOutput = document.getElementById('qr-output');
  qrOutput.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.style.borderRadius = '8px';
  qrOutput.appendChild(canvas);

  // QR encodes: cert number + verify URL
  const qrData = `${cert.no}|${cert.student}|${cert.course}`;
  QRCode.toCanvas(canvas, qrData, {
    width: 160,
    color: { dark: '#000000', light: '#ffffff' }
  }, (err) => {
    if (err) console.error('QR Error:', err);
  });
}

// ---- CLEAR FORM ----
function clearForm() {
  document.getElementById('issue-form')?.reset();
  document.getElementById('f-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('issue-result').innerHTML = '';
  document.getElementById('issue-loading').style.display = 'none';
  document.getElementById('cert-preview-card').style.display = 'none';
}

// ---- RENDER ISSUED TABLE ----
function renderIssuedTable() {
  const tbody = document.getElementById('issued-certs-body');
  if (!tbody) return;

  const certs = [...sessionCerts].reverse();
  if (certs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:1.5rem">No certificates issued in this session yet</td></tr>`;
    return;
  }

  tbody.innerHTML = certs.map(c => `
    <tr>
      <td style="font-family:monospace;font-size:.8rem;color:var(--accent)">${c.no}</td>
      <td>${c.student}</td>
      <td style="color:var(--muted);font-size:.84rem">${c.course}</td>
      <td style="color:var(--muted);font-size:.84rem">${c.institution}</td>
      <td style="color:var(--muted);font-size:.82rem">${formatDate(c.date)}</td>
      <td style="font-family:monospace;font-size:.72rem;color:var(--muted)">${c.hash}</td>
    </tr>`).join('');
}
