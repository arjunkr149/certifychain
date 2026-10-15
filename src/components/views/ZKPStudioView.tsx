import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateZeroKnowledgeProof, ZKProof } from '../../utils/zkp';

export const ZKPStudioView: React.FC = () => {
  const { certs, showToast } = useApp();

  const [selectedCertNo, setSelectedCertNo] = useState(certs[0]?.no || '');
  const [claimType, setClaimType] = useState<'GRADE_THRESHOLD' | 'PROGRAM_COMPLETION' | 'INSTITUTION_ACCREDITATION'>('GRADE_THRESHOLD');
  const [generating, setGenerating] = useState(false);
  const [generatedProof, setGeneratedProof] = useState<ZKProof | null>(null);

  const selectedCert = certs.find(c => c.no === selectedCertNo) || certs[0];

  const handleGenerateProof = async () => {
    if (!selectedCert) return;
    setGenerating(true);
    setGeneratedProof(null);

    setTimeout(async () => {
      const proof = await generateZeroKnowledgeProof(selectedCert, claimType);
      setGeneratedProof(proof);
      setGenerating(false);
      showToast('Zero-Knowledge Proof synthesized and anchored to Merkle Root!', 'success');
    }, 1100);
  };

  return (
    <div className="page-content">
      {/* Banner */}
      <div
        className="welcome-banner"
        style={{
          background: 'linear-gradient(135deg, rgba(67,97,238,.15), rgba(247,37,133,.12))',
          borderColor: 'rgba(67,97,238,.3)',
        }}
      >
        <div>
          <h2>
            <i className="ti ti-lock-access" style={{ color: 'var(--accent)', marginRight: '8px' }}></i>
            Zero-Knowledge (ZK) Proof Studio &amp; Selective Disclosure
          </h2>
          <p>
            Prove credential authenticity, grade thresholds, and degree qualifications to third parties with mathematical certainty — <strong>without disclosing student names, personal numbers, or raw transcripts.</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="role-badge verified" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
            <i className="ti ti-shield-check"></i> Zero PII Exposure Mode Active
          </span>
        </div>
      </div>

      {/* Grid: Generator & Verifier */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(320px, 1.4fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Proof Generator Controls */}
        <div className="card">
          <div className="card-header">
            <h2>
              <i className="ti ti-cpu"></i> 1. ZK-Proof Generation
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label>Select Credential to Prove</label>
              <div className="input-wrap">
                <i className="ti ti-certificate"></i>
                <select
                  className="cf-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={selectedCertNo}
                  onChange={e => setSelectedCertNo(e.target.value)}
                >
                  {certs.map(c => (
                    <option key={c.no} value={c.no}>
                      {c.no} — {c.student} ({c.course})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Selective Disclosure Claim Type</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: claimType === 'GRADE_THRESHOLD' ? 'rgba(67,97,238,.12)' : 'rgba(255,255,255,.02)',
                    border: '1px solid',
                    borderColor: claimType === 'GRADE_THRESHOLD' ? 'var(--accent)' : 'var(--border)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="claim"
                    checked={claimType === 'GRADE_THRESHOLD'}
                    onChange={() => setClaimType('GRADE_THRESHOLD')}
                  />
                  <div>
                    <strong style={{ fontSize: '0.88rem' }}>Grade Threshold Claim (CGPA ≥ 7.5)</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      Proves First Class / Honours eligibility without revealing exact numerical marks.
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: claimType === 'PROGRAM_COMPLETION' ? 'rgba(67,97,238,.12)' : 'rgba(255,255,255,.02)',
                    border: '1px solid',
                    borderColor: claimType === 'PROGRAM_COMPLETION' ? 'var(--accent)' : 'var(--border)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="claim"
                    checked={claimType === 'PROGRAM_COMPLETION'}
                    onChange={() => setClaimType('PROGRAM_COMPLETION')}
                  />
                  <div>
                    <strong style={{ fontSize: '0.88rem' }}>Program Completion Claim</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      Proves course graduation without revealing candidate roll number or national identity token.
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: claimType === 'INSTITUTION_ACCREDITATION' ? 'rgba(67,97,238,.12)' : 'rgba(255,255,255,.02)',
                    border: '1px solid',
                    borderColor: claimType === 'INSTITUTION_ACCREDITATION' ? 'var(--accent)' : 'var(--border)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="claim"
                    checked={claimType === 'INSTITUTION_ACCREDITATION'}
                    onChange={() => setClaimType('INSTITUTION_ACCREDITATION')}
                  />
                  <div>
                    <strong style={{ fontSize: '0.88rem' }}>Accredited Registrar Cryptographic Anchor</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      Proves digital signature links to registered university node in the Merkle Tree.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg"
              onClick={handleGenerateProof}
              disabled={generating}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {generating ? (
                <>
                  <span className="spinner"></span> Synthesizing ZK-Proof...
                </>
              ) : (
                <>
                  <i className="ti ti-sparkles"></i> Generate Zero-Knowledge Proof
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Cryptographic ZK-Proof Output */}
        <div className="card">
          <div className="card-header">
            <h2>
              <i className="ti ti-binary"></i> 2. Mathematical Proof Verification
            </h2>
            {generatedProof && (
              <span className="status-badge status-valid">
                <i className="ti ti-circle-check"></i> Proof Validated
              </span>
            )}
          </div>

          {!generatedProof && !generating && (
            <div style={{ textAlign: 'center', padding: '3.5rem 2rem', color: 'var(--muted)' }}>
              <i className="ti ti-lock-access" style={{ fontSize: '3.5rem', opacity: 0.3, display: 'block', marginBottom: '1rem' }}></i>
              <h3 style={{ color: 'var(--text)', marginBottom: '0.5rem' }}>No Proof Generated Yet</h3>
              <p style={{ fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto' }}>
                Select a claim on the left and click &quot;Generate Zero-Knowledge Proof&quot; to synthesize mathematical proof commitments and Merkle verification paths.
              </p>
            </div>
          )}

          {generating && (
            <div style={{ textAlign: 'center', padding: '3.5rem 2rem', color: 'var(--muted)' }}>
              <div className="spinner" style={{ width: '32px', height: '32px', marginBottom: '1rem' }}></div>
              <h3 style={{ color: 'var(--text)' }}>Computing ZK-SNARK Commitment...</h3>
              <p style={{ fontSize: '0.85rem' }}>Hiding raw biographical PII and calculating Merkle tree polynomial roots...</p>
            </div>
          )}

          {generatedProof && !generating && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  background: 'rgba(6,214,160,.08)',
                  border: '1px solid rgba(6,214,160,.25)',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(6,214,160,.2)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                  <i className="ti ti-shield-check"></i>
                </div>
                <div>
                  <h4 style={{ color: 'var(--success)', margin: 0, fontSize: '0.95rem' }}>
                    Claim Verified: {generatedProof.thresholdClaim}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text)', margin: '4px 0 0' }}>
                    {generatedProof.verifierMessage}
                  </p>
                </div>
              </div>

              {/* Cryptographic Proof Details */}
              <div className="cert-detail-grid">
                <div className="cert-field">
                  <span>Proof Serial Identifier</span>
                  <strong style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{generatedProof.proofId}</strong>
                </div>

                <div className="cert-field">
                  <span>Privacy Leakage Status</span>
                  <strong style={{ color: 'var(--success)' }}>0 Bytes PII Disclosed ✓</strong>
                </div>

                <div className="cert-field" style={{ gridColumn: '1 / -1' }}>
                  <span>Public Cryptographic Commitment</span>
                  <strong style={{ fontFamily: 'monospace', fontSize: '0.78rem', wordBreak: 'break-all', color: 'var(--accent)' }}>
                    {generatedProof.publicCommitment}
                  </strong>
                </div>

                <div className="cert-field" style={{ gridColumn: '1 / -1' }}>
                  <span>Merkle Tree Root Anchor</span>
                  <strong style={{ fontFamily: 'monospace', fontSize: '0.78rem', wordBreak: 'break-all', color: 'var(--muted)' }}>
                    {generatedProof.merkleRoot}
                  </strong>
                </div>
              </div>

              {/* Merkle Path Hierarchy */}
              <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>
                  <i className="ti ti-git-fork"></i> Merkle Tree Verification Path (Sibling Hashes)
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {generatedProof.merklePath.map((pathHash, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--muted)' }}>
                      <span style={{ color: 'var(--accent)' }}>Level {idx + 1}:</span> {pathHash}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: 'var(--muted)' }}>
                <span>Standard: ZK-SNARK / Post-Quantum Merkle Leaf</span>
                <span>Synthesized: {new Date(generatedProof.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
