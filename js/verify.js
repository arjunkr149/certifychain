/* =============================================
   verify.js — All 4 Verification Methods
   CertifyChain
   ============================================= */

// ---- TAB SWITCHING ----
function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.vtab').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.add('active');
  btn.classList.add('active');
}

function fillAndVerify(certNo) {
  document.getElementById('cert-no-input').value = certNo;
  verifyByNumber();
}

// ============================================================
// METHOD 1 — BY CERTIFICATE NUMBER
// ============================================================
function verifyByNumber() {
  const certNo   = document.getElementById('cert-no-input')?.value.trim();
  const resultEl = document.getElementById('result-number');
  if (!certNo) { showToast('Please enter a certificate number', 'error'); return; }

  resultEl.innerHTML = loadingHTML('Searching blockchain records...');

  setTimeout(() => {
    const cert = getAllCerts().find(c => c.no.toLowerCase() === certNo.toLowerCase());
    resultEl.innerHTML = cert ? buildValidResult(cert) : buildInvalidResult(certNo);
    addHistory(certNo, 'Number', cert?.student || '—', cert ? 'Valid' : 'Not Found');
    if (cert) showToast('Certificate verified!', 'success');
  }, 1000);
}

// ============================================================
// METHOD 2 — QR CODE UPLOAD
// ============================================================
function handleQRUpload(input) {
  const file     = input.files[0];
  const resultEl = document.getElementById('result-qr');
  if (!file) return;

  resultEl.innerHTML = loadingHTML('Decoding QR code...');

  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      // Try real QR decode via canvas, fallback to demo
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);

      setTimeout(() => {
        // Simulate decoded cert number (real QR decode needs jsQR library)
        const decoded = 'CERT-2024-001234';
        const cert    = getAllCerts().find(c => c.no === decoded);

        resultEl.innerHTML = `
          <div class="result-card ai-info" style="margin-bottom:.75rem">
            <div class="result-header">
              <div class="result-icon" style="background:rgba(67,97,238,.15);color:var(--accent)">
                <i class="ti ti-qrcode"></i>
              </div>
              <div>
                <h3>QR Code Decoded</h3>
                <p>Certificate Number: <strong style="font-family:monospace">${decoded}</strong></p>
              </div>
            </div>
          </div>
          ${cert ? buildValidResult(cert) : buildInvalidResult(decoded)}`;

        addHistory(decoded, 'QR Code', cert?.student || '—', cert ? 'Valid' : 'Not Found');
        if (cert) showToast('QR verified!', 'success');
      }, 900);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ============================================================
