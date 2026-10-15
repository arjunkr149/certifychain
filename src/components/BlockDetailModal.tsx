import React from 'react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/blockchain';

export const BlockDetailModal: React.FC = () => {
  const { selectedBlockForModal, setSelectedBlockForModal, tamperBlock } = useApp();

  if (!selectedBlockForModal) return null;

  const { cert, blockNum } = selectedBlockForModal;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={() => setSelectedBlockForModal(null)}
    >
      <div
        className="card"
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          border: '1px solid var(--accent)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <h2>
            <i className="ti ti-cube"></i> Block #{blockNum} Specifications
          </h2>
          <button
            onClick={() => setSelectedBlockForModal(null)}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="cert-field">
            <span>Certificate Identifier</span>
            <strong style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{cert.no}</strong>
          </div>

          <div className="cert-field">
            <span>Student Name & ID</span>
            <strong>{cert.student} ({cert.studentId})</strong>
          </div>

          <div className="cert-field">
            <span>Course & Program</span>
            <strong>{cert.course}</strong>
          </div>

          <div className="cert-field">
            <span>Issuing Authority</span>
            <strong>{cert.institution}</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="cert-field">
              <span>Issue Date</span>
              <strong>{formatDate(cert.date)}</strong>
            </div>
            <div className="cert-field">
              <span>Grade / Honours</span>
              <strong>{cert.grade || 'First Class'}</strong>
            </div>
          </div>

          {cert.notes && (
            <div className="cert-field">
              <span>Remarks</span>
              <strong>{cert.notes}</strong>
            </div>
          )}

          <div className="cert-field">
            <span>Current SHA-256 Hash</span>
            <strong style={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all', color: 'var(--accent)' }}>
              {cert.hash}
            </strong>
          </div>

          <div className="cert-field">
            <span>Previous Linked Hash (prevHash)</span>
            <strong style={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all', color: 'var(--muted)' }}>
              {cert.prevHash}
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--warn)', borderColor: 'rgba(255, 209, 102, 0.3)' }}
              onClick={() => {
                tamperBlock(blockNum - 1);
                setSelectedBlockForModal(null);
              }}
              title="Demonstrates what happens when block data is tampered with"
            >
              <i className="ti ti-alert-triangle"></i> Simulate Block Tamper
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setSelectedBlockForModal(null)}
            >
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
