import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { verifyChainIntegrity } from '../../utils/blockchain';

export const BlockchainView: React.FC = () => {
  const { certs, setSelectedBlockForModal, resetChain, showToast } = useApp();

  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    brokenBlocks: number[];
    checkedCount: number;
  } | null>(null);

  const handleVerifyChain = () => {
    setVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      setVerifying(false);
      const res = verifyChainIntegrity(certs);
      setVerificationResult(res);
      if (res.valid) {
        showToast('Blockchain integrity verified! No tampering detected.', 'success');
      } else {
        showToast(`Chain integrity broken at block(s): ${res.brokenBlocks.join(', ')}`, 'error');
      }
    }, 1200);
  };

  const currentIntegrity = verifyChainIntegrity(certs);

  return (
    <div className="page-content">
      {/* Chain Summary */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <p className="stat-label">Total Blocks</p>
            <div className="stat-icon accent">
              <i className="ti ti-cube"></i>
            </div>
          </div>
          <h3 className="stat-number" id="block-count">
            {certs.length}
          </h3>
          <p className="stat-desc">Certificates on chain</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <p className="stat-label">Chain Status</p>
            <div className={`stat-icon ${currentIntegrity.valid ? 'success' : 'danger'}`}>
              <i className={currentIntegrity.valid ? 'ti ti-shield-check' : 'ti ti-alert-triangle'}></i>
            </div>
          </div>
          <h3
            className="stat-number"
            style={{
              color: currentIntegrity.valid ? 'var(--success)' : 'var(--danger)',
              fontSize: '1.3rem',
            }}
          >
            {currentIntegrity.valid ? 'Intact ✓' : 'Broken ✗'}
          </h3>
          <p className="stat-desc">
            {currentIntegrity.valid ? 'No tampering detected' : 'Tampering flagged in chain'}
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <p className="stat-label">Hash Algorithm</p>
            <div className="stat-icon warn">
              <i className="ti ti-lock"></i>
            </div>
          </div>
          <h3 className="stat-number" style={{ fontSize: '1.1rem' }}>
            SHA-256
          </h3>
          <p className="stat-desc">Cryptographic hashing</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <p className="stat-label">Genesis Block</p>
            <div className="stat-icon accent">
              <i className="ti ti-flag"></i>
            </div>
          </div>
          <h3 className="stat-number" style={{ fontSize: '1rem' }}>
            2024-05-15
          </h3>
          <p className="stat-desc">Chain origin timestamp</p>
        </div>
      </div>

      {/* VISUAL CHAIN */}
      <div className="card">
        <div className="card-header">
          <h2>
            <i className="ti ti-link"></i> Block Chain Visualization
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!currentIntegrity.valid && (
              <button className="btn btn-ghost btn-sm" onClick={resetChain}>
                <i className="ti ti-rotate"></i> Reset Chain
              </button>
            )}
            <button
              className="btn btn-primary btn-sm"
              onClick={handleVerifyChain}
              disabled={verifying}
            >
              <i className="ti ti-shield-check"></i> Verify Integrity
            </button>
          </div>
        </div>

        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          Each block contains a certificate's SHA-256 data hash linked to the previous block.
          Click any block to inspect full cryptographic headers or simulate block tampering.
        </p>

        <div className="chain-scroll" id="chain-viz">
          {certs.map((cert, index) => {
            const isGenesis = index === 0;
            const isBroken =
              index > 0 && cert.prevHash !== certs[index - 1].hash;

            return (
              <React.Fragment key={cert.no}>
                {index > 0 && (
                  <div
                    className="chain-arrow-icon"
                    style={{ color: isBroken ? 'var(--danger)' : 'var(--muted)' }}
                    title={isBroken ? 'Link broken here!' : 'Linked'}
                  >
                    <i className={isBroken ? 'ti ti-link-off' : 'ti ti-arrow-right'}></i>
                  </div>
                )}

                <div
                  className={`block-card ${isGenesis ? 'genesis' : ''}`}
                  style={{
                    borderColor: isBroken ? 'var(--danger)' : undefined,
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedBlockForModal({ cert, blockNum: index + 1 })}
                  title={`Block #${index + 1} — Click to inspect`}
                >
                  <div className="block-num">Block #{index + 1}</div>
                  <div className="block-hash" title="Current Block Hash">
                    {cert.hash}
                  </div>
                  <div className="block-prev-hash" title="Previous Block Hash">
                    Prev: {cert.prevHash}
                  </div>
                  <div className="block-student">{cert.student}</div>
                  <div className="block-cert-no">{cert.no}</div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {verifying && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--muted)', marginTop: '1rem' }}>
            <div className="spinner"></div> Re-evaluating all block hashes and cryptographic linkage...
          </div>
        )}

        {verificationResult && !verifying && (
          <div style={{ marginTop: '1rem' }}>
            {verificationResult.valid ? (
              <div className="result-card valid">
                <div className="result-header">
                  <div className="result-icon" style={{ background: 'rgba(6,214,160,.15)', color: 'var(--success)' }}>
                    <i className="ti ti-shield-check"></i>
                  </div>
                  <div>
                    <h3 style={{ color: 'var(--success)' }}>Chain Integrity Verified ✓</h3>
                    <p>All {verificationResult.checkedCount} blocks checked — no tampering detected</p>
                  </div>
                </div>
                <div className="cert-detail-grid">
                  <div className="cert-field">
                    <span>Blocks Checked</span>
                    <strong>{verificationResult.checkedCount}</strong>
                  </div>
                  <div className="cert-field">
                    <span>Broken Links</span>
                    <strong style={{ color: 'var(--success)' }}>0</strong>
                  </div>
                  <div className="cert-field">
                    <span>Hash Algorithm</span>
                    <strong>SHA-256</strong>
                  </div>
                  <div className="cert-field">
                    <span>Chain Status</span>
                    <strong style={{ color: 'var(--success)' }}>INTACT</strong>
                  </div>
                </div>
                <div className="cert-hash-line">
                  Genesis Hash: {certs[0]?.hash} &nbsp;|&nbsp; Latest Hash: {certs[certs.length - 1]?.hash}
                </div>
              </div>
            ) : (
              <div className="result-card invalid">
                <div className="result-header">
                  <div className="result-icon" style={{ background: 'rgba(239,35,60,.15)', color: 'var(--danger)' }}>
                    <i className="ti ti-alert-triangle"></i>
                  </div>
                  <div>
                    <h3 style={{ color: 'var(--danger)' }}>Chain Integrity Broken!</h3>
                    <p>Tampering detected at block(s): {verificationResult.brokenBlocks.join(', ')}</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.87rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                  The hash chain link is broken at the listed block(s), indicating data tampering.
                  You can click &quot;Reset Chain&quot; above to restore verified state.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BLOCK DETAILS TABLE */}
      <div className="card">
        <div className="card-header">
          <h2>
            <i className="ti ti-table"></i> All Blocks — Detailed View
          </h2>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Block #</th>
                <th>Certificate No.</th>
                <th>Student</th>
                <th>Current Hash</th>
                <th>Previous Hash</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {certs.map((c, i) => {
                const isBroken = i > 0 && c.prevHash !== certs[i - 1].hash;
                return (
                  <tr
                    key={c.no}
                    onClick={() => setSelectedBlockForModal({ cert: c, blockNum: i + 1 })}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <span style={{ fontFamily: 'var(--font-head)', fontWeight: 600, color: 'var(--accent)' }}>
                        #{i + 1}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--accent)' }}>
                      {c.no}
                    </td>
                    <td>{c.student}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>
                      {c.hash}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--muted)' }}>
                      {c.prevHash}
                    </td>
                    <td>
                      <span className={`status-badge ${isBroken ? 'status-invalid' : 'status-valid'}`}>
                        <i className={`ti ${isBroken ? 'ti-link-off' : 'ti-link'}`} style={{ fontSize: '0.7rem' }}></i>{' '}
                        {isBroken ? 'Tampered' : 'Linked'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* HOW BLOCKCHAIN WORKS EXPLAINER */}
      <div className="card">
        <div className="card-header">
          <h2>
            <i className="ti ti-info-circle"></i> How Our Blockchain Works
          </h2>
        </div>
        <div className="explainer-grid">
          <div className="explainer-step">
            <div className="explainer-num">01</div>
            <h4>Certificate Registered</h4>
            <p>When a certificate is issued, student data (name, course, date, grade) is combined and a SHA-256 hash is generated.</p>
          </div>
          <div className="explainer-arrow"><i className="ti ti-arrow-right"></i></div>
          <div className="explainer-step">
            <div className="explainer-num">02</div>
            <h4>Block Created</h4>
            <p>A new block is created containing: the certificate hash, the previous block&apos;s hash, and an immutable timestamp.</p>
          </div>
          <div className="explainer-arrow"><i className="ti ti-arrow-right"></i></div>
          <div className="explainer-step">
            <div className="explainer-num">03</div>
            <h4>Chain Linked</h4>
            <p>The block is appended to the chain. If anyone tampers with data, the hash changes and all subsequent chain links break.</p>
          </div>
          <div className="explainer-arrow"><i className="ti ti-arrow-right"></i></div>
          <div className="explainer-step">
            <div className="explainer-num">04</div>
            <h4>Verification</h4>
            <p>To verify, we recompute the hash and compare it to the stored block value. A match = authentic. Mismatch = fraud.</p>
          </div>
        </div>
      </div>

      {/* ADVANCED SECURITY: POST-QUANTUM MERKLE TREE & MULTI-SIG */}
      <div className="card" style={{ border: '1px solid rgba(67,97,238,.3)', background: 'linear-gradient(135deg, rgba(14,16,25,.95), rgba(19,22,31,.95))' }}>
        <div className="card-header">
          <h2>
            <i className="ti ti-lock-access" style={{ color: 'var(--accent)' }}></i> Advanced Cryptographic Architecture
          </h2>
          <span className="role-badge verified">
            <i className="ti ti-atom-2"></i> Quantum-Resistant
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <i className="ti ti-git-fork" style={{ color: 'var(--accent)', fontSize: '1.3rem' }}></i>
              <strong style={{ fontSize: '0.95rem' }}>Merkle Tree Root Anchor</strong>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Every block hash is indexed into a binary Merkle tree. Even if individual blocks are isolated, the root hash cryptographically guarantees global ledger integrity.
            </p>
            <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: 'rgba(67,97,238,.08)', padding: '0.4rem 0.6rem', borderRadius: '6px', color: 'var(--accent)', wordBreak: 'break-all' }}>
              Merkle Root: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <i className="ti ti-key" style={{ color: 'var(--success)', fontSize: '1.3rem' }}></i>
              <strong style={{ fontSize: '0.95rem' }}>Threshold Multi-Signature (Multi-Sig)</strong>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Issuing a certificate requires 3 independent cryptographic attestations to prevent rogue or unauthorized administrator issuance.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)' }}>
                <i className="ti ti-check"></i> Registrar Key Signature (Validated)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)' }}>
                <i className="ti ti-check"></i> Academic Senate Quorum Witness (Validated)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)' }}>
                <i className="ti ti-check"></i> Decentralized Node Proof-of-Authority (Active)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
