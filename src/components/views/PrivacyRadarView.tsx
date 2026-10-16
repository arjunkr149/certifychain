import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const PrivacyRadarView: React.FC = () => {
  const { privacySummary, runPrivacyScan, remediatePrivacyLeaks, remediationApplied, setPage } = useApp();
  const [testingCustomString, setTestingCustomString] = useState('');
  const [customTestResult, setCustomTestResult] = useState<{
    hasLeak: boolean;
    leakType: string;
    maskedOutput: string;
  } | null>(null);

  const [activeScanning, setActiveScanning] = useState(false);

  const handleRunScan = () => {
    setActiveScanning(true);
    setTimeout(() => {
      runPrivacyScan();
      setActiveScanning(false);
    }, 1200);
  };

  const handleTestCustomString = (e: React.FormEvent) => {
    e.preventDefault();
    const str = testingCustomString.trim();
    if (!str) return;

    // Check for phone number (10 digits)
    const phoneMatch = str.match(/(\+91[\-\s]?)?[6-9]\d{9}/);
    // Check for email
    const emailMatch = str.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
    // Check for 12 digit Aadhaar or long student hash
    const aadhaarMatch = str.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
    const idHashMatch = str.length > 18 && !str.includes('***');

    if (phoneMatch) {
      setCustomTestResult({
        hasLeak: true,
        leakType: 'Direct Telephone Number (Personal Contact PII)',
        maskedOutput: str.replace(/\d{6}(\d{4})/, 'XXXXXX$1'),
      });
    } else if (aadhaarMatch) {
      setCustomTestResult({
        hasLeak: true,
        leakType: 'National ID / Aadhaar Pattern (Critical Statutory PII)',
        maskedOutput: str.replace(/\d{4}\s?\d{4}/, 'XXXX XXXX'),
      });
    } else if (idHashMatch) {
      setCustomTestResult({
        hasLeak: true,
        leakType: 'Unsalted Raw Biometric/Student Hash Token',
        maskedOutput: 'STU-***-' + str.slice(-4),
      });
    } else if (emailMatch) {
      setCustomTestResult({
        hasLeak: true,
        leakType: 'Plaintext Email Address (Direct Identifier)',
        maskedOutput: str.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      });
    } else {
      setCustomTestResult({
        hasLeak: false,
        leakType: 'None Detected — Zero PII Exposure',
        maskedOutput: str,
      });
    }
  };

  const scoreColor =
    privacySummary.overallScore >= 90
      ? 'var(--success)'
      : privacySummary.overallScore >= 75
      ? 'var(--accent)'
      : 'var(--warn)';

  return (
    <div className="page-content">
      {/* HEADER BANNER */}
      <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, rgba(6,214,160,.12), rgba(67,97,238,.1))' }}>
        <div>
          <h2>
            <i className="ti ti-radar" style={{ color: 'var(--success)', marginRight: '8px' }}></i>
            Privacy Leakage Radar &amp; Automated Testing Suite
          </h2>
          <p>
            Continuous scanning for Personally Identifiable Information (PII) leakage, un-salted ledger exposures, and DPDP/GDPR regulatory compliance.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setPage('data-minimization')}
            className="btn btn-ghost"
            style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
          >
            <i className="ti ti-filter-check"></i> Scoped Policy Engine
          </button>
          {!remediationApplied && privacySummary.piiExposureCount > 0 && (
            <button
              onClick={remediatePrivacyLeaks}
              className="btn btn-primary"
              style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }}
            >
              <i className="ti ti-shield-lock"></i> 1-Click PII Redactor
            </button>
          )}
          <button
            onClick={handleRunScan}
            className="btn btn-ghost"
            disabled={activeScanning}
          >
            {activeScanning ? (
              <>
                <span className="spinner"></span> Scanning Vectors...
              </>
            ) : (
              <>
                <i className="ti ti-refresh"></i> Run Live Audit
              </>
            )}
          </button>
        </div>
      </div>

      {/* SCORECARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <p className="stat-label">Privacy Shield Score</p>
            <div className="stat-icon success">
              <i className="ti ti-shield-check"></i>
            </div>
          </div>
          <h3 className="stat-number" style={{ color: scoreColor }}>
            {privacySummary.overallScore} <span style={{ fontSize: '1rem', color: 'var(--muted)' }}>/ 100</span>
          </h3>
          <p className="stat-desc">
            Rating: <strong>{privacySummary.status}</strong>
          </p>
          <div className="trend up">
            <i className="ti ti-lock"></i> Zero-Knowledge Salting
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <p className="stat-label">Automated Tests Passed</p>
            <div className="stat-icon accent">
              <i className="ti ti-list-check"></i>
            </div>
          </div>
          <h3 className="stat-number">
            {privacySummary.testsPassed} <span style={{ fontSize: '1rem', color: 'var(--muted)' }}>/ {privacySummary.testsRun}</span>
          </h3>
          <p className="stat-desc">Automated security test cases</p>
          <div className="trend up">
            <i className="ti ti-check"></i> {Math.round((privacySummary.testsPassed / privacySummary.testsRun) * 100)}% Pass Rate
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <p className="stat-label">PII Exposures Detected</p>
            <div className={`stat-icon ${privacySummary.piiExposureCount > 0 ? 'danger' : 'success'}`}>
              <i className={privacySummary.piiExposureCount > 0 ? 'ti ti-alert-triangle' : 'ti ti-check'}></i>
            </div>
          </div>
          <h3 className="stat-number" style={{ color: privacySummary.piiExposureCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {privacySummary.piiExposureCount}
          </h3>
          <p className="stat-desc">
            {privacySummary.piiExposureCount === 0 ? 'All PII masked & salted' : 'Unmasked identifiers flagged'}
          </p>
          <div className={`trend ${privacySummary.piiExposureCount > 0 ? 'down' : 'up'}`}>
            <i className={`ti ${privacySummary.piiExposureCount > 0 ? 'ti-trending-down' : 'ti-trending-up'}`}></i>{' '}
            {privacySummary.piiExposureCount > 0 ? 'Action Recommended' : 'Clean Audit'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <p className="stat-label">Regulatory Baseline</p>
            <div className="stat-icon warn">
              <i className="ti ti-scale"></i>
            </div>
          </div>
          <h3 className="stat-number" style={{ fontSize: '1.2rem', color: 'var(--text)' }}>
            DPDP &amp; GDPR
          </h3>
          <p className="stat-desc">Data Protection Standard</p>
          <div className="trend up">
            <i className="ti ti-shield"></i> Article 25 Compliant
          </div>
        </div>
      </div>

      {/* RADAR VECTORS VISUALIZATION */}
      <div className="card">
        <div className="card-header">
          <h2>
            <i className="ti ti-radar"></i> Active Privacy Radar Vectors
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
            Last scan: {privacySummary.lastScanTime}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong style={{ fontSize: '0.9rem' }}><i className="ti ti-id" style={{ color: 'var(--accent)', marginRight: '6px' }}></i> Identity Token Isolation</strong>
              <span className={`status-badge ${remediationApplied ? 'status-valid' : 'status-pending'}`}>
                {remediationApplied ? 'Salted' : 'Scanned'}
              </span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              Guards against plain Aadhaar, SSN, or national ID exposure on public ledgers through zero-knowledge hash masking.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong style={{ fontSize: '0.9rem' }}><i className="ti ti-qrcode" style={{ color: 'var(--accent)', marginRight: '6px' }}></i> QR Payload Encryption</strong>
              <span className="status-badge status-valid">Encrypted</span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              Verifies that QR codes do not embed raw biographical data; only cryptographic references and digital signatures are stored.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong style={{ fontSize: '0.9rem' }}><i className="ti ti-link" style={{ color: 'var(--accent)', marginRight: '6px' }}></i> Blockchain Preimage Shield</strong>
              <span className="status-badge status-valid">Intact</span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              SHA-256 one-way hashing guarantees that student transcripts and grades cannot be reverse-computed from public block headers.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong style={{ fontSize: '0.9rem' }}><i className="ti ti-photo-sensor" style={{ color: 'var(--accent)', marginRight: '6px' }}></i> Exif Metadata Stripper</strong>
              <span className="status-badge status-valid">Stripped</span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              Upload pipeline automatically purges camera models, hardware serial numbers, and GPS coordinates from certificate images.
            </p>
          </div>
        </div>
      </div>

      {/* AUTOMATED TEST SUITE REPORT */}
      <div className="card">
        <div className="card-header">
          <h2>
            <i className="ti ti-shield-check"></i> Automated Privacy Leakage Test Suite Results
          </h2>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Test Identifier</th>
                <th>Target Resource</th>
                <th>Severity</th>
                <th>Diagnostic Findings</th>
                <th>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {privacySummary.findings.map(f => (
                <tr key={f.id}>
                  <td>
                    <strong style={{ fontSize: '0.84rem' }}>{f.testName}</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '2px' }}>
                      Category: {f.category}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--accent)', fontFamily: 'monospace' }}>
                    {f.resource}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        f.severity === 'PASSED'
                          ? 'status-valid'
                          : f.severity === 'HIGH' || f.severity === 'CRITICAL'
                          ? 'status-invalid'
                          : 'status-pending'
                      }`}
                    >
                      {f.severity}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', maxWidth: '320px', lineHeight: 1.5 }}>
                    <div>{f.description}</div>
                    {f.detectedText && (
                      <div style={{ background: 'rgba(239,35,60,.08)', border: '1px solid rgba(239,35,60,.2)', borderRadius: '4px', padding: '0.2rem 0.5rem', color: 'var(--danger)', marginTop: '4px', fontFamily: 'monospace', fontSize: '0.74rem' }}>
                        {f.detectedText}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                    {f.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LIVE PII LEAKAGE TESTER & REDACTION PLAYGROUND */}
      <div className="card">
        <div className="card-header">
          <h2>
            <i className="ti ti-terminal"></i> Live PII Leakage Tester &amp; Redaction Playground
          </h2>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>
          Test any student metadata string, Aadhaar number, phone, or raw credential identifier against the Privacy Leakage Radar rules engine.
        </p>

        <form onSubmit={handleTestCustomString} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="verify-input"
            style={{ flex: 1, minWidth: '280px' }}
            placeholder="e.g. Student Aadhaar 4920 8812 3456 or Phone +91-9876543210 or ID STU6612f44c529f81712518220"
            value={testingCustomString}
            onChange={e => setTestingCustomString(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            <i className="ti ti-scan"></i> Test for Leaks
          </button>
        </form>

        {customTestResult && (
          <div
            className={`result-card ${customTestResult.hasLeak ? 'invalid' : 'valid'}`}
            style={{ marginTop: '1rem' }}
          >
            <div className="result-header">
              <div
                className="result-icon"
                style={{
                  background: customTestResult.hasLeak ? 'rgba(239,35,60,.15)' : 'rgba(6,214,160,.15)',
                  color: customTestResult.hasLeak ? 'var(--danger)' : 'var(--success)',
                }}
              >
                <i className={customTestResult.hasLeak ? 'ti ti-alert-triangle' : 'ti ti-shield-check'}></i>
              </div>
              <div>
                <h3 style={{ color: customTestResult.hasLeak ? 'var(--danger)' : 'var(--success)' }}>
                  {customTestResult.hasLeak ? 'PII Leakage Detected!' : 'Sanitized — No Leakage Detected'}
                </h3>
                <p>Classification: {customTestResult.leakType}</p>
              </div>
            </div>

            <div className="cert-detail-grid">
              <div className="cert-field">
                <span>Input String</span>
                <strong style={{ fontFamily: 'monospace' }}>{testingCustomString}</strong>
              </div>
              <div className="cert-field">
                <span>Sanitized / Zero-Knowledge Masked Output</span>
                <strong style={{ fontFamily: 'monospace', color: 'var(--success)' }}>
                  {customTestResult.maskedOutput}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
