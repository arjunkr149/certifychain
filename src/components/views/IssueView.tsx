import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { Certificate } from '../../types';
import { formatDate } from '../../utils/blockchain';

export const IssueView: React.FC = () => {
  const { user, issuedCerts, issueCertificate, showToast } = useApp();

  const [student, setStudent] = useState('');
  const [studentId, setStudentId] = useState('');
  const [course, setCourse] = useState('');
  const [institution, setInstitution] = useState(user?.institution || 'GNIOT, Greater Noida');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [grade, setGrade] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [issuedCert, setIssuedCert] = useState<Certificate | null>(null);

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student.trim() || !studentId.trim() || !course.trim() || !institution.trim() || !date) {
      showToast('Please fill out all required fields (*)', 'error');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const created = issueCertificate({
        student: student.trim(),
        studentId: studentId.trim(),
        course: course.trim(),
        institution: institution.trim(),
        date,
        grade: grade.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setLoading(false);
      setIssuedCert(created);
      showToast('Certificate issued & recorded on blockchain!', 'success');
    }, 1400);
  };

  useEffect(() => {
    if (issuedCert && qrCanvasRef.current) {
      const qrData = `${issuedCert.no}|${issuedCert.student}|${issuedCert.course}|${issuedCert.hash}`;
      QRCode.toCanvas(qrCanvasRef.current, qrData, {
        width: 160,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      }).catch(err => console.error('QR rendering error:', err));
    }
  }, [issuedCert]);

  const handleClear = () => {
    setStudent('');
    setStudentId('');
    setCourse('');
    setInstitution(user?.institution || 'GNIOT, Greater Noida');
    setDate(new Date().toISOString().split('T')[0]);
    setGrade('');
    setNotes('');
    setIssuedCert(null);
  };

  return (
    <div className="page-content">
      {/* FORM CARD */}
      <div className="card">
        <div className="card-header">
          <h2>
            <i className="ti ti-certificate"></i> New Certificate Issuance
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="issue-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Student Name *</label>
              <div className="input-wrap">
                <i className="ti ti-user"></i>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={student}
                  onChange={e => setStudent(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Student ID *</label>
              <div className="input-wrap">
                <i className="ti ti-id"></i>
                <input
                  type="text"
                  placeholder="e.g. STU-2024-0042"
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Course / Degree *</label>
              <div className="input-wrap">
                <i className="ti ti-book"></i>
                <input
                  type="text"
                  placeholder="e.g. B.Tech Computer Science"
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Institution *</label>
              <div className="input-wrap">
                <i className="ti ti-building"></i>
                <input
                  type="text"
                  placeholder="e.g. GNIOT, Greater Noida"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Issue Date *</label>
              <div className="input-wrap">
                <i className="ti ti-calendar"></i>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Grade / CGPA</label>
              <div className="input-wrap">
                <i className="ti ti-star"></i>
                <input
                  type="text"
                  placeholder="e.g. 8.7 / 10"
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Additional Notes / Honours</label>
              <div className="input-wrap">
                <i className="ti ti-note"></i>
                <input
                  type="text"
                  placeholder="e.g. Distinction, Gold Medal, First Class"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              <i className="ti ti-certificate"></i> Issue Certificate on Blockchain
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleClear}>
              <i className="ti ti-x"></i> Clear Form
            </button>
          </div>

          {loading && (
            <div className="loading-msg">
              <div className="spinner"></div> Recording on cryptographic blockchain...
            </div>
          )}

          {issuedCert && !loading && (
            <div className="result-card valid" style={{ marginTop: '1rem' }}>
              <div className="result-header">
                <div className="result-icon" style={{ background: 'rgba(6,214,160,.15)', color: 'var(--success)' }}>
                  <i className="ti ti-check"></i>
                </div>
                <div>
                  <h3 style={{ color: 'var(--success)' }}>Certificate Issued Successfully!</h3>
                  <p>
                    Certificate No: <strong style={{ fontFamily: 'monospace' }}>{issuedCert.no}</strong> — permanently immutabilized on blockchain
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* ISSUED CERTIFICATE PREVIEW + QR */}
      {issuedCert && (
        <div className="card" id="cert-preview-card" style={{ marginTop: '1.5rem' }}>
          <div className="card-header">
            <h2>
              <i className="ti ti-eye"></i> Issued Certificate Preview
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>
              <i className="ti ti-printer"></i> Print Certificate
            </button>
          </div>
          <div className="cert-preview-grid">
            {/* Certificate Paper */}
            <div className="cert-paper">
              <div className="cert-paper-header">
                <i className="ti ti-certificate"></i>
                <h3>Certificate of Completion</h3>
                <p>CertifyChain Verified Official Credential</p>
              </div>
              <div className="cert-paper-body">
                <p className="cert-presented">This is to certify that</p>
                <h2 className="cert-student-name">{issuedCert.student}</h2>
                <p className="cert-course-label">has successfully completed the program</p>
                <h3 className="cert-course">{issuedCert.course}</h3>
                <div className="cert-meta">
                  <div>
                    <span>Institution</span>
                    <strong>{issuedCert.institution}</strong>
                  </div>
                  <div>
                    <span>Date</span>
                    <strong>{formatDate(issuedCert.date)}</strong>
                  </div>
                  <div>
                    <span>Grade / Status</span>
                    <strong>{issuedCert.grade || 'First Class'}</strong>
                  </div>
                  <div>
                    <span>Cert. No.</span>
                    <strong style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{issuedCert.no}</strong>
                  </div>
                </div>
                <div className="cert-hash-line">
                  SHA-256 Hash: {issuedCert.hash} | Prev: {issuedCert.prevHash}
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="cert-qr-box">
              <p className="qr-label">Scan to Verify</p>
              <canvas ref={qrCanvasRef} style={{ borderRadius: '8px', maxWidth: '100%' }}></canvas>
              <p className="qr-cert-no">{issuedCert.no}</p>
            </div>
          </div>
        </div>
      )}

      {/* RECENTLY ISSUED TABLE */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h2>
            <i className="ti ti-history"></i> Recently Issued Certificates
          </h2>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cert. No.</th>
                <th>Student</th>
                <th>Course</th>
                <th>Institution</th>
                <th>Date</th>
                <th>Hash</th>
              </tr>
            </thead>
            <tbody>
              {issuedCerts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '1.5rem' }}>
                    No certificates issued in this session yet
                  </td>
                </tr>
              ) : (
                [...issuedCerts].reverse().map(c => (
                  <tr key={c.no}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent)' }}>
                      {c.no}
                    </td>
                    <td>{c.student}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.84rem' }}>{c.course}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.84rem' }}>{c.institution}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{formatDate(c.date)}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--muted)' }}>
                      {c.hash}
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