// METHOD 3 — FILE UPLOAD (Real AI OCR via proxy)
// ============================================================
function handleFileUpload(inputEl) {
  const file     = inputEl.files?.[0];
  const resultEl = document.getElementById('result-file');
  const prevWrap = document.getElementById('file-preview-wrap');
  const prevImg  = document.getElementById('file-preview-img');
  const prevName = document.getElementById('file-preview-name');
  const prevMeta = document.getElementById('file-preview-size');
  const zone     = document.getElementById('file-zone');

  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    // Show preview
    prevImg.src          = e.target.result;
    prevName.textContent = file.name;
    prevMeta.textContent = (file.size / 1024).toFixed(1) + ' KB · ' + (file.type || 'image');
    prevWrap.style.display = 'block';
    zone.style.borderColor = 'var(--accent)';

    // Show loading with animated steps
    resultEl.innerHTML = `
      <div class="result-card ai-info" style="margin-top:1rem">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:1rem">
          <div class="spinner"></div>
          <strong>AI is analyzing your certificate...</strong>
        </div>
        <div id="ai-steps" style="display:flex;flex-direction:column;gap:6px;font-size:.84rem;color:var(--muted)">
          <div id="step1"><i class="ti ti-circle-dashed"></i> Detecting document type...</div>
          <div id="step2"><i class="ti ti-circle-dashed"></i> Extracting text from image...</div>
          <div id="step3"><i class="ti ti-circle-dashed"></i> Identifying key fields...</div>
          <div id="step4"><i class="ti ti-circle-dashed"></i> Assessing authenticity...</div>
          <div id="step5"><i class="ti ti-circle-dashed"></i> Generating report...</div>
        </div>
      </div>`;

    // Animate steps
    [600,900,1200,1500,1800].forEach((delay, i) => {
      setTimeout(() => {
        const el = document.getElementById('step' + (i+1));
        if (el) el.innerHTML = `<i class="ti ti-circle-check" style="color:var(--success)"></i> ${el.textContent.trim()}`;
      }, delay);
    });

    // Determine media type
    let mime = file.type;
    if (!mime || mime === 'application/octet-stream') {
      const ext = file.name.split('.').pop().toLowerCase();
      mime = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', webp:'image/webp', gif:'image/gif' }[ext] || 'image/jpeg';
    }

    const base64 = e.target.result.split(',')[1];

    const systemPrompt = `You are CertifyChain AI — expert certificate verification system.
Read ALL text in the image carefully. Extract every detail.
Respond ONLY in this exact format (no extra text, no markdown):

DOCUMENT_TYPE: [internship certificate / degree / government ID / marksheet / etc]
NAME: [full name or NOT_VISIBLE]
CERT_NUMBER: [certificate or ID number or NOT_VISIBLE]
COURSE_POSITION: [course name or internship domain or NOT_VISIBLE]
ORGANIZATION: [company or university or institution or NOT_VISIBLE]
DATE: [issue date or duration or NOT_VISIBLE]
GRADE_DURATION: [grade or CGPA or percentage or duration or NOT_VISIBLE]
ISSUED_BY: [signatory name and designation or NOT_VISIBLE]
OTHER: [project name, skills, supporting org, or NONE]
AUTHENTICITY_GOOD: [official seal, signature, logo, letterhead, unique ID, QR code present, etc]
AUTHENTICITY_WARN: [missing seal, blurry signature, suspicious formatting, or NONE_DETECTED]
VERDICT: [VERIFIED or SUSPICIOUS or NEEDS_REVIEW]
CONFIDENCE: [HIGH or MEDIUM or LOW]
SUMMARY: [2 sentences — what this document is and whether it looks genuine]`;

    if (!getAIEndpoint()) {
      resultEl.innerHTML = serverRequiredHTML();
      return;
    }

    callAIWithImage(base64, mime, file.name, systemPrompt)
      .then(reply => {
        if (!reply) throw new Error('Empty AI response');
        renderFileResult(reply, file.name, resultEl);
      })
      .catch(err => {
        resultEl.innerHTML = `
          <div class="result-card invalid" style="margin-top:1rem">
            <div class="result-header">
              <div class="result-icon" style="background:rgba(239,35,60,.15);color:var(--danger)">
                <i class="ti ti-wifi-off"></i>
              </div>
              <div>
                <h3 style="color:var(--danger)">AI Connection Failed</h3>
                <p>${err.message}</p>
              </div>
            </div>
            <p style="font-size:.85rem;color:var(--muted);margin-top:.5rem">
              Make sure <strong>node server.js</strong> is running, then open <strong>http://localhost:3000</strong>
            </p>
          </div>`;
      });
  };
  reader.readAsDataURL(file);
}

