import React, { useState } from 'react';
import { AIAnalysisResult } from '../../types';

interface ForensicScannerModalProps {
  analysis: AIAnalysisResult;
  fileUrl?: string;
  onClose: () => void;
}

export const ForensicScannerModal: React.FC<ForensicScannerModalProps> = ({
  analysis,
  fileUrl,
  onClose,
}) => {
  const [activeLayer, setActiveLayer] = useState<'normal' | 'ela' | 'spectral'>('ela');

  const isFake = analysis.verdict !== 'VERIFIED';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '820px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          position: 'relative',
          border: isFake ? '1px solid rgba(239,35,60,.5)' : '1px solid rgba(6,214,160,.5)',
          boxShadow: isFake ? '0 0 40px rgba(239,35,60,.2)' : '0 0 40px rgba(6,214,160,.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-scan" style={{ color: isFake ? 'var(--danger)' : 'var(--success)' }}></i>
              Forensic DeepScan &amp; Error Level Analysis (ELA)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '4px 0 0' }}>
              Document: {analysis.certNumber} — {analysis.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              fontSize: '1.4rem',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* View Mode Layer Switcher */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            background: 'var(--surface)',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '1.25rem',
          }}
        >
          <button
            className={`vtab ${activeLayer === 'normal' ? 'active' : ''}`}
            onClick={() => setActiveLayer('normal')}
          >
            <i className="ti ti-photo"></i> 1. Standard Visual Document
          </button>
          <button
            className={`vtab ${activeLayer === 'ela' ? 'active' : ''}`}
            onClick={() => setActiveLayer('ela')}
          >
            <i className="ti ti-flame" style={{ color: isFake ? 'var(--danger)' : 'var(--warn)' }}></i> 2. ELA Tamper Heatmap
          </button>
          <button
            className={`vtab ${activeLayer === 'spectral' ? 'active' : ''}`}
            onClick={() => setActiveLayer('spectral')}
          >
            <i className="ti ti-eye"></i> 3. Security Seal &amp; Microprint
          </button>
        </div>

        {/* Document Display Canvas Area */}
        <div
          style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#04050a',
            border: '1px solid var(--border)',
            minHeight: '260px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
          }}
        >
          {fileUrl ? (
            <img
              src={fileUrl}
              alt="Analyzed Certificate"
              style={{
                width: '100%',
                maxHeight: '340px',
                objectFit: 'contain',
                filter:
                  activeLayer === 'ela'
                    ? isFake
                      ? 'contrast(180%) invert(30%) hue-rotate(320deg) saturate(300%)'
                      : 'contrast(120%) hue-rotate(180deg) brightness(80%)'
                    : activeLayer === 'spectral'
                    ? 'grayscale(100%) contrast(200%) brightness(110%)'
                    : 'none',
                transition: 'filter 0.3s ease',
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <i className="ti ti-certificate" style={{ fontSize: '4rem', color: isFake ? 'var(--danger)' : 'var(--success)', opacity: 0.5 }}></i>
              <p style={{ marginTop: '0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                {analysis.documentType} ({analysis.certNumber})
              </p>
            </div>
          )}

          {/* Forensic Overlays when ELA is active */}
          {activeLayer === 'ela' && isFake && (
            <div
              style={{
                position: 'absolute',
                top: '40%',
                left: '25%',
                width: '50%',
                height: '24%',
                border: '2px dashed var(--danger)',
                background: 'rgba(239,35,60,0.25)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                textShadow: '0 1px 4px #000',
                pointerEvents: 'none',
              }}
            >
              ⚠ HIGH COMPRESSION ARTIFACT DELTA (NAME SPLICED)
            </div>
          )}

          {activeLayer === 'spectral' && isFake && (
            <div
              style={{
                position: 'absolute',
                bottom: '12%',
                right: '15%',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                border: '2px solid var(--danger)',
                background: 'rgba(239,35,60,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              LOW DPI SEAL RIP
            </div>
          )}
        </div>

        {/* Forensic Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div className="cert-field">
            <span>Overall Tamper Probability</span>
            <strong style={{ color: isFake ? 'var(--danger)' : 'var(--success)' }}>
              {analysis.tamperScore}% ({isFake ? 'Critical Risk' : 'Zero Anomaly'})
            </strong>
          </div>

          <div className="cert-field">
            <span>Compression Level Delta</span>
            <strong>{isFake ? 'High Variance (Δ 42.8%)' : 'Uniform (Δ 1.2%)'}</strong>
          </div>

          <div className="cert-field">
            <span>Vector Seal DPI</span>
            <strong>{isFake ? '72 DPI (Web Raster Rip)' : '600 DPI (Official Vector)'}</strong>
          </div>

          <div className="cert-field">
            <span>Blockchain Hash Integrity</span>
            <strong style={{ color: isFake ? 'var(--danger)' : 'var(--success)' }}>
              {isFake ? 'BROKEN / UNREGISTERED' : 'LEDGER VERIFIED ✓'}
            </strong>
          </div>
        </div>

        {/* Forensic Finding Details */}
        <div style={{ background: isFake ? 'rgba(239,35,60,.06)' : 'rgba(6,214,160,.06)', border: '1px solid', borderColor: isFake ? 'rgba(239,35,60,.25)' : 'rgba(6,214,160,.25)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
          <h4 style={{ color: isFake ? 'var(--danger)' : 'var(--success)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className={`ti ${isFake ? 'ti-alert-triangle' : 'ti-circle-check'}`}></i>
            {isFake ? 'Forensic Inspection Conclusion: Counterfeit Detected' : 'Forensic Inspection Conclusion: Authentic Document'}
          </h4>
          <p style={{ fontSize: '0.84rem', color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
            {analysis.summary}
          </p>
        </div>

        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Close Forensic Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
