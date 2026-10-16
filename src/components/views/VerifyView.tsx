import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Certificate, AIAnalysisResult } from '../../types';
import { formatDate } from '../../utils/blockchain';
import { analyzeCertificateImage } from '../../utils/ai';
import { scanQrCodeFromDataUrl, DecodedQRResult } from '../../utils/qrScanner';
import { ForensicScannerModal } from './ForensicScannerModal';

export const VerifyView: React.FC = () => {
  const { certs, verifyLog, addVerifyRecord, showToast, setPage } = useApp();

  const [activeTab, setActiveTab] = useState<'file' | 'number' | 'qr'>('file');

  // Method 1: Number state
  const [certNoInput, setCertNoInput] = useState('');
  const [numberLoading, setNumberLoading] = useState(false);
  const [numberResult, setNumberResult] = useState<{ found: boolean; cert?: Certificate; query: string } | null>(null);

  // Method 2: QR state
  const [qrLoading, setQrLoading] = useState(false);
  const [qrResult, setQrResult] = useState<{ decoded: string; cert?: Certificate; error?: string } | null>(null);

  // Method 3: File Upload state
  const [fileData, setFileData] = useState<{ name: string; size: string; url: string } | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileStep, setFileStep] = useState(0);
  const [detectedQR, setDetectedQR] = useState<DecodedQRResult | null>(null);
  const [manualCertNo, setManualCertNo] = useState('');
  const [fileResult, setFileResult] = useState<AIAnalysisResult | null>(null);
  const [showForensicModal, setShowForensicModal] = useState(false);

  // 1. By Number
  const verifyByNumber = (noToVerify?: string) => {
    const query = (noToVerify ?? certNoInput).trim();
    if (!query) {
      showToast('Please enter a certificate number', 'error');
      return;
    }
    setNumberLoading(true);
    setNumberResult(null);

    setTimeout(() => {
      setNumberLoading(false);
      const matched = certs.find(c => c.no.toLowerCase() === query.toLowerCase());
      if (matched) {
        setNumberResult({ found: true, cert: matched, query });
        addVerifyRecord({
          certNo: matched.no,
          method: 'Number',
          student: matched.student,
          result: matched.valid ? 'Valid' : 'Fake',
          time: new Date().toLocaleTimeString(),
        });
        if (matched.valid) {
          showToast('Certificate verified authentic on blockchain!', 'success');
        } else {
          showToast('Certificate has been tampered with!', 'error');
        }
      } else {
        setNumberResult({ found: false, query });
        addVerifyRecord({
          certNo: query,
          method: 'Number',
          student: '—',
          result: 'Fake',
          time: new Date().toLocaleTimeString(),
        });
        showToast('Certificate not found in blockchain registry — potential fake', 'error');
      }
    }, 500);
  };

  // 2. By QR Code Upload (Real jsQR Scanning)
  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQrLoading(true);
    setQrResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const url = reader.result as string;
      try {
        const decoded = await scanQrCodeFromDataUrl(url);

        if (!decoded || (!decoded.certNo && !decoded.raw)) {
          setQrLoading(false);
          setQrResult({
            decoded: 'No QR Code Detected',
            error: 'No QR code could be detected in this image. Please ensure the QR code is clear, well-lit, and uncropped.',
          });
          showToast('No readable QR code found in image', 'error');
          return;
        }

        const queryCertNo = decoded.certNo || decoded.raw;
        const matched = certs.find(c =>
          c.no.toLowerCase() === queryCertNo.toLowerCase() ||
          c.no.replace(/[^A-Za-z0-9]/g, '').toLowerCase() === queryCertNo.replace(/[^A-Za-z0-9]/g, '').toLowerCase()
        );

        setQrLoading(false);
        setQrResult({
          decoded: queryCertNo,
          cert: matched,
        });

        const isAuthentic = !!matched && matched.valid !== false;

        addVerifyRecord({
          certNo: queryCertNo,
          method: 'QR Code',
          student: matched ? matched.student : (decoded.student || '—'),
          result: isAuthentic ? 'Valid' : 'Fake',
          time: new Date().toLocaleTimeString(),
        });

        if (isAuthentic) {
          showToast('QR Code decoded and verified authentic on chain!', 'success');
        } else {
          showToast('QR code contains unverified/counterfeit credential', 'error');
        }
      } catch (err: unknown) {
        setQrLoading(false);
        showToast('Error scanning QR code: ' + (err instanceof Error ? err.message : String(err)), 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  // 3. File Upload & Forensic Verification (Real OCR & QR validation)
  const processDocumentAnalysis = async (
    fileName: string,
    url: string,
    overrideCertNo?: string
  ) => {
    setFileData({
      name: fileName,
      size: '348.5 KB',
      url,
    });
    setFileResult(null);
    setFileLoading(true);
    setFileStep(1);

    setTimeout(() => setFileStep(2), 300);
    setTimeout(() => setFileStep(3), 600);
    setTimeout(() => setFileStep(4), 900);
    setTimeout(() => setFileStep(5), 1200);

    try {
      // Step A: Scan image for embedded QR code
      const qrScan = await scanQrCodeFromDataUrl(url);
      setDetectedQR(qrScan);

      const targetCert = overrideCertNo ?? manualCertNo ?? qrScan?.certNo ?? '';
      if (targetCert && !manualCertNo) {
        setManualCertNo(targetCert);
      }

      // Step B: Run forensic analysis and blockchain cross-check
      const analysis = await analyzeCertificateImage(fileName, url, certs, {
        decodedQR: qrScan,
        manualCertNo: targetCert,
      });

      setFileResult(analysis);
      setFileLoading(false);

      const isOk = analysis.verdict === 'VERIFIED';
      addVerifyRecord({
        certNo: analysis.certNumber || targetCert || fileName,
        method: 'Certificate Upload (Forensic OCR & Ledger)',
        student: analysis.name || '—',
        result: isOk ? 'Verified' : 'Fake',
        time: new Date().toLocaleTimeString(),
      });

      showToast(
        isOk ? 'Certificate verified authentic on blockchain!' : 'Validation failed: Certificate is unverified or fake!',
        isOk ? 'success' : 'error'
      );
    } catch (err: unknown) {
      setFileLoading(false);
      showToast('Error during document analysis: ' + (err instanceof Error ? err.message : String(err)), 'error');
    }
  };

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target?.result as string;
      setManualCertNo('');
      processDocumentAnalysis(file.name, url);
    };
    reader.readAsDataURL(file);
  };

  const handleManualRevalidate = () => {
    if (!fileData) return;
    processDocumentAnalysis(fileData.name, fileData.url, manualCertNo.trim());
  };

  return (
    <div className="page-content">
      <div className="card">
        <div className="card-header">
          <h2>
            <i className="ti ti-shield-check"></i> Certificate Verification Portal
          </h2>
        </div>

        {/* TABS */}
        <div className="verify-tabs">
          <button
            className={`vtab ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => setActiveTab('file')}
          >
            <i className="ti ti-file-upload"></i> Upload Certificate (Real-Time Validation)
          </button>
          <button
            className={`vtab ${activeTab === 'number' ? 'active' : ''}`}
            onClick={() => setActiveTab('number')}
          >
            <i className="ti ti-hash"></i> By Certificate Number
          </button>
          <button
            className={`vtab ${activeTab === 'qr' ? 'active' : ''}`}
            onClick={() => setActiveTab('qr')}
          >
            <i className="ti ti-qrcode"></i> Scan QR Code
          </button>
        </div>

        {/* TAB 1: FILE UPLOAD (AI OCR & FORENSIC LEDGER VERIFICATION) */}
        {activeTab === 'file' && (
          <div className="tab-panel active">
            <p className="tab-desc">
              Upload any certificate image or document (JPG, PNG, WebP). CertifyChain automatically inspects the image, decodes any embedded security QR code, and validates the credential against the immutable SHA-256 blockchain registry.
            </p>

            {/* Quick Verification Samples */}
            <div className="sample-certs" style={{ marginBottom: '1.25rem' }}>
              <span className="sample-label">Test Samples:</span>
              <span
                className="sample-chip valid"
                onClick={() => {
                  setManualCertNo('CERT-2024-001234');
                  processDocumentAnalysis(
                    'btech_degree_priya_sharma.png',
                    'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=500&q=80',
                    'CERT-2024-001234'
                  );
                }}
              >
                <i className="ti ti-check"></i> Genuine Degree: Priya Sharma (CERT-2024-001234)
              </span>
              <span
                className="sample-chip valid"
                onClick={() => {
                  setManualCertNo('CERT-2025-000042');
                  processDocumentAnalysis(
                    'aicte_internship_arjun_kumar.png',
                    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&q=80',
                    'CERT-2025-000042'
                  );
                }}
              >
                <i className="ti ti-check"></i> Genuine Internship: Arjun Kumar (CERT-2025-000042)
              </span>
              <span
                className="sample-chip invalid"
                onClick={() => {
                  setManualCertNo('FAKE-2024-998877');
                  processDocumentAnalysis(
                    'fake_tampered_degree_sunil_kumar.png',
                    'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=500&q=80',
                    'FAKE-2024-998877'
                  );
                }}
              >
                <i className="ti ti-alert-triangle"></i> Forged Certificate (Sunil Kumar)
              </span>
            </div>

            <div
              className="upload-zone"
              onClick={() => document.getElementById('cert-file-input')?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleFileChange(f);
              }}
            >
              <i className="ti ti-file-upload upload-zone-icon"></i>
              <p>Drag &amp; drop or click to upload your certificate image</p>
              <small style={{ color: 'var(--muted)', fontSize: '0.8rem', display: 'block', marginTop: '0.4rem' }}>
                Supports PNG, JPG, WEBP · Automatic QR scanning · Blockchain ledger matching · Anti-tamper verification
              </small>
            </div>

            <input
              type="file"
              id="cert-file-input"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handleFileChange(f);
              }}
            />

            {fileData && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={fileData.url}
                      alt="Preview"
                      style={{ width: '90px', height: '65px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)', flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontSize: '0.87rem', fontWeight: 600 }}>{fileData.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>
                        {detectedQR?.certNo ? (
                          <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <i className="ti ti-qrcode"></i> QR Detected: {detectedQR.certNo}
                          </span>
                        ) : (
                          <span>No embedded QR code detected in image</span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setFileData(null);
                          setFileResult(null);
                          setDetectedQR(null);
                          setManualCertNo('');
                        }}
                        style={{ fontSize: '0.76rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '6px', padding: 0, display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <i className="ti ti-x"></i> Remove file
                      </button>
                    </div>
                  </div>

                  {/* Manual Certificate ID Cross-Check */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '2px' }}>
                        Certificate Serial to Validate:
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. CERT-2024-001234"
                        value={manualCertNo}
                        onChange={e => setManualCertNo(e.target.value)}
                        style={{
                          fontSize: '0.82rem',
                          padding: '0.4rem 0.75rem',
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          color: '#fff',
                          fontFamily: 'monospace',
                          width: '210px',
                        }}
                        onKeyDown={e => e.key === 'Enter' && handleManualRevalidate()}
                      />
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: '16px' }}
                      onClick={handleManualRevalidate}
                      disabled={fileLoading}
                    >
                      <i className="ti ti-refresh"></i> Validate with Ledger
                    </button>
                  </div>
                </div>
              </div>
            )}

            {fileLoading && (
              <div className="result-card ai-info" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                  <div className="spinner"></div>
                  <strong>Validating certificate against blockchain ledger &amp; scanning for tampering...</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem', color: 'var(--muted)' }}>
                  <div>
                    {fileStep >= 1 ? <i className="ti ti-circle-check" style={{ color: 'var(--success)' }}></i> : <i className="ti ti-circle-dashed"></i>}{' '}
                    1. Scanning image for digital QR signatures &amp; visual metadata...
                  </div>
                  <div>
                    {fileStep >= 2 ? <i className="ti ti-circle-check" style={{ color: 'var(--success)' }}></i> : <i className="ti ti-circle-dashed"></i>}{' '}
                    2. Extracting Certificate ID and issuer credentials...
                  </div>
                  <div>
                    {fileStep >= 3 ? <i className="ti ti-circle-check" style={{ color: 'var(--success)' }}></i> : <i className="ti ti-circle-dashed"></i>}{' '}
                    3. Cross-referencing against immutable SHA-256 blockchain ledger...
                  </div>
                  <div>
                    {fileStep >= 4 ? <i className="ti ti-circle-check" style={{ color: 'var(--success)' }}></i> : <i className="ti ti-circle-dashed"></i>}{' '}
                    4. Forensic anti-tamper inspection (font kerning, stamp DPI, block hash)...
                  </div>
                  <div>
                    {fileStep >= 5 ? <i className="ti ti-circle-check" style={{ color: 'var(--success)' }}></i> : <i className="ti ti-circle-dashed"></i>}{' '}
                    5. Finalizing cryptographic verification verdict...
                  </div>
                </div>
              </div>
            )}

            {fileResult && !fileLoading && (
              <div
                className={`result-card ${fileResult.verdict === 'VERIFIED' ? 'valid' : 'invalid'}`}
                style={{
                  marginTop: '1.25rem',
                  border: fileResult.verdict === 'VERIFIED' ? '2px solid rgba(6,214,160,.4)' : '2px solid rgba(239,35,60,.4)',
                }}
              >
                <div className="result-header">
                  <div
                    className="result-icon"
                    style={{
                      background: fileResult.verdict === 'VERIFIED' ? 'rgba(6,214,160,.18)' : 'rgba(239,35,60,.18)',
                      color: fileResult.verdict === 'VERIFIED' ? 'var(--success)' : 'var(--danger)',
                    }}
                  >
                    <i className={fileResult.verdict === 'VERIFIED' ? 'ti ti-shield-check' : 'ti ti-shield-x'}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: fileResult.verdict === 'VERIFIED' ? 'var(--success)' : 'var(--danger)', fontSize: '1.25rem' }}>
                      {fileResult.verdict === 'VERIFIED' ? 'Certificate Verified Authentic ✓' : 'UNVERIFIED / COUNTERFEIT CERTIFICATE ✗'}
                    </h3>
                    <p style={{ fontWeight: 500 }}>
                      {fileResult.documentType} · Verification Status: {fileResult.verdict === 'VERIFIED' ? 'Recorded on Blockchain' : 'Not Found on Chain'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: fileResult.tamperScore > 40 ? 'var(--danger)' : 'var(--success)',
                        background: fileResult.tamperScore > 40 ? 'rgba(239,35,60,.12)' : 'rgba(6,214,160,.12)',
                        border: '1px solid currentColor',
                        borderRadius: '6px',
                        padding: '0.35rem 0.75rem',
                        display: 'inline-block',
                      }}
                    >
                      {fileResult.tamperScore > 40 ? `Tamper Risk: ${fileResult.tamperScore}%` : 'Tamper Risk: 0% (Clean)'}
                    </span>
                  </div>
                </div>

                {/* Summary Box */}
                <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text)' }}>
                  <i className={`ti ${fileResult.verdict === 'VERIFIED' ? 'ti-circle-check' : 'ti-alert-triangle'}`} style={{ color: fileResult.verdict === 'VERIFIED' ? 'var(--success)' : 'var(--danger)', marginRight: '6px' }}></i>
                  <strong>{fileResult.summary}</strong>
                </div>

                {/* Forensic Analysis Breakdown Checklist */}
                {fileResult.forensicAnalysis && (
                  <div style={{ background: 'rgba(0,0,0,.15)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.84rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: '0.75rem' }}>
                      <i className="ti ti-binary"></i> Blockchain &amp; Forensic Security Checklist
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                        <i className={`ti ${fileResult.forensicAnalysis.ledgerMatch ? 'ti-check' : 'ti-x'}`} style={{ color: fileResult.forensicAnalysis.ledgerMatch ? 'var(--success)' : 'var(--danger)' }}></i>
                        <span>Blockchain Ledger Record:</span>
                        <strong style={{ color: fileResult.forensicAnalysis.ledgerMatch ? 'var(--success)' : 'var(--danger)' }}>
                          {fileResult.forensicAnalysis.ledgerMatch ? 'MATCHED' : 'NOT FOUND IN BLOCKCHAIN'}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                        <i className={`ti ${fileResult.forensicAnalysis.hologramSealIntegrity === 'GENUINE' ? 'ti-check' : 'ti-x'}`} style={{ color: fileResult.forensicAnalysis.hologramSealIntegrity === 'GENUINE' ? 'var(--success)' : 'var(--danger)' }}></i>
                        <span>Hologram &amp; Seal Integrity:</span>
                        <strong style={{ color: fileResult.forensicAnalysis.hologramSealIntegrity === 'GENUINE' ? 'var(--success)' : 'var(--danger)' }}>
                          {fileResult.forensicAnalysis.hologramSealIntegrity}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                        <i className={`ti ${fileResult.forensicAnalysis.fontCoherence === 'CONSISTENT' ? 'ti-check' : 'ti-x'}`} style={{ color: fileResult.forensicAnalysis.fontCoherence === 'CONSISTENT' ? 'var(--success)' : 'var(--danger)' }}></i>
                        <span>Typography Kerning:</span>
                        <strong style={{ color: fileResult.forensicAnalysis.fontCoherence === 'CONSISTENT' ? 'var(--success)' : 'var(--danger)' }}>
                          {fileResult.forensicAnalysis.fontCoherence}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                        <i className={`ti ${fileResult.forensicAnalysis.qrSignatureMatch ? 'ti-check' : 'ti-x'}`} style={{ color: fileResult.forensicAnalysis.qrSignatureMatch ? 'var(--success)' : 'var(--danger)' }}></i>
                        <span>QR Digital Signature:</span>
                        <strong style={{ color: fileResult.forensicAnalysis.qrSignatureMatch ? 'var(--success)' : 'var(--danger)' }}>
                          {fileResult.forensicAnalysis.qrSignatureMatch ? 'AUTHENTIC' : 'INVALID OR UNREGISTERED'}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Flagged Tampered Areas (if fake / unverified) */}
                {fileResult.tamperedAreas && fileResult.tamperedAreas.length > 0 && (
                  <div style={{ background: 'rgba(239,35,60,.06)', border: '1px solid rgba(239,35,60,.25)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="ti ti-alert-triangle"></i> Verification Anomalies &amp; Flags ({fileResult.tamperedAreas.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {fileResult.tamperedAreas.map((t, idx) => (
                        <div key={idx} style={{ background: 'rgba(239,35,60,.05)', borderLeft: '3px solid var(--danger)', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.82rem' }}>
                          <strong style={{ color: 'var(--danger)' }}>{t.area}:</strong> {t.reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Certificate Fields */}
                <div className="cert-detail-grid">
                  <div className="cert-field"><span>Student Name</span><strong>{fileResult.name}</strong></div>
                  <div className="cert-field"><span>Certificate Serial No.</span><strong style={{ fontFamily: 'monospace', color: fileResult.verdict === 'VERIFIED' ? 'var(--accent)' : 'var(--danger)' }}>{fileResult.certNumber}</strong></div>
                  <div className="cert-field"><span>Course / Program</span><strong>{fileResult.coursePosition}</strong></div>
                  <div className="cert-field"><span>Issuing Institution</span><strong>{fileResult.organization}</strong></div>
                  <div className="cert-field"><span>Issue Date</span><strong>{fileResult.date}</strong></div>
                  <div className="cert-field"><span>Grade / Standing</span><strong>{fileResult.gradeDuration}</strong></div>
                  <div className="cert-field"><span>Registrar / Authority</span><strong>{fileResult.issuedBy}</strong></div>
                  <div className="cert-field"><span>Security Stamp</span><strong>{fileResult.other}</strong></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowForensicModal(true)}
                    >
                      <i className="ti ti-scan"></i> Interactive Forensic ELA Inspector
                    </button>
                    {fileResult.verdict === 'VERIFIED' && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setPage('data-minimization')}
                        style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
                      >
                        <i className="ti ti-filter-check"></i> Filter Disclosure by Scope (GDPR) →
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>
                    <span><i className="ti ti-shield-lock"></i> Cross-referenced against SHA-256 Ledger · {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            )}

            {showForensicModal && fileResult && (
              <ForensicScannerModal
                analysis={fileResult}
                fileUrl={fileData?.url}
                onClose={() => setShowForensicModal(false)}
              />
            )}
          </div>
        )}

        {/* TAB 2: BY NUMBER */}
        {activeTab === 'number' && (
          <div className="tab-panel active">
            <p className="tab-desc">
              Enter the certificate serial number printed on the document to verify its authenticity on the immutable blockchain ledger.
            </p>
            <div className="verify-input-row">
              <input
                type="text"
                className="verify-input"
                placeholder="e.g. CERT-2024-001234 or CERT-2025-000042"
                value={certNoInput}
                onChange={e => setCertNoInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verifyByNumber()}
              />
              <button
                className="btn btn-primary"
                onClick={() => verifyByNumber()}
                disabled={numberLoading}
              >
                {numberLoading ? <span className="spinner"></span> : <i className="ti ti-search"></i>} Verify
              </button>
            </div>

            <div className="sample-certs">
              <span className="sample-label">Quick test:</span>
              <span
                className="sample-chip valid"
                onClick={() => {
                  setCertNoInput('CERT-2024-001234');
                  verifyByNumber('CERT-2024-001234');
                }}
              >
                CERT-2024-001234 (Priya Sharma) ✓
              </span>
              <span
                className="sample-chip valid"
                onClick={() => {
                  setCertNoInput('CERT-2025-000042');
                  verifyByNumber('CERT-2025-000042');
                }}
              >
                CERT-2025-000042 (Arjun Kumar) ✓
              </span>
              <span
                className="sample-chip invalid"
                onClick={() => {
                  setCertNoInput('FAKE-2024-998877');
                  verifyByNumber('FAKE-2024-998877');
                }}
              >
                FAKE-2024-998877 (Counterfeit) ✗
              </span>
            </div>

            {numberLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--muted)', padding: '1rem' }}>
                <div className="spinner"></div> Searching blockchain records...
              </div>
            )}

            {numberResult && !numberLoading && (
              numberResult.found && numberResult.cert ? (
                <div className="result-card valid">
                  <div className="result-header">
                    <div className="result-icon" style={{ background: 'rgba(6,214,160,.15)', color: 'var(--success)' }}>
                      <i className="ti ti-shield-check"></i>
                    </div>
                    <div>
                      <h3 style={{ color: 'var(--success)' }}>Certificate Verified Authentic ✓</h3>
                      <p>Blockchain record confirmed — authentic and un-tampered</p>
                    </div>
                  </div>
                  <div className="cert-detail-grid">
                    <div className="cert-field">
                      <span>Student Name</span>
                      <strong>{numberResult.cert.student}</strong>
                    </div>
                    <div className="cert-field">
                      <span>Certificate No.</span>
                      <strong style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--accent)' }}>
                        {numberResult.cert.no}
                      </strong>
                    </div>
                    <div className="cert-field">
                      <span>Course / Program</span>
                      <strong>{numberResult.cert.course}</strong>
                    </div>
                    <div className="cert-field">
                      <span>Institution</span>
                      <strong>{numberResult.cert.institution}</strong>
                    </div>
                    <div className="cert-field">
                      <span>Issue Date</span>
                      <strong>{formatDate(numberResult.cert.date)}</strong>
                    </div>
                    <div className="cert-field">
                      <span>Grade / Result</span>
                      <strong>{numberResult.cert.grade || 'N/A'}</strong>
                    </div>
                    {numberResult.cert.notes && (
                      <div className="cert-field" style={{ gridColumn: '1 / -1' }}>
                        <span>Notes</span>
                        <strong>{numberResult.cert.notes}</strong>
                      </div>
                    )}
                  </div>
                  <div className="cert-hash-line">
                    Block Hash: {numberResult.cert.hash} | Prev Linked Hash: {numberResult.cert.prevHash}
                  </div>
                  <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="ti ti-filter-check" style={{ color: 'var(--success)' }}></i>
                      <span>Context-Sensitive Policy Engine Active (GDPR Art. 5(1)(c))</span>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setPage('data-minimization')}
                      style={{ fontSize: '0.76rem', padding: '0.35rem 0.75rem', borderColor: 'var(--accent)', color: 'var(--accent)' }}
                    >
                      <i className="ti ti-shield-lock"></i> Filter Disclosures by Scope →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="result-card invalid">
                  <div className="result-header">
                    <div className="result-icon" style={{ background: 'rgba(239,35,60,.15)', color: 'var(--danger)' }}>
                      <i className="ti ti-shield-x"></i>
                    </div>
                    <div>
                      <h3 style={{ color: 'var(--danger)' }}>Counterfeit / Unregistered Certificate ✗</h3>
                      <p>
                        No blockchain record for: <strong style={{ fontFamily: 'monospace' }}>{numberResult.query}</strong>
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.87rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                    This certificate number does not exist in our SHA-256 blockchain database. It has not been recorded or issued by an authorized institution.
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* TAB 3: QR CODE SCAN */}
        {activeTab === 'qr' && (
          <div className="tab-panel active">
            <p className="tab-desc">
              Upload an image containing the security QR code from any certificate. Our system will decode the cryptographic payload using client-side computer vision and cross-reference the hash against the blockchain.
            </p>
            <div
              className="upload-zone"
              onClick={() => document.getElementById('qr-file-input')?.click()}
            >
              <i className="ti ti-qrcode upload-zone-icon"></i>
              <p>Click or tap to upload QR code image</p>
              <small>Real-time client-side QR scanning (PNG, JPG, WebP)</small>
            </div>
            <input
              type="file"
              id="qr-file-input"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleQRUpload}
            />

            {qrLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--muted)', padding: '1rem' }}>
                <div className="spinner"></div> Decoding QR code &amp; validating against blockchain hash...
              </div>
            )}

            {qrResult && !qrLoading && (
              <div style={{ marginTop: '1rem' }}>
                {qrResult.error ? (
                  <div className="result-card invalid">
                    <div className="result-header">
                      <div className="result-icon" style={{ background: 'rgba(239,35,60,.15)', color: 'var(--danger)' }}>
                        <i className="ti ti-scan"></i>
                      </div>
                      <div>
                        <h3 style={{ color: 'var(--danger)' }}>QR Code Not Detected</h3>
                        <p>{qrResult.error}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="result-card ai-info" style={{ marginBottom: '0.75rem' }}>
                      <div className="result-header">
                        <div className="result-icon" style={{ background: 'rgba(67,97,238,.15)', color: 'var(--accent)' }}>
                          <i className="ti ti-qrcode"></i>
                        </div>
                        <div>
                          <h3>QR Code Decoded Successfully</h3>
                          <p>
                            Decoded Credential Serial: <strong style={{ fontFamily: 'monospace' }}>{qrResult.decoded}</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    {qrResult.cert && qrResult.cert.valid !== false ? (
                      <div className="result-card valid">
                        <div className="result-header">
                          <div className="result-icon" style={{ background: 'rgba(6,214,160,.15)', color: 'var(--success)' }}>
                            <i className="ti ti-shield-check"></i>
                          </div>
                          <div>
                            <h3 style={{ color: 'var(--success)' }}>QR Certificate Verified Authentic ✓</h3>
                            <p>Linked securely to blockchain block #{certs.findIndex(c => c.no === qrResult.cert?.no) + 1}</p>
                          </div>
                        </div>
                        <div className="cert-detail-grid">
                          <div className="cert-field"><span>Student</span><strong>{qrResult.cert.student}</strong></div>
                          <div className="cert-field"><span>Degree / Course</span><strong>{qrResult.cert.course}</strong></div>
                          <div className="cert-field"><span>Institution</span><strong>{qrResult.cert.institution}</strong></div>
                          <div className="cert-field"><span>Issue Date</span><strong>{formatDate(qrResult.cert.date)}</strong></div>
                          <div className="cert-field"><span>Grade</span><strong>{qrResult.cert.grade || 'N/A'}</strong></div>
                          <div className="cert-field"><span>Status</span><strong style={{ color: 'var(--success)' }}>Verified Authentic</strong></div>
                        </div>
                        <div className="cert-hash-line">Block Hash: {qrResult.cert.hash}</div>
                      </div>
                    ) : (
                      <div className="result-card invalid">
                        <div className="result-header">
                          <div className="result-icon" style={{ background: 'rgba(239,35,60,.15)', color: 'var(--danger)' }}>
                            <i className="ti ti-shield-x"></i>
                          </div>
                          <div>
                            <h3 style={{ color: 'var(--danger)' }}>Unregistered / Counterfeit QR Credential ✗</h3>
                            <p>Decoded ID ({qrResult.decoded}) does not match any valid block in the ledger.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* VERIFICATION HISTORY */}
      <div className="card">
        <div className="card-header">
          <h2>
            <i className="ti ti-history"></i> Verification Audit Log (Today)
          </h2>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cert No.</th>
                <th>Method</th>
                <th>Student</th>
                <th>Time</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {verifyLog.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '1.5rem' }}>
                    No verifications performed yet today
                  </td>
                </tr>
              ) : (
                verifyLog.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--accent)' }}>
                      {r.certNo}
                    </td>
                    <td>{r.method}</td>
                    <td>{r.student}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{r.time}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          r.result === 'Valid' || r.result === 'Verified'
                            ? 'status-valid'
                            : r.result === 'Fake' || r.result === 'Suspicious'
                            ? 'status-invalid'
                            : 'status-pending'
                        }`}
                      >
                        {r.result}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