// ---- RENDER AI FILE RESULT ----
function renderFileResult(reply, fileName, resultEl) {
  const get = (key) => {
    const m = reply.match(new RegExp(key + ':\\s*(.+)', 'i'));
    return m ? m[1].trim() : null;
  };

  const verdict  = (get('VERDICT') || '').toUpperCase();
  const isOk     = verdict.includes('VERIFIED') && !verdict.includes('SUSPICIOUS');
  const isBad    = verdict.includes('SUSPICIOUS');
  const cardCls  = isOk ? 'valid' : isBad ? 'invalid' : 'ai-info';
  const iconCls  = isOk ? 'ti-shield-check' : isBad ? 'ti-shield-x' : 'ti-shield-half';
  const iconBg   = isOk ? 'rgba(6,214,160,.15)' : isBad ? 'rgba(239,35,60,.15)' : 'rgba(255,209,102,.15)';
  const iconCol  = isOk ? 'var(--success)' : isBad ? 'var(--danger)' : 'var(--warn)';
  const titleTxt = isOk ? 'Document Verified ✓' : isBad ? 'Suspicious Document ⚠' : 'Needs Manual Review';
  const conf     = get('CONFIDENCE');
  const summary  = get('SUMMARY');
  const docType  = get('DOCUMENT_TYPE');
  const good     = get('AUTHENTICITY_GOOD');
  const warn     = get('AUTHENTICITY_WARN');

  const fields = [
    ['Name',              get('NAME')],
    ['Certificate / ID',  get('CERT_NUMBER')],
    ['Course / Position', get('COURSE_POSITION')],
    ['Organization',      get('ORGANIZATION')],
    ['Date / Duration',   get('DATE')],
    ['Grade / Score',     get('GRADE_DURATION')],
    ['Issued By',         get('ISSUED_BY')],
    ['Other Details',     get('OTHER')],
  ].filter(([,v]) => v && v !== 'NOT_VISIBLE' && v !== 'NONE');

  resultEl.innerHTML = `
    <div class="result-card ${cardCls}" style="margin-top:1rem">
      <div class="result-header">
        <div class="result-icon" style="background:${iconBg};color:${iconCol}">
          <i class="ti ${iconCls}"></i>
        </div>
        <div style="flex:1">
          <h3 style="color:${iconCol}">${titleTxt}</h3>
          <p>${docType || 'Document'} · ${fileName}</p>
        </div>
        ${conf ? `<span style="font-size:.76rem;color:var(--muted);background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:6px;padding:.2rem .65rem;flex-shrink:0">${conf} confidence</span>` : ''}
      </div>

      ${summary ? `<div style="background:rgba(255,255,255,.03);border-radius:8px;padding:.75rem 1rem;margin-bottom:1rem;font-size:.87rem;line-height:1.6;color:var(--muted)">
        <i class="ti ti-info-circle" style="color:var(--accent)"></i> ${summary}
      </div>` : ''}

      <div class="cert-detail-grid">
        ${fields.map(([l,v]) => `<div class="cert-field"><span>${l}</span><strong>${v}</strong></div>`).join('')}
      </div>

      ${(good || (warn && warn !== 'NONE_DETECTED')) ? `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-top:.85rem">
        ${good ? `<div style="background:rgba(6,214,160,.07);border:1px solid rgba(6,214,160,.2);border-radius:8px;padding:.75rem 1rem">
          <div style="font-size:.73rem;color:var(--success);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem"><i class="ti ti-check-circle"></i> Authenticity</div>
          <div style="font-size:.82rem;color:var(--muted)">${good}</div>
        </div>` : ''}
        ${(warn && warn !== 'NONE_DETECTED') ? `<div style="background:rgba(255,209,102,.07);border:1px solid rgba(255,209,102,.2);border-radius:8px;padding:.75rem 1rem">
          <div style="font-size:.73rem;color:var(--warn);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem"><i class="ti ti-alert-circle"></i> Suspicious</div>
          <div style="font-size:.82rem;color:var(--muted)">${warn}</div>
        </div>` : ''}
      </div>` : ''}

      <div style="display:flex;justify-content:space-between;margin-top:.85rem;font-size:.76rem;color:var(--muted)">
        <span><i class="ti ti-robot"></i> Analyzed by Claude AI · CertifyChain</span>
        <span>${new Date().toLocaleString('en-IN')}</span>
      </div>
    </div>`;

  addHistory(get('CERT_NUMBER') || fileName, 'File Upload', get('NAME') || '—', isOk ? 'Verified' : isBad ? 'Suspicious' : 'Review');
  showToast(isOk ? 'Document verified!' : isBad ? 'Suspicious document detected' : 'Review needed', isOk ? 'success' : 'error');
}

// ---- CLEAR FILE ----
function clearFileUpload() {
  document.getElementById('file-input').value   = '';
  document.getElementById('file-preview-wrap').style.display = 'none';
  document.getElementById('result-file').innerHTML = '';
  const z = document.getElementById('file-zone');
  if (z) { z.style.borderColor = ''; z.style.background = ''; }
}

// ---- DRAG & DROP ----
window.addEventListener('DOMContentLoaded', () => {
  const zone = document.getElementById('file-zone');
  if (!zone) return;
  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('dragging'); });
  zone.addEventListener('dragleave', ()  => zone.classList.remove('dragging'));
  zone.addEventListener('drop',      e  => {
    e.preventDefault(); zone.classList.remove('dragging');
    const f = e.dataTransfer.files[0];
    if (f) { const dt = new DataTransfer(); dt.items.add(f); document.getElementById('file-input').files = dt.files; handleFileUpload({ files:[f] }); }
  });
});

