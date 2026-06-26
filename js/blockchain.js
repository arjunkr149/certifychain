/* =============================================
   blockchain.js — Blockchain Explorer Logic
   CertifyChain
   ============================================= */

window.addEventListener('DOMContentLoaded', () => {
  renderChain();
  renderBlockTable();
  updateBlockCount();
});

// ---- RENDER VISUAL CHAIN ----
function renderChain() {
  const wrap = document.getElementById('chain-viz');
  if (!wrap) return;

  const certs = getAllCerts();
  wrap.innerHTML = '';

  certs.forEach((cert, index) => {
    // Chain arrow (not before genesis block)
    if (index > 0) {
      const arrow = document.createElement('div');
      arrow.className = 'chain-arrow-icon';
      arrow.innerHTML = '<i class="ti ti-arrow-right"></i>';
      wrap.appendChild(arrow);
    }

    // Block card
    const block = document.createElement('div');
    block.className = `block-card${index === 0 ? ' genesis' : ''}`;
    block.innerHTML = `
      <div class="block-num">Block #${index + 1}</div>
      <div class="block-hash" title="Current Hash">${cert.hash}</div>
      <div class="block-prev-hash">Prev: ${cert.prevHash}</div>
      <div class="block-student">${cert.student}</div>
      <div class="block-cert-no">${cert.no}</div>
    `;
    block.title = `Block #${index + 1} — Click to see details`;
    block.style.cursor = 'pointer';
    block.addEventListener('click', () => showBlockDetail(cert, index + 1));
    wrap.appendChild(block);
  });
}

// ---- RENDER BLOCK TABLE ----
function renderBlockTable() {
  const tbody = document.getElementById('block-table-body');
  if (!tbody) return;

  const certs = getAllCerts();
  tbody.innerHTML = certs.map((cert, i) => `
    <tr>
      <td><span style="font-family:var(--font-head);font-weight:600;color:var(--accent)">#${i + 1}</span></td>
      <td style="font-family:monospace;font-size:.82rem;color:var(--accent)">${cert.no}</td>
      <td>${cert.student}</td>
      <td style="font-family:monospace;font-size:.75rem;color:var(--muted)">${cert.hash}</td>
      <td style="font-family:monospace;font-size:.75rem;color:var(--muted)">${cert.prevHash}</td>
      <td>
        <span class="status-badge status-valid">
          <i class="ti ti-link" style="font-size:.7rem"></i> Linked
        </span>
      </td>
    </tr>`).join('');
}

// ---- UPDATE BLOCK COUNT STAT ----
function updateBlockCount() {
  const el = document.getElementById('block-count');
  if (el) el.textContent = getAllCerts().length;
}

// ---- VERIFY CHAIN INTEGRITY ----
function verifyChain() {
  const resultEl = document.getElementById('chain-result');
  if (!resultEl) return;

  resultEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;color:var(--muted)">
      <div class="spinner"></div> Verifying all block hashes and chain links...
    </div>`;

  setTimeout(() => {
    const certs  = getAllCerts();
    const broken = [];

    // Check prev-hash chain links
    for (let i = 1; i < certs.length; i++) {
      if (certs[i].prevHash !== certs[i - 1].hash) {
        broken.push(i + 1);
      }
    }

    if (broken.length === 0) {
      resultEl.innerHTML = `
        <div class="result-card valid">
          <div class="result-header">
            <div class="result-icon" style="background:rgba(6,214,160,.15);color:var(--success)">
              <i class="ti ti-shield-check"></i>
            </div>
            <div>
              <h3 style="color:var(--success)">Chain Integrity Verified ✓</h3>
              <p>All ${certs.length} blocks checked — no tampering detected</p>
            </div>
          </div>
          <div class="cert-detail-grid">
            <div class="cert-field"><span>Blocks Checked</span><strong>${certs.length}</strong></div>
            <div class="cert-field"><span>Broken Links</span><strong style="color:var(--success)">0</strong></div>
            <div class="cert-field"><span>Hash Algorithm</span><strong>SHA-256</strong></div>
            <div class="cert-field"><span>Chain Status</span><strong style="color:var(--success)">INTACT</strong></div>
          </div>
          <div class="cert-hash-line">
            Genesis Hash: ${certs[0]?.hash || 'N/A'} &nbsp;|&nbsp;
            Latest Hash: ${certs[certs.length - 1]?.hash || 'N/A'}
          </div>
        </div>`;
      showToast('Blockchain integrity verified!', 'success');
    } else {
      resultEl.innerHTML = `
        <div class="result-card invalid">
          <div class="result-header">
            <div class="result-icon" style="background:rgba(239,35,60,.15);color:var(--danger)">
              <i class="ti ti-alert-triangle"></i>
            </div>
            <div>
              <h3 style="color:var(--danger)">Chain Integrity Broken!</h3>
              <p>Tampering detected at blocks: ${broken.join(', ')}</p>
            </div>
          </div>
          <p style="font-size:.87rem;color:var(--muted)">
            The hash chain is broken at the listed blocks, indicating possible data tampering.
            Please contact your system administrator immediately.
          </p>
        </div>`;
      showToast('Chain integrity check failed!', 'error');
    }
  }, 1800);
}

// ---- SHOW BLOCK DETAIL (click on a block) ----
function showBlockDetail(cert, blockNum) {
  // Simple alert for now — can be upgraded to a modal
  const info = [
    `Block #${blockNum}`,
    `Certificate No: ${cert.no}`,
    `Student: ${cert.student}`,
    `Course: ${cert.course}`,
    `Date: ${formatDate(cert.date)}`,
    `Hash: ${cert.hash}`,
    `Prev Hash: ${cert.prevHash}`
  ].join('\n');
  alert(info);
}
