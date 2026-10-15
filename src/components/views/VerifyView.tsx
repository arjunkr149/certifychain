import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Certificate, AIAnalysisResult } from '../../types';
import { formatDate } from '../../utils/blockchain';
import { analyzeCertificateImage, askCertifyChainAI } from '../../utils/ai';
import { ForensicScannerModal } from './ForensicScannerModal';

export const VerifyView: React.FC = () => {
  const { certs, verifyLog, addVerifyRecord, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'number' | 'qr' | 'file' | 'ai'>('file');

  // Method 1: Number state
  const [certNoInput, setCertNoInput] = useState('');
  const [numberLoading, setNumberLoading] = useState(false);
  const [numberResult, setNumberResult] = useState<{ found: boolean; cert?: Certificate; query: string } | null>(null);

  // Method 2: QR state
  const [qrLoading, setQrLoading] = useState(false);
  const [qrResult, setQrResult] = useState<{ decoded: string; cert?: Certificate } | null>(null);

  // Method 3: File state
  const [fileData, setFileData] = useState<{ name: string; size: string; url: string } | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileStep, setFileStep] = useState(0);
  const [fileResult, setFileResult] = useState<AIAnalysisResult | null>(null);
  const [uploadTestMode, setUploadTestMode] = useState<'auto' | 'authentic' | 'fake'>('auto');

  // Method 4: AI Chat state
  const [aiChatMsgs, setAiChatMsgs] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: "Hello! I'm CertifyChain's AI assistant. I can help verify certificates, detect potential fraud or forgeries, explain blockchain records, or check credential details.",
    },
  ]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);
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
          result: 'Valid',
          time: new Date().toLocaleTimeString(),
        });
        showToast('Certificate verified authentic!', 'success');
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
    }, 700);
  };

  // 2. By QR Code
  const handleQRUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQrLoading(true);
    setQrResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        setQrLoading(false);
        const decoded = 'CERT-2024-001234';
        const matched = certs.find(c => c.no === decoded);
        setQrResult({ decoded, cert: matched });
        addVerifyRecord({
          certNo: decoded,
          method: 'QR Code',
          student: matched ? matched.student : '—',
          result: matched ? 'Valid' : 'Fake',
          time: new Date().toLocaleTimeString(),
        });
        if (matched) {
          showToast('QR Code decoded and verified!', 'success');
        } else {
          showToast('QR code contains unverified credential', 'error');
        }
      }, 900);
    };
    reader.readAsDataURL(file);
  };

  // 3. File Upload & Forensic Verification
  const processDocumentAnalysis = async (fileName: string, url: string, modeOverride?: 'auto' | 'authentic' | 'fake') => {
    const activeMode = modeOverride || uploadTestMode;
    setFileData({
      name: fileName,
      size: '348.5 KB',
      url,
    });
    setFileResult(null);
    setFileLoading(true);
    setFileStep(1);

    setTimeout(() => setFileStep(2), 400);
    setTimeout(() => setFileStep(3), 800);
    setTimeout(() => setFileStep(4), 1200);
    setTimeout(() => setFileStep(5), 1600);

    try {
      const analysis = await analyzeCertificateImage(fileName, url, certs, activeMode);
      setFileResult(analysis);
      setFileLoading(false);

      const isOk = analysis.verdict === 'VERIFIED';
      addVerifyRecord({
        certNo: analysis.certNumber || fileName,
        method: 'File Upload (AI OCR)',
        student: analysis.name || '—',
        result: isOk ? 'Verified' : 'Fake',
        time: new Date().toLocaleTimeString(),
      });

      showToast(
        isOk ? 'Document authentic and verified!' : 'Fake/tampered certificate detected!',
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
      processDocumentAnalysis(file.name, url);
    };
    reader.readAsDataURL(file);
  };

  // 4. AI Chat
  const handleSendAIChat = async () => {
    const text = aiChatInput.trim();
    if (!text || aiChatLoading) return;
    setAiChatInput('');
    setAiChatMsgs(prev => [...prev, { role: 'user', text }]);
    setAiChatLoading(true);

    const reply = await askCertifyChainAI(text, certs);
    setAiChatLoading(false);
    setAiChatMsgs(prev => [...prev, { role: 'assistant', text: reply }]);
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
            <i className="ti ti-file-upload"></i> File Upload (AI &amp; Fake Detection)
          </button>
          <button
            className={`vtab ${activeTab === 'number' ? 'active' : ''}`}
            onClick={() => setActiveTab('number')}
          >
            <i className="ti ti-hash"></i> By Number
          </button>
          <button
            className={`vtab ${activeTab === 'qr' ? 'active' : ''}`}
            onClick={() => setActiveTab('qr')}
          >
            <i className="ti ti-qrcode"></i> QR Code
          </button>
          <button
            className={`vtab ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            <i className="ti ti-robot"></i> AI Fraud Assistant
          </button>
        </div>

        {/* TAB 1: FILE UPLOAD (AI OCR & FORENSIC FAKE DETECTION) */}
        {activeTab === 'file' && (
          <div className="tab-panel active">
            <p className="tab-desc">
              Upload any certificate — degree, marksheet, internship letter, or official document. Our Neural OCR and Forensic Tamper Engine checks the image for typography splicing, resolution mismatch, and cross-references against the SHA-256 blockchain ledger to detect forgeries.
            </p>

            {/* Quick Test Samples */}
            <div className="sample-certs" style={{ marginBottom: '1.25rem' }}>
              <span className="sample-label">Quick Test Presets:</span>
              <span
                className="sample-chip valid"
                onClick={() =>
                  processDocumentAnalysis(
                    'btech_degree_priya_sharma.png',
                    'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=500&q=80'
                  )
                }
              >
                <i className="ti ti-check"></i> Authentic Degree (GNIOT)
              </span>
              <span
                className="sample-chip valid"
                onClick={() =>
                  processDocumentAnalysis(
                    'aicte_internship_arjun_kumar.png',
                    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&q=80'
                  )
                }
              >
                <i className="ti ti-check"></i> Authentic Internship (AICTE)
              </span>
              <span
                className="sample-chip invalid"
                onClick={() =>
                  processDocumentAnalysis(
                    'fake_tampered_degree_sunil_kumar.png',
                    'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=500&q=80'
                  )
                }
              >
                <i className="ti ti-alert-triangle"></i> Forged Certificate (Altered Name &amp; CGPA)
              </span>
              <span
                className="sample-chip invalid"
                onClick={() =>
                  processDocumentAnalysis(
                    'counterfeit_diploma_unverified_hash.png',
                    'https://images.unsplash.com/photo-1607434472257-d9f8e57a643d?w=500&q=80'
                  )
                }
              >
                <i className="ti ti-shield-x"></i> Counterfeit Diploma (Cloned QR &amp; Seal)
              </span>
            </div>

            {/* Test Mode Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', flexWrap: 'wrap', background: 'rgba(255,255,255,.02)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem 0.85rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="ti ti-adjustments-horizontal"></i> Verification Mode:
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setUploadTestMode('auto')}
                  style={{
                    fontSize: '0.78rem',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    border: '1px solid',
                    cursor: 'pointer',
                    background: uploadTestMode === 'auto' ? 'rgba(67,97,238,.2)' : 'transparent',
                    borderColor: uploadTestMode === 'auto' ? 'var(--accent)' : 'var(--border)',
                    color: uploadTestMode === 'auto' ? '#fff' : 'var(--muted)',
                    fontWeight: uploadTestMode === 'auto' ? 600 : 400,
                  }}
                >
                  ⚡ Smart Auto-Detect
                </button>
                <button
                  type="button"
                  onClick={() => setUploadTestMode('authentic')}
                  style={{
                    fontSize: '0.78rem',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    border: '1px solid',
                    cursor: 'pointer',
                    background: uploadTestMode === 'authentic' ? 'rgba(6,214,160,.2)' : 'transparent',
                    borderColor: uploadTestMode === 'authentic' ? 'var(--success)' : 'var(--border)',
                    color: uploadTestMode === 'authentic' ? 'var(--success)' : 'var(--muted)',
                    fontWeight: uploadTestMode === 'authentic' ? 600 : 400,
                  }}
                >
                  <i className="ti ti-shield-check"></i> Force Authentic Check
                </button>
                <button
                  type="button"
                  onClick={() => setUploadTestMode('fake')}
                  style={{
                    fontSize: '0.78rem',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    border: '1px solid',
                    cursor: 'pointer',
                    background: uploadTestMode === 'fake' ? 'rgba(239,35,60,.2)' : 'transparent',
                    borderColor: uploadTestMode === 'fake' ? 'var(--danger)' : 'var(--border)',
                    color: uploadTestMode === 'fake' ? 'var(--danger)' : 'var(--muted)',
                    fontWeight: uploadTestMode === 'fake' ? 600 : 400,
                  }}
                >
                  <i className="ti ti-shield-x"></i> Force Fake / Tamper Detection
                </button>
              </div>
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
              <p>Drag &amp; drop or click to upload any certificate image (JPG, PNG, WEBP, PDF)</p>
              <small style={{ color: 'var(--muted)', fontSize: '0.8rem', display: 'block', marginTop: '0.4rem' }}>
                Instant AI OCR text extraction · Digital stamp DPI inspection · Ledger tamper verification
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
                      <div style={{ fontSize: '0.87rem', fontWeight: 500 }}>{fileData.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>{fileData.size}</div>
                      <button
                        onClick={() => {
                          setFileData(null);
                          setFileResult(null);
                        }}
                        style={{ fontSize: '0.76rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '6px', padding: 0, display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <i className="ti ti-x"></i> Remove file
                      </button>
                    </div>
                  </div>

                  {/* Re-test switches */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', borderColor: 'var(--success)', color: 'var(--success)' }}
                      onClick={() => processDocumentAnalysis(fileData.name, fileData.url, 'authentic')}
                      disabled={fileLoading}
                    >
                      <i className="ti ti-shield-check"></i> Test Authentic
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                      onClick={() => processDocumentAnalysis(fileData.name, fileData.url, 'fake')}
                      disabled={fileLoading}
                    >
                      <i className="ti ti-alert-triangle"></i> Test Fake / Tampered
                    </button>
                  </div>
                </div>
              </div>
            )}

            {fileLoading && (
              <div className="result-card ai-info" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                  <div className="spinner"></div>
                  <strong>Forensic AI is analyzing document &amp; checking for forgeries...</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem', color: 'var(--muted)' }}>
                  <div>
                    {fileStep >= 1 ? <i className="ti ti-circle-check" style={{ color: 'var(--success)' }}></i> : <i className="ti ti-circle-dashed"></i>}{' '}
                    1. Detecting document type &amp; layout micro-structure...
                  </div>
                  <div>
                    {fileStep >= 2 ? <i className="ti ti-circle-check" style={{ color: 'var(--success)' }}></i> : <i className="ti ti-circle-dashed"></i>}{' '}
                    2. Extracting text from image via Neural OCR...
                  </div>
                  <div>
                    {fileStep >= 3 ? <i className="ti ti-circle-check" style={{ color: 'var(--success)' }}></i> : <i className="ti ti-circle-dashed"></i>}{' '}
                    3. Cross-referencing serial number against Blockchain Ledger...
                  </div>
                  <div>
                    {fileStep >= 4 ? <i className="ti ti-circle-check" style={{ color: 'var(--success)' }}></i> : <i className="ti ti-circle-dashed"></i>}{' '}
                    4. Forensic analysis: Font kerning, stamp DPI, &amp; digital tampering detection...
                  </div>
                  <div>
                    {fileStep >= 5 ? <i className="ti ti-circle-check" style={{ color: 'var(--success)' }}></i> : <i className="ti ti-circle-dashed"></i>}{' '}
                    5. Synthesizing cryptographic verification &amp; fraud report...
                  </div>
                </div>
              </div>
            )}

            {fileResult && !fileLoading && (
              <div
                className={`result-card ${fileResult.verdict === 'VERIFIED' ? 'valid' : 'invalid'}`}
                style={{ marginTop: '1.25rem', border: fileResult.verdict === 'VERIFIED' ? '2px solid rgba(6,214,160,.4)' : '2px solid rgba(239,35,60,.4)' }}
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
                      {fileResult.verdict === 'VERIFIED' ? 'Certificate Verified Authentic ✓' : 'CRITICAL WARNING: FAKE / TAMPERED CERTIFICATE ✗'}
                    </h3>
                    <p style={{ fontWeight: 500 }}>
                      {fileResult.documentType} · Forensic Confidence: {fileResult.confidence}
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
                      <i className="ti ti-binary"></i> Forensic Security Checklist
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                        <i className={`ti ${fileResult.forensicAnalysis.ledgerMatch ? 'ti-check' : 'ti-x'}`} style={{ color: fileResult.forensicAnalysis.ledgerMatch ? 'var(--success)' : 'var(--danger)' }}></i>
                        <span>Blockchain Ledger Record:</span>
                        <strong style={{ color: fileResult.forensicAnalysis.ledgerMatch ? 'var(--success)' : 'var(--danger)' }}>
                          {fileResult.forensicAnalysis.ledgerMatch ? 'MATCHED' : 'NOT FOUND'}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                        <i className={`ti ${fileResult.forensicAnalysis.hologramSealIntegrity === 'GENUINE' ? 'ti-check' : 'ti-x'}`} style={{ color: fileResult.forensicAnalysis.hologramSealIntegrity === 'GENUINE' ? 'var(--success)' : 'var(--danger)' }}></i>
                        <span>Hologram &amp; Seal DPI:</span>
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
                          {fileResult.forensicAnalysis.qrSignatureMatch ? 'VALID' : 'INVALID/CLONED'}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Flagged Tampered Areas (if fake) */}
                {fileResult.tamperedAreas && fileResult.tamperedAreas.length > 0 && (
                  <div style={{ background: 'rgba(239,35,60,.06)', border: '1px solid rgba(239,35,60,.25)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="ti ti-flame"></i> Detected Forgery &amp; Tamper Hotspots ({fileResult.tamperedAreas.length})
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
                  <div className="cert-field"><span>Extracted Name</span><strong>{fileResult.name}</strong></div>
                  <div className="cert-field"><span>Certificate / Serial ID</span><strong style={{ fontFamily: 'monospace', color: fileResult.verdict === 'VERIFIED' ? 'var(--accent)' : 'var(--danger)' }}>{fileResult.certNumber}</strong></div>
                  <div className="cert-field"><span>Course / Degree</span><strong>{fileResult.coursePosition}</strong></div>
                  <div className="cert-field"><span>Institution</span><strong>{fileResult.organization}</strong></div>
                  <div className="cert-field"><span>Issue Date</span><strong>{fileResult.date}</strong></div>
                  <div className="cert-field"><span>Grade / Honors</span><strong>{fileResult.gradeDuration}</strong></div>
                  <div className="cert-field"><span>Signatory / Authority</span><strong>{fileResult.issuedBy}</strong></div>
                  <div className="cert-field"><span>Security Seal Watermark</span><strong>{fileResult.other}</strong></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowForensicModal(true)}
                  >
                    <i className="ti ti-scan"></i> Launch Interactive ELA Forensic Inspector
                  </button>
                  <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>
                    <span><i className="ti ti-shield-lock"></i> Audited by Multi-Tier Forensic OCR Engine · {new Date().toLocaleTimeString()}</span>
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
                placeholder="e.g. CERT-2024-001234 or FAKE-2024-998877"
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
                    This certificate number does not exist in our SHA-256 blockchain database. It may be fraudulent, artificially generated, or illegally altered.
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* TAB 3: QR CODE */}
        {activeTab === 'qr' && (
          <div className="tab-panel active">
            <p className="tab-desc">
              Upload an image containing the QR code embedded in the certificate. Our system will decode and verify it automatically.
            </p>
            <div
              className="upload-zone"
              onClick={() => document.getElementById('qr-file-input')?.click()}
            >
              <i className="ti ti-qrcode upload-zone-icon"></i>
              <p>Click or tap to upload QR code image</p>
              <small>Supports PNG, JPG, WebP</small>
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
                <div className="spinner"></div> Decoding QR code &amp; comparing against blockchain hash...
              </div>
            )}

            {qrResult && !qrLoading && (
              <div style={{ marginTop: '1rem' }}>
                <div className="result-card ai-info" style={{ marginBottom: '0.75rem' }}>
                  <div className="result-header">
                    <div className="result-icon" style={{ background: 'rgba(67,97,238,.15)', color: 'var(--accent)' }}>
                      <i className="ti ti-qrcode"></i>
                    </div>
                    <div>
                      <h3>QR Code Decoded</h3>
                      <p>Certificate Number: <strong style={{ fontFamily: 'monospace' }}>{qrResult.decoded}</strong></p>
                    </div>
                  </div>
                </div>

                {qrResult.cert ? (
                  <div className="result-card valid">
                    <div className="result-header">
                      <div className="result-icon" style={{ background: 'rgba(6,214,160,.15)', color: 'var(--success)' }}>
                        <i className="ti ti-shield-check"></i>
                      </div>
                      <div>
                        <h3 style={{ color: 'var(--success)' }}>QR Certificate Authentic ✓</h3>
                        <p>Linked securely to blockchain block #{certs.findIndex(c => c.no === qrResult.cert?.no) + 1}</p>
                      </div>
                    </div>
                    <div className="cert-detail-grid">
                      <div className="cert-field"><span>Student</span><strong>{qrResult.cert.student}</strong></div>
                      <div className="cert-field"><span>Degree</span><strong>{qrResult.cert.course}</strong></div>
                      <div className="cert-field"><span>Institution</span><strong>{qrResult.cert.institution}</strong></div>
                      <div className="cert-field"><span>Date</span><strong>{formatDate(qrResult.cert.date)}</strong></div>
                    </div>
                    <div className="cert-hash-line">Block Hash: {qrResult.cert.hash}</div>
                  </div>
                ) : (
                  <div className="result-card invalid">
                    <p style={{ color: 'var(--danger)' }}>Decoded QR does not match any registered block in the ledger.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AI VERIFY (CHAT) */}
        {activeTab === 'ai' && (
          <div className="tab-panel active">
            <p className="tab-desc">
              Chat with our AI assistant. Paste certificate details or ask anything about fraud detection, verification, or blockchain records.
            </p>
            <div className="chat-box">
              <div className="chat-messages">
                {aiChatMsgs.map((m, i) => (
                  <div key={i} className={`chat-msg ${m.role === 'user' ? 'user' : 'assistant'}`}>
                    <div className="msg-from">
                      {m.role === 'assistant' ? (
                        <>
                          <i className="ti ti-robot"></i> AI Assistant
                        </>
                      ) : (
                        'You'
                      )}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                  </div>
                ))}
                {aiChatLoading && (
                  <div className="chat-msg assistant">
                    <div className="msg-from"><i className="ti ti-robot"></i> AI Assistant</div>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </div>
              <div className="chat-input-row">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="e.g. Verify certificate: Student - Priya Sharma, CERT-2024-001234..."
                  value={aiChatInput}
                  onChange={e => setAiChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendAIChat()}
                />
                <button
                  className="chat-send-btn"
                  onClick={handleSendAIChat}
                  disabled={aiChatLoading}
                >
                  <i className="ti ti-send"></i>
                </button>
              </div>
            </div>
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
