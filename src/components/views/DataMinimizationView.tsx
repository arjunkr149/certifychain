import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Certificate, VerificationScopeId, FieldDisclosureLevel, MinimizationEvaluationResult, DataMinimizationPolicy } from '../../types';
import { DEFAULT_MINIMIZATION_POLICIES, evaluateDataMinimizationPolicy } from '../../utils/minimizationPolicy';

export const DataMinimizationView: React.FC = () => {
  const {
    certs,
    activeMinimizationScope,
    setActiveMinimizationScope,
    customMinimizationPolicy,
    setCustomMinimizationPolicy,
    getMinimizationPolicy,
    showToast,
  } = useApp();

  const [selectedCertNo, setSelectedCertNo] = useState<string>(certs[0]?.no || 'CERT-2024-001234');
  const [verifierInput, setVerifierInput] = useState<string>('');
  const [evaluation, setEvaluation] = useState<MinimizationEvaluationResult | null>(null);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'comparison' | 'matrix' | 'audit' | 'token'>('comparison');
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  // Selected certificate
  const activeCert: Certificate =
    certs.find(c => c.no === selectedCertNo) || certs[0] || {
      no: 'CERT-2024-001234',
      student: 'Priya Sharma',
      studentId: 'STU-2024-0011',
      course: 'B.Tech Computer Science',
      institution: 'GNIOT, Greater Noida',
      date: '2024-05-15',
      grade: '8.9 / 10',
      notes: 'First Class with Distinction',
      hash: 'a3f1c9d2e8b74f5a',
      prevHash: '0000000000000000',
      valid: true,
    };

  const activePolicy: DataMinimizationPolicy = getMinimizationPolicy(activeMinimizationScope);

  // Run evaluation whenever cert, scope, or custom policy changes
  useEffect(() => {
    let isCancelled = false;
    setEvaluating(true);

    const timer = setTimeout(async () => {
      const res = await evaluateDataMinimizationPolicy(activeCert, activePolicy, verifierInput);
      if (!isCancelled) {
        setEvaluation(res);
        setEvaluating(false);
      }
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [activeCert, activeMinimizationScope, customMinimizationPolicy, verifierInput]);

  // Update a field in custom policy
  const handleCustomFieldChange = (
    fieldKey: keyof DataMinimizationPolicy['fields'],
    level: FieldDisclosureLevel
  ) => {
    setCustomMinimizationPolicy(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldKey]: level,
      },
    }));
    setActiveMinimizationScope('custom');
    showToast(`Updated ${String(fieldKey)} to ${level}`, 'success');
  };

  const copyToken = () => {
    if (!evaluation) return;
    navigator.clipboard.writeText(evaluation.cryptographicProofToken);
    setCopiedToken(true);
    showToast('Cryptographic Disclosure Token copied to clipboard!', 'success');
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const exportJSON = () => {
    if (!evaluation) return;
    const jsonStr = JSON.stringify(evaluation, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minimized-credential-${evaluation.rawCertificate.no}-${evaluation.scopeId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported minimized credential JSON package', 'success');
  };

  const simulateVerifierCheck = () => {
    showToast(
      `Verifier Verified Claim: "${evaluation?.disclosedCertificate.student}" qualification confirmed under ${evaluation?.scopeName}. 0 unauthorized PII leaked.`,
      'success'
    );
  };

  const scopeList: Array<{ id: VerificationScopeId; label: string; icon: string; desc: string }> = [
    {
      id: 'employment',
      label: 'Employment Background Check',
      icon: 'ti-briefcase',
      desc: 'Corporate HR, candidate screening & recruiter verification',
    },
    {
      id: 'admissions',
      label: 'Higher Ed & Credit Transfer',
      icon: 'ti-school',
      desc: 'Academic admissions, course articulation & honors evaluation',
    },
    {
      id: 'licensing',
      label: 'Professional Licensing',
      icon: 'ti-certificate',
      desc: 'Statutory boards (Engineers, Medical, Bar Council registry)',
    },
    {
      id: 'student-discount',
      label: 'Student Privilege & Discount',
      icon: 'ti-tag',
      desc: 'Transit pass, software licenses & commercial discount proof',
    },
    {
      id: 'custom',
      label: 'Custom Policy Architect',
      icon: 'ti-adjustments-alt',
      desc: 'Interactive field-by-field granular disclosure permissions',
    },
  ];

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'DISCLOSED':
        return {
          bg: 'rgba(67,97,238,.12)',
          color: 'var(--accent)',
          border: 'rgba(67,97,238,.3)',
          label: 'Plaintext Disclosed',
          icon: 'ti-eye',
        };
      case 'MASKED':
        return {
          bg: 'rgba(247,127,0,.12)',
          color: 'var(--warn)',
          border: 'rgba(247,127,0,.3)',
          label: 'Masked / Pseudonym',
          icon: 'ti-eye-off',
        };
      case 'ZK_PROVED':
        return {
          bg: 'rgba(6,214,160,.12)',
          color: 'var(--success)',
          border: 'rgba(6,214,160,.3)',
          label: 'Zero-Knowledge Proof',
          icon: 'ti-shield-lock',
        };
      case 'REDACTED':
      default:
        return {
          bg: 'rgba(239,35,60,.12)',
          color: 'var(--danger)',
          border: 'rgba(239,35,60,.3)',
          label: 'Fully Redacted',
          icon: 'ti-lock',
        };
    }
  };

  return (
    <div className="page-content">
      {/* HEADER BANNER */}
      <div
        className="welcome-banner"
        style={{
          background: 'linear-gradient(135deg, rgba(67,97,238,.14), rgba(6,214,160,.08))',
          borderLeft: '4px solid var(--accent)',
        }}
      >
        <div>
          <h2>
            <i className="ti ti-filter-check" style={{ color: 'var(--accent)', marginRight: '8px' }}></i>
            Context-Sensitive Data Minimization Policy Engine
          </h2>
          <p>
            Enforcing GDPR Article 5(1)(c) &amp; DPDP Act (2023) Section 6 purpose limitation. Automatically filters and selectively discloses credential attributes based on the exact verifier persona and verification scope.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span
            style={{
              background: 'rgba(6,214,160,.15)',
              color: 'var(--success)',
              border: '1px solid rgba(6,214,160,.3)',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="ti ti-shield-check"></i>
            {evaluation?.reductionPercentage || 50}% Data Surface Reduction
          </span>
          <button
            onClick={simulateVerifierCheck}
            className="btn btn-primary"
            style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
          >
            <i className="ti ti-check"></i> Test Verifier Acceptance
          </button>
        </div>
      </div>

      {/* TOP CONTROLS: CERTIFICATE SELECTOR & SCOPE SELECTOR */}
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Certificate picker */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--muted)',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <i className="ti ti-certificate"></i> Select Source Credential to Filter:
          </label>
          <select
            className="form-control"
            value={selectedCertNo}
            onChange={e => setSelectedCertNo(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              fontSize: '0.9rem',
            }}
          >
            {certs.map(c => (
              <option key={c.no} value={c.no}>
                {c.no} — {c.student} ({c.course})
              </option>
            ))}
          </select>
          <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
            Issuer: <strong>{activeCert.institution}</strong> · Conferred: {activeCert.date}
          </div>
        </div>

        {/* Verifier Identity Specification */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--muted)',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <i className="ti ti-building"></i> Verifier Organization (Context):
          </label>
          <input
            type="text"
            className="form-control"
            placeholder={activePolicy.targetVerifier}
            value={verifierInput}
            onChange={e => setVerifierInput(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              fontSize: '0.9rem',
            }}
          />
          <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
            Legal Basis: <span style={{ color: 'var(--accent)' }}>{activePolicy.legalBasis}</span>
          </div>
        </div>
      </div>

      {/* VERIFICATION SCOPES GRID */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <i className="ti ti-target-arrow"></i> Active Verification Scope &amp; Purpose Limitation Profile
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {scopeList.map(s => {
            const isSelected = activeMinimizationScope === s.id;
            return (
              <div
                key={s.id}
                onClick={() => setActiveMinimizationScope(s.id)}
                style={{
                  background: isSelected ? 'rgba(67,97,238,.12)' : 'var(--panel)',
                  border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <i
                    className={`ti ${s.icon}`}
                    style={{
                      fontSize: '1.4rem',
                      color: isSelected ? 'var(--accent)' : 'var(--muted)',
                    }}
                  ></i>
                  {isSelected && (
                    <span
                      style={{
                        background: 'var(--accent)',
                        color: '#fff',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Active Scope
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem', color: isSelected ? 'var(--text)' : 'var(--text)' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '4px', lineHeight: 1.4 }}>
                  {s.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* VIEW TABS: COMPARISON | POLICY MATRIX | AUDIT LOG | CRYPTO TOKEN */}
      <div className="verify-tabs" style={{ marginBottom: '1.25rem' }}>
        <button
          className={`vtab ${activeTab === 'comparison' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparison')}
        >
          <i className="ti ti-columns"></i> Raw vs. Minimized Disclosures
        </button>
        <button
          className={`vtab ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveTab('matrix')}
        >
          <i className="ti ti-adjustments-alt"></i> Granular Policy Matrix
        </button>
        <button
          className={`vtab ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <i className="ti ti-file-text"></i> Legal Audit &amp; Rationale ({evaluation?.fieldDecisions.length || 8})
        </button>
        <button
          className={`vtab ${activeTab === 'token' ? 'active' : ''}`}
          onClick={() => setActiveTab('token')}
        >
          <i className="ti ti-key"></i> Minimized Disclosure Token
        </button>
      </div>

      {/* TAB 1: DUAL PANE COMPARISON */}
      {activeTab === 'comparison' && (
        <div>
          {/* Quick Metrics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Scope Purpose</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>
                {activePolicy.name}
              </div>
            </div>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Surface Reduction</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success)', marginTop: '2px' }}>
                {evaluation?.reductionPercentage || 50}% Minimized
              </div>
            </div>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--muted)', textTransform: 'uppercase' }}>PII Leakage Blocked</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)', marginTop: '2px' }}>
                {evaluation?.piiFieldsBlocked || 3} Sensitive Attributes
              </div>
            </div>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Cryptographic Proof</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px', fontFamily: 'monospace' }}>
                {evaluation?.cryptographicProofToken.slice(0, 15)}...
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* LEFT: RAW UNFILTERED CREDENTIAL */}
            <div
              style={{
                background: 'var(--panel)',
                border: '1px solid rgba(239,35,60,.3)',
                borderRadius: '12px',
                padding: '1.25rem',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                <div>
                  <span
                    style={{
                      background: 'rgba(239,35,60,.12)',
                      color: 'var(--danger)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      marginRight: '8px',
                    }}
                  >
                    Unrestricted Access
                  </span>
                  <strong style={{ fontSize: '0.98rem' }}>Raw Ledger Credential</strong>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i className="ti ti-alert-triangle"></i> Privacy Risk: High
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
                <div style={{ background: 'rgba(0,0,0,.15)', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>Certificate Serial:</div>
                  <div style={{ fontWeight: 600 }}>{activeCert.no}</div>
                </div>

                <div style={{ background: 'rgba(239,35,60,.08)', padding: '0.65rem 0.85rem', borderRadius: '6px', borderLeft: '3px solid var(--danger)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--danger)', fontWeight: 600 }}>Candidate Legal Name (Direct PII):</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>Exposed</span>
                  </div>
                  <div style={{ fontWeight: 600 }}>{activeCert.student}</div>
                </div>

                <div style={{ background: 'rgba(239,35,60,.08)', padding: '0.65rem 0.85rem', borderRadius: '6px', borderLeft: '3px solid var(--danger)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--danger)', fontWeight: 600 }}>University Student ID / Roll:</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>Exposed</span>
                  </div>
                  <div style={{ fontWeight: 600 }}>{activeCert.studentId}</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,.15)', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>Academic Program:</div>
                  <div style={{ fontWeight: 600 }}>{activeCert.course}</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,.15)', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>Conferral Date:</div>
                  <div style={{ fontWeight: 600 }}>{activeCert.date}</div>
                </div>

                <div style={{ background: 'rgba(247,127,0,.08)', padding: '0.65rem 0.85rem', borderRadius: '6px', borderLeft: '3px solid var(--warn)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--warn)', fontWeight: 600 }}>Exact Numerical GPA / Marks:</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--warn)' }}>Unminimized</span>
                  </div>
                  <div style={{ fontWeight: 600 }}>{activeCert.grade || 'N/A'}</div>
                </div>

                <div style={{ background: 'rgba(239,35,60,.08)', padding: '0.65rem 0.85rem', borderRadius: '6px', borderLeft: '3px solid var(--danger)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--danger)', fontWeight: 600 }}>Registrar Internal Remarks:</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>Exposed</span>
                  </div>
                  <div style={{ fontWeight: 500 }}>{activeCert.notes || 'None'}</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,.15)', padding: '0.65rem 0.85rem', borderRadius: '6px', wordBreak: 'break-all', fontSize: '0.78rem' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>Full SHA-256 Ledger Hash:</div>
                  <div style={{ fontFamily: 'monospace', color: 'var(--muted)' }}>{activeCert.hash}</div>
                </div>
              </div>
            </div>

            {/* RIGHT: CONTEXT-MINIMIZED DISCLOSURE */}
            <div
              style={{
                background: 'var(--panel)',
                border: '2px solid rgba(6,214,160,.4)',
                borderRadius: '12px',
                padding: '1.25rem',
                position: 'relative',
                boxShadow: '0 8px 30px rgba(6,214,160,.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                <div>
                  <span
                    style={{
                      background: 'rgba(6,214,160,.15)',
                      color: 'var(--success)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      marginRight: '8px',
                    }}
                  >
                    GDPR Art. 5(1)(c) Compliant
                  </span>
                  <strong style={{ fontSize: '0.98rem' }}>Scoped Minimized View</strong>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <i className="ti ti-shield-check"></i> Zero Excess PII
                </span>
              </div>

              {evaluating ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--muted)' }}>
                  <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                  Evaluating minimization policy rules for {activePolicy.name}...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
                  {/* Scope watermark header */}
                  <div style={{ background: 'rgba(67,97,238,.08)', padding: '0.6rem 0.85rem', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Verifier Binding: <strong>{evaluation?.verifierIdentity}</strong></span>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Purpose: {activePolicy.id}</span>
                  </div>

                  {evaluation?.fieldDecisions.map(d => {
                    const badge = getActionBadge(d.action);
                    return (
                      <div
                        key={d.field}
                        style={{
                          background: 'rgba(0,0,0,.15)',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '6px',
                          borderLeft: `3px solid ${badge.color}`,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                          <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>{d.fieldLabel}:</span>
                          <span
                            style={{
                              background: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                              borderRadius: '4px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '1px 6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <i className={`ti ${badge.icon}`}></i> {badge.label}
                          </span>
                        </div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: d.action === 'REDACTED' ? 'var(--muted)' : 'var(--text)',
                            fontStyle: d.action === 'REDACTED' ? 'italic' : 'normal',
                          }}
                        >
                          {d.disclosedValue}
                        </div>
                      </div>
                    );
                  })}

                  {/* ZK Predicates Evaluated */}
                  {evaluation?.disclosedCertificate.zkPredicateResults && evaluation.disclosedCertificate.zkPredicateResults.length > 0 && (
                    <div style={{ background: 'rgba(6,214,160,.08)', border: '1px solid rgba(6,214,160,.25)', borderRadius: '8px', padding: '0.75rem', marginTop: '0.25rem' }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--success)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <i className="ti ti-lock-check"></i> Zero-Knowledge Predicates Verified Under Scope:
                      </div>
                      {evaluation.disclosedCertificate.zkPredicateResults.map((zk, idx) => (
                        <div key={idx} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                          <span>✓ {zk.label}</span>
                          <span style={{ color: 'var(--success)', fontWeight: 700 }}>SATISFIED</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={copyToken}
                      className="btn btn-primary"
                      style={{ flex: 1, fontSize: '0.82rem', padding: '0.55rem' }}
                    >
                      <i className={`ti ${copiedToken ? 'ti-check' : 'ti-copy'}`}></i>
                      {copiedToken ? 'Token Copied!' : 'Copy Disclosure Token'}
                    </button>
                    <button
                      onClick={exportJSON}
                      className="btn btn-ghost"
                      style={{ fontSize: '0.82rem', padding: '0.55rem 0.85rem' }}
                    >
                      <i className="ti ti-download"></i> Export JSON
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GRANULAR POLICY MATRIX */}
      {activeTab === 'matrix' && (
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>
                <i className="ti ti-table"></i> Credential Field Disclosure Policy Matrix
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>
                Configure exact disclosure permissions per credential field. Any custom adjustment automatically updates the custom scope.
              </p>
            </div>
            {activeMinimizationScope !== 'custom' && (
              <button
                className="btn btn-ghost"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                onClick={() => {
                  setCustomMinimizationPolicy({
                    ...activePolicy,
                    id: 'custom',
                    name: `Custom (Cloned from ${activePolicy.name})`,
                  });
                  setActiveMinimizationScope('custom');
                  showToast('Cloned scope to Custom Policy Architect for editing', 'success');
                }}
              >
                <i className="ti ti-copy"></i> Clone to Custom Architect
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="blockchain-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Credential Attribute</th>
                  <th style={{ width: '20%' }}>Sample Raw Value</th>
                  <th style={{ width: '38%' }}>Scope Disclosure Level</th>
                  <th style={{ width: '20%' }}>Privacy Enforcement</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    { key: 'studentName', label: 'Candidate Legal Name', sample: activeCert.student, icon: 'ti-user' },
                    { key: 'studentId', label: 'Student Roll / Enrollment ID', sample: activeCert.studentId, icon: 'ti-id' },
                    { key: 'course', label: 'Academic Program / Course', sample: activeCert.course, icon: 'ti-book' },
                    { key: 'institution', label: 'Accredited Institution', sample: activeCert.institution, icon: 'ti-building' },
                    { key: 'date', label: 'Conferral / Issue Date', sample: activeCert.date, icon: 'ti-calendar' },
                    { key: 'grade', label: 'Grade / CGPA & Percentage', sample: activeCert.grade || '8.9 / 10', icon: 'ti-chart-bar' },
                    { key: 'notes', label: 'Registrar Internal Notes', sample: activeCert.notes || 'First Class', icon: 'ti-notes' },
                    { key: 'blockchainHash', label: 'Cryptographic Ledger Hash', sample: activeCert.hash, icon: 'ti-link' },
                  ] as const
                ).map(row => {
                  const currentLevel = activePolicy.fields[row.key];
                  return (
                    <tr key={row.key}>
                      <td style={{ fontWeight: 600 }}>
                        <i className={`ti ${row.icon}`} style={{ marginRight: '6px', color: 'var(--muted)' }}></i>
                        {row.label}
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: '0.84rem' }}>{row.sample}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {(['FULL', 'MASKED', 'REDACTED', 'YEAR_ONLY', 'CATEGORY_ONLY', 'ZK_PREDICATE'] as FieldDisclosureLevel[])
                            .filter(lvl => {
                              if (row.key === 'date') return ['FULL', 'YEAR_ONLY', 'REDACTED'].includes(lvl);
                              if (row.key === 'grade') return ['FULL', 'CATEGORY_ONLY', 'ZK_PREDICATE', 'REDACTED'].includes(lvl);
                              return ['FULL', 'MASKED', 'REDACTED'].includes(lvl);
                            })
                            .map(lvl => {
                              const active = currentLevel === lvl;
                              return (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => handleCustomFieldChange(row.key, lvl)}
                                  style={{
                                    fontSize: '0.72rem',
                                    padding: '3px 8px',
                                    borderRadius: '5px',
                                    border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
                                    background: active ? 'var(--accent)' : 'rgba(255,255,255,.02)',
                                    color: active ? '#fff' : 'var(--muted)',
                                    cursor: 'pointer',
                                    fontWeight: active ? 700 : 400,
                                  }}
                                >
                                  {lvl.replace('_', ' ')}
                                </button>
                              );
                            })}
                        </div>
                      </td>
                      <td>
                        {currentLevel === 'REDACTED' ? (
                          <span style={{ color: 'var(--danger)', fontSize: '0.78rem', fontWeight: 600 }}>
                            <i className="ti ti-lock"></i> Suppressed
                          </span>
                        ) : currentLevel === 'MASKED' ? (
                          <span style={{ color: 'var(--warn)', fontSize: '0.78rem', fontWeight: 600 }}>
                            <i className="ti ti-eye-off"></i> Pseudonymized
                          </span>
                        ) : currentLevel === 'ZK_PREDICATE' ? (
                          <span style={{ color: 'var(--success)', fontSize: '0.78rem', fontWeight: 600 }}>
                            <i className="ti ti-shield-lock"></i> ZK Proved
                          </span>
                        ) : currentLevel === 'YEAR_ONLY' ? (
                          <span style={{ color: 'var(--accent)', fontSize: '0.78rem', fontWeight: 600 }}>
                            <i className="ti ti-calendar"></i> Year Coarsened
                          </span>
                        ) : (
                          <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>
                            <i className="ti ti-check"></i> Standard Plaintext
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LEGAL AUDIT LOG */}
      {activeTab === 'audit' && (
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>
              <i className="ti ti-file-text"></i> Statutory Data Minimization Audit Trail
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>
              Audit ledger justifying every field transformation according to GDPR Article 5(1)(c) and India DPDP Act 2023 Section 6 purpose limitation requirements.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {evaluation?.fieldDecisions.map((d, index) => {
              const badge = getActionBadge(d.action);
              return (
                <div
                  key={index}
                  style={{
                    background: 'rgba(0,0,0,.15)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {index + 1}. {d.fieldLabel}
                    </div>
                    <span
                      style={{
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem', fontSize: '0.82rem' }}>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Raw Value: </span>
                      <span style={{ fontFamily: 'monospace' }}>{d.originalValue}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--muted)' }}>Disclosed Under Scope: </span>
                      <strong style={{ color: badge.color }}>{d.disclosedValue}</strong>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: '4px', marginTop: '2px' }}>
                    <i className="ti ti-gavel" style={{ color: 'var(--accent)', marginRight: '4px' }}></i>
                    <strong>Legal Rationale:</strong> {d.legalRationale}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CRYPTOGRAPHIC DISCLOSURE TOKEN */}
      {activeTab === 'token' && (
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>
              <i className="ti ti-key"></i> Cryptographically Signed Disclosure Token
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>
              This tamper-proof cryptographic token can be safely shared with the verifier. It contains only the scope-permitted attributes bound to the SHA-256 blockchain proof.
            </p>
          </div>

          <div
            style={{
              background: 'rgba(0,0,0,.25)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '1rem',
              fontFamily: 'monospace',
              fontSize: '0.88rem',
              color: 'var(--success)',
              wordBreak: 'break-all',
              marginBottom: '1rem',
            }}
          >
            {evaluation?.cryptographicProofToken}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
            <div style={{ background: 'rgba(255,255,255,.02)', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
              <div style={{ color: 'var(--muted)' }}>Ephemeral Nonce:</div>
              <div style={{ fontWeight: 600 }}>{evaluation?.disclosureNonce}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.02)', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
              <div style={{ color: 'var(--muted)' }}>Bound Verifier:</div>
              <div style={{ fontWeight: 600 }}>{evaluation?.verifierIdentity}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.02)', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
              <div style={{ color: 'var(--muted)' }}>Validity Expiration:</div>
              <div style={{ fontWeight: 600, color: 'var(--warn)' }}>{evaluation?.expiresIn}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={copyToken} className="btn btn-primary" style={{ fontSize: '0.84rem' }}>
              <i className={`ti ${copiedToken ? 'ti-check' : 'ti-copy'}`}></i>
              {copiedToken ? 'Copied to Clipboard!' : 'Copy Disclosure Token'}
            </button>
            <button onClick={exportJSON} className="btn btn-ghost" style={{ fontSize: '0.84rem' }}>
              <i className="ti ti-download"></i> Download Full Verifier Package JSON
            </button>
            <button onClick={simulateVerifierCheck} className="btn btn-ghost" style={{ fontSize: '0.84rem', borderColor: 'var(--success)', color: 'var(--success)' }}>
              <i className="ti ti-badge-check"></i> Simulate Verifier Acceptance
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
