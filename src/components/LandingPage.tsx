import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Navbar } from './Navbar';

export const LandingPage: React.FC = () => {
  const { setPage, showToast } = useApp();

  // Contact form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill out all contact fields.', 'error');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
      showToast('Your message has been sent successfully!', 'success');
      setTimeout(() => setSubmitted(false), 5000);
    }, 1200);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      <div className="grid-bg"></div>
      <div className="glow-orb orb1"></div>
      <div className="glow-orb orb2"></div>

      <Navbar />

      {/* HERO SECTION */}
      <section id="hero" className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <i className="ti ti-shield-check"></i> Blockchain-Secured · AI-Powered
          </div>
          <h1 className="hero-title">Verify Any Certificate — Instantly &amp; Reliably</h1>
          <p className="hero-sub">
            Decentralized, tamper-resistant certificate verification for students,
            employers, and institutions. Powered by blockchain hashing and AI fraud detection.
          </p>
          <div className="hero-btns">
            <button
              onClick={() => setPage('login')}
              className="btn btn-primary btn-lg"
            >
              <i className="ti ti-login"></i> Admin Login
            </button>
            <a href="#features" className="btn btn-ghost btn-lg">
              <i className="ti ti-arrow-down"></i> Learn More
            </a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-num">50K+</span>
              <span className="stat-lbl">Certificates Verified</span>
            </div>
            <div className="hero-stat">
              <span className="stat-num">99.9%</span>
              <span className="stat-lbl">Accuracy Rate</span>
            </div>
            <div className="hero-stat">
              <span className="stat-num">200+</span>
              <span className="stat-lbl">Institutions</span>
            </div>
            <div className="hero-stat">
              <span className="stat-num">&lt;2s</span>
              <span className="stat-lbl">Verification Time</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-sub">
            A complete platform for certificate issuance, verification, and fraud detection
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="ti ti-hash"></i>
              </div>
              <h3>Certificate Number Verification</h3>
              <p>Enter any certificate number for instant blockchain-backed verification with a full audit trail.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="ti ti-qrcode"></i>
              </div>
              <h3>QR Code Scanning</h3>
              <p>Upload or scan QR codes embedded in certificates for instant decoded verification results.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="ti ti-file-search"></i>
              </div>
              <h3>Document Upload &amp; AI OCR</h3>
              <p>Upload certificate PDFs or images — our AI extracts and verifies the data automatically.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="ti ti-robot"></i>
              </div>
              <h3>AI &amp; Forensic Fake Detection</h3>
              <p>Detects Photoshop alterations, font-kerning anomalies, fake seals, and mismatched block hashes with high confidence.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="ti ti-radar"></i>
              </div>
              <h3>Privacy Leakage Radar</h3>
              <p>Continuous automated auditing for PII leaks (Aadhaar, contact info) with Zero-Knowledge pseudonymization.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="ti ti-link"></i>
              </div>
              <h3>Blockchain Hash Chain</h3>
              <p>Every certificate is part of an immutable hash chain — tampering is immediately detectable.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="ti ti-chart-bar"></i>
              </div>
              <h3>Analytics &amp; Security Dashboard</h3>
              <p>Real-time insights on verification activity, fraud attempts, and certificate issuance trends.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="about-section">
        <div className="container about-grid">
          <div className="about-text">
            <h2 className="section-title" style={{ textAlign: 'left' }}>About CertifyChain</h2>
            <p>
              CertifyChain is an open-source, decentralized certificate verification platform built for the digital era.
              We use blockchain-inspired hash chaining to ensure every certificate is tamper-proof and permanently auditable.
            </p>
            <ul className="about-list">
              <li><i className="ti ti-check"></i> Easy onboarding for colleges, companies, and agencies</li>
              <li><i className="ti ti-check"></i> AI-powered fraud detection and OCR analysis</li>
              <li><i className="ti ti-check"></i> GDPR-friendly, privacy-first design</li>
              <li><i className="ti ti-check"></i> Scalable REST API for enterprise integrations</li>
              <li><i className="ti ti-check"></i> Verify via number, QR code, or file upload</li>
            </ul>
          </div>
          <div className="about-image">
            <div className="about-visual">
              <i className="ti ti-certificate" style={{ fontSize: '6rem', color: 'var(--accent)', opacity: 0.3 }}></i>
              <div className="about-tag">Blockchain Secured</div>
              <div className="about-tag" style={{ animationDelay: '0.4s' }}>AI Powered</div>
              <div className="about-tag" style={{ animationDelay: '0.8s' }}>Tamper Proof</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="how-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-sub">Three simple steps to verify any certificate</p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <i className="ti ti-upload step-icon"></i>
              <h3>Submit Certificate</h3>
              <p>Enter a certificate number, upload a QR code, or drop a certificate file.</p>
            </div>
            <div className="step-arrow"><i className="ti ti-arrow-right"></i></div>
            <div className="step-card">
              <div className="step-number">02</div>
              <i className="ti ti-cpu step-icon"></i>
              <h3>AI + Blockchain Check</h3>
              <p>Our AI extracts data and verifies the hash against the blockchain record.</p>
            </div>
            <div className="step-arrow"><i className="ti ti-arrow-right"></i></div>
            <div className="step-card">
              <div className="step-number">03</div>
              <i className="ti ti-shield-check step-icon"></i>
              <h3>Instant Result</h3>
              <p>Receive a detailed verification report with blockchain proof in under 2 seconds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section id="team" className="team-section">
        <div className="container">
          <h2 className="section-title">Made By</h2>
          <p className="section-sub">Built with passion and dedication</p>
          <div className="team-grid">
            <div className="team-card">
              <div className="team-avatar">AK</div>
              <h4>Arjun Kumar</h4>
              <p>Lead Developer</p>
              <div className="team-links">
                <a href="https://github.com/arjunkr149" target="_blank" rel="noreferrer">
                  <i className="ti ti-brand-github"></i>
                </a>
                <a href="mailto:aurevia69@gmail.com">
                  <i className="ti ti-mail"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="faq-section">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            <details className="faq-item">
              <summary>How is this tamper-proof?</summary>
              <p>Hash chaining records all certificate changes — every certificate is linked to the previous one via SHA-256 hashing. Any modification immediately breaks the chain and is detected.</p>
            </details>
            <details className="faq-item">
              <summary>Who can issue certificates?</summary>
              <p>Only authenticated admins — colleges, authorities, and authorized institutions — can create new certificate records through the secure admin dashboard.</p>
            </details>
            <details className="faq-item">
              <summary>Is my data safe?</summary>
              <p>All passwords are encrypted. Personal data is never shared with third parties. We follow GDPR-compliant, privacy-first standards.</p>
            </details>
            <details className="faq-item">
              <summary>What file formats are supported for AI verification?</summary>
              <p>You can upload certificates in JPG, PNG, WEBP, and GIF formats. Our AI processes both scanned copies and digital camera photos.</p>
            </details>
            <details className="faq-item">
              <summary>Can this integrate with our university LMS?</summary>
              <p>Yes, CertifyChain provides modular REST endpoints that allow seamless batch issuance and programmatic verification directly inside university SIS or LMS systems.</p>
            </details>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="contact-section">
        <div className="container contact-grid">
          <div>
            <h2 className="section-title" style={{ textAlign: 'left' }}>Get In Touch</h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginTop: '0.5rem' }}>
              Have questions or need institutional partnership? Reach out to our engineering team.
            </p>
            <ul className="contact-list">
              <li>
                <i className="ti ti-mail"></i>
                <a href="mailto:aurevia69@gmail.com">aurevia69@gmail.com</a>
              </li>
              <li>
                <i className="ti ti-brand-github"></i>
                <a href="https://github.com/arjunkr149" target="_blank" rel="noreferrer">github.com/arjunkr149</a>
              </li>
              <li>
                <i className="ti ti-map-pin"></i>
                <span>Greater Noida, Uttar Pradesh, India</span>
              </li>
            </ul>
            <div className="social-links">
              <a href="https://github.com/arjunkr149" target="_blank" rel="noreferrer"><i className="ti ti-brand-github"></i></a>
              <a href="mailto:aurevia69@gmail.com"><i className="ti ti-mail"></i></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer"><i className="ti ti-brand-linkedin"></i></a>
            </div>
          </div>

          <div className="contact-form-box">
            <div className="cf-heading">
              <div className="cf-icon"><i className="ti ti-send"></i></div>
              <div>
                <h3 className="cf-title">Send a Message</h3>
                <p className="cf-subtitle">Typical response time: &lt; 2 hours</p>
              </div>
            </div>

            <form onSubmit={handleContactSubmit}>
              <div className="cf-field">
                <label className="cf-label"><i className="ti ti-user"></i> Your Name</label>
                <div className="cf-input-wrap">
                  <input
                    type="text"
                    className="cf-input"
                    placeholder="Arjun Kumar"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                  <div className="cf-focus-bar"></div>
                </div>
              </div>

              <div className="cf-field">
                <label className="cf-label"><i className="ti ti-mail"></i> Email Address</label>
                <div className="cf-input-wrap">
                  <input
                    type="email"
                    className="cf-input"
                    placeholder="user@institution.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <div className="cf-focus-bar"></div>
                </div>
              </div>

              <div className="cf-field">
                <label className="cf-label"><i className="ti ti-category"></i> Topic</label>
                <div className="cf-input-wrap cf-select-wrap">
                  <select
                    className="cf-input cf-select"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Institutional Integration">Institutional Integration</option>
                    <option value="API Access">API Access</option>
                    <option value="Report Bug">Report Issue</option>
                  </select>
                  <i className="ti ti-chevron-down cf-select-arrow"></i>
                </div>
              </div>

              <div className="cf-field">
                <label className="cf-label"><i className="ti ti-message"></i> Message</label>
                <div className="cf-input-wrap">
                  <textarea
                    className="cf-input cf-textarea"
                    placeholder="Tell us about your verification needs..."
                    maxLength={500}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                  ></textarea>
                  <span className={`cf-char-count ${message.length > 450 ? 'limit' : message.length > 350 ? 'warn' : ''}`}>
                    {message.length} / 500
                  </span>
                  <div className="cf-focus-bar"></div>
                </div>
              </div>

              <button type="submit" className="cf-submit-btn" disabled={submitting}>
                {submitting ? (
                  <span className="cf-btn-loading">
                    <span className="cf-spinner"></span> Sending Message...
                  </span>
                ) : submitted ? (
                  <span className="cf-btn-sent">
                    <i className="ti ti-check"></i> Sent!
                  </span>
                ) : (
                  <span className="cf-btn-text">
                    <i className="ti ti-send"></i> Send Message
                  </span>
                )}
              </button>

              {submitted && (
                <div id="contact-result">
                  <div className="cf-success">
                    <i className="ti ti-check-circle"></i> Message delivered! We will reply to your email shortly.
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="nav-logo" style={{ marginBottom: '1rem' }}>
                <i className="ti ti-certificate"></i>
                <span>CertifyChain</span>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: '280px' }}>
                Decentralized certificate verification using SHA-256 blockchain hash chaining and AI fraud detection.
              </p>
            </div>
            <div>
              <h4>Platform</h4>
              <ul>
                <li><a onClick={() => setPage('home')} style={{ cursor: 'pointer' }}>Home</a></li>
                <li><a onClick={() => setPage('verify')} style={{ cursor: 'pointer' }}>Verify Certificate</a></li>
                <li><a onClick={() => setPage('blockchain')} style={{ cursor: 'pointer' }}>Blockchain Explorer</a></li>
                <li><a onClick={() => setPage('ai-assistant')} style={{ cursor: 'pointer' }}>AI Assistant</a></li>
              </ul>
            </div>
            <div>
              <h4>Institution</h4>
              <ul>
                <li><a onClick={() => setPage('issue')} style={{ cursor: 'pointer' }}>Issue Certificate</a></li>
                <li><a onClick={() => setPage('dashboard')} style={{ cursor: 'pointer' }}>Admin Dashboard</a></li>
                <li><a onClick={() => setPage('login')} style={{ cursor: 'pointer' }}>Portal Login</a></li>
              </ul>
            </div>
            <div>
              <h4>Legal &amp; Privacy</h4>
              <ul>
                <li><a href="#faq">GDPR Compliance</a></li>
                <li><a href="#about">Security Overview</a></li>
                <li><a href="#about">Open Source License</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-credit">
            © {new Date().getFullYear()} CertifyChain. Developed by Arjun Kumar. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