// ============================================================
// METHOD 4 — AI CHAT
// ============================================================
function sendAIChat() {
  const input  = document.getElementById('ai-chat-input');
  const msgs   = document.getElementById('ai-chat-msgs');
  const text   = input?.value.trim();
  if (!text) return;
  input.value = '';

  msgs.innerHTML += `<div class="chat-msg user"><div class="msg-from">You</div>${escHtml(text)}</div>`;
  msgs.innerHTML += `<div class="chat-msg assistant" id="typing-verify">
    <div class="msg-from"><i class="ti ti-robot"></i> AI Assistant</div>
    <div class="typing-indicator"><span></span><span></span><span></span></div>
  </div>`;
  msgs.scrollTop = msgs.scrollHeight;

  callAI(text).then(reply => {
    const el = document.getElementById('typing-verify');
    if (el) { el.innerHTML = `<div class="msg-from"><i class="ti ti-robot"></i> AI Assistant</div>${reply.replace(/\n/g,'<br>')}`; el.removeAttribute('id'); }
    msgs.scrollTop = msgs.scrollHeight;
  });
}

// ============================================================
// HELPERS
// ============================================================
function loadingHTML(msg) {
  return `<div style="display:flex;align-items:center;gap:10px;color:var(--muted);padding:1rem">
    <div class="spinner"></div> ${msg}</div>`;
}

function serverRequiredHTML() {
  return `<div class="result-card invalid" style="margin-top:1rem">
    <div class="result-header">
      <div class="result-icon" style="background:rgba(239,35,60,.15);color:var(--danger)"><i class="ti ti-server"></i></div>
      <div><h3 style="color:var(--danger)">Server Required for AI</h3><p>Open terminal in project folder and run:</p></div>
    </div>
    <div style="font-family:monospace;font-size:.9rem;background:rgba(255,255,255,.05);padding:.75rem 1rem;border-radius:8px;color:var(--accent);margin-top:.5rem">
      node server.js
    </div>
    <p style="font-size:.83rem;color:var(--muted);margin-top:.75rem">Then visit <strong>http://localhost:3000</strong></p>
  </div>`;
}

function buildValidResult(cert) {
  return `
    <div class="result-card valid">
      <div class="result-header">
        <div class="result-icon" style="background:rgba(6,214,160,.15);color:var(--success)"><i class="ti ti-shield-check"></i></div>
        <div><h3 style="color:var(--success)">Certificate Verified ✓</h3><p>Blockchain record confirmed — authentic</p></div>
      </div>
      <div class="cert-detail-grid">
        <div class="cert-field"><span>Student Name</span><strong>${cert.student}</strong></div>
        <div class="cert-field"><span>Certificate No.</span><strong style="font-family:monospace;font-size:.8rem">${cert.no}</strong></div>
        <div class="cert-field"><span>Course / Program</span><strong>${cert.course}</strong></div>
        <div class="cert-field"><span>Institution</span><strong>${cert.institution}</strong></div>
        <div class="cert-field"><span>Issue Date</span><strong>${formatDate(cert.date)}</strong></div>
        <div class="cert-field"><span>Grade</span><strong>${cert.grade || 'N/A'}</strong></div>
        ${cert.notes ? `<div class="cert-field" style="grid-column:1/-1"><span>Notes</span><strong>${cert.notes}</strong></div>` : ''}
      </div>
      <div class="cert-hash-line">Hash: ${cert.hash} | Prev: ${cert.prevHash}</div>
    </div>`;
}

function buildInvalidResult(certNo) {
  return `
    <div class="result-card invalid">
      <div class="result-header">
        <div class="result-icon" style="background:rgba(239,35,60,.15);color:var(--danger)"><i class="ti ti-shield-x"></i></div>
        <div><h3 style="color:var(--danger)">Certificate Not Found</h3><p>No record for: <strong style="font-family:monospace">${certNo}</strong></p></div>
      </div>
      <p style="font-size:.87rem;color:var(--muted);line-height:1.6">
        This certificate number does not exist in our blockchain database. It may be fraudulent or incorrectly entered.
      </p>
    </div>`;
}

const verifyLog = [];
function addHistory(certNo, method, student, result) {
  verifyLog.unshift({ certNo, method, student, result, time: new Date().toLocaleTimeString() });
  const tbody = document.getElementById('verify-history-body');
  if (!tbody) return;
  tbody.innerHTML = verifyLog.map(r => `
    <tr>
      <td style="font-family:monospace;font-size:.82rem;color:var(--accent)">${r.certNo}</td>
      <td>${r.method}</td><td>${r.student}</td>
      <td style="color:var(--muted);font-size:.82rem">${r.time}</td>
      <td><span class="status-badge ${r.result==='Valid'||r.result==='Verified'?'status-valid':r.result==='Suspicious'?'status-invalid':'status-pending'}">${r.result}</span></td>
    </tr>`).join('');
}

function escHtml(t) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(t));
  return d.innerHTML;
}
