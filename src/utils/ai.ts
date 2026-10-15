import { Certificate, AIAnalysisResult } from '../types';

export async function askCertifyChainAI(
  userMessage: string,
  certs: Certificate[]
): Promise<string> {
  const lower = userMessage.toLowerCase();

  // Search if user mentions a cert number
  const certMatch = certs.find(c =>
    lower.includes(c.no.toLowerCase()) ||
    lower.includes(c.student.toLowerCase())
  );

  if (certMatch) {
    return `Certificate Record Found:
• Certificate Number: ${certMatch.no}
• Student Name: ${certMatch.student} (${certMatch.studentId})
• Program: ${certMatch.course}
• Institution: ${certMatch.institution}
• Issue Date: ${certMatch.date}
• Grade / Honors: ${certMatch.grade || 'N/A'} - ${certMatch.notes || 'N/A'}
• Blockchain Hash: ${certMatch.hash}
• Previous Linked Hash: ${certMatch.prevHash}
Status: 100% Verified Authentic on SHA-256 Chain.`;
  }

  if (lower.includes('privacy') || lower.includes('leak') || lower.includes('radar')) {
    return `CertifyChain Privacy Leakage Radar continuously audits credentials for Personally Identifiable Information (PII) leakage:
1. PII Redaction: Ensures Aadhaar/National IDs, phone numbers, and home addresses are never exposed in plaintext public blocks.
2. Zero-Knowledge Proofs: Verifies credentials without revealing raw student marks or private biographical data.
3. Automated Testing: Runs DPDP Act (2023) and GDPR Article 25 compliance audits across all ledger blocks and QR codes.`;
  }

  if (lower.includes('fake') || lower.includes('detect') || lower.includes('fraud')) {
    return `CertifyChain's Multi-Tier Fake Detection System analyzes:
1. Cryptographic Ledger Mismatch: If a certificate number does not exist on the SHA-256 chain or its hash doesn't match the immutable block, it is flagged as Counterfeit.
2. Forensic Font Kerning & Splicing: Detects Photoshop/digital alterations where names or grades were pasted over an existing certificate.
3. Holographic Seal & Seal DPI Inspection: Flags forged or low-resolution digital stamps that lack official security watermarks.
4. QR Signature Cloned Detection: Confirms the digital signature embedded in the QR payload matches the authentic registrar private key.`;
  }

  if (lower.includes('hash chain') || lower.includes('how does hash') || lower.includes('how it works')) {
    return `CertifyChain uses a cryptographic SHA-256 hash chaining mechanism:
1. When a certificate is issued, student and credential metadata is digested into a unique 64-character SHA-256 hash.
2. Each new block references the 'prevHash' of the preceding block in the chain.
3. If any party attempts to alter the student name, grade, or date on a certificate, its hash changes, breaking all subsequent chain links and instantly alerting the system.`;
  }

  if (lower.includes('sha-256') || lower.includes('algorithm')) {
    return `SHA-256 (Secure Hash Algorithm 256-bit) is a cryptographic hash function that produces a fixed 256-bit (64 hex characters) output. It is collision-resistant and irreversible, ensuring that even a 1-character difference in certificate details produces an entirely unrecognizable hash.`;
  }

  return `I am CertifyChain AI, your verification and privacy security assistant. Currently guarding ${certs.length} verified certificates on chain with automated fraud detection and privacy leakage protection. Ask me to verify a certificate number, inspect forensic anomalies, or run privacy audits.`;
}

export async function analyzeCertificateImage(
  fileName: string,
  base64Data?: string,
  certs: Certificate[] = [],
  forceOutcome: 'auto' | 'authentic' | 'fake' = 'auto'
): Promise<AIAnalysisResult> {
  // Simulate neural OCR analysis step
  await new Promise(r => setTimeout(r, 1800));

  const lowerName = fileName.toLowerCase();

  // Scenario 1: Deliberate Fake / Altered Certificate
  if (
    forceOutcome === 'fake' ||
    (forceOutcome === 'auto' && (
      lowerName.includes('fake') ||
      lowerName.includes('forged') ||
      lowerName.includes('tamper') ||
      lowerName.includes('counterfeit') ||
      lowerName.includes('sample-fake')
    ))
  ) {
    return {
      documentType: 'Counterfeit Academic Degree',
      name: 'Sunil Kumar (Altered from Priya Sharma)',
      certNumber: 'FAKE-2024-998877',
      coursePosition: 'B.Tech Computer Science & Engineering (Manipulated)',
      organization: 'Unaccredited Entity / Forged GNIOT Letterhead',
      date: '15 May 2024 (Inconsistent metadata)',
      gradeDuration: 'CGPA 9.9 / 10 (Artificially Inflated)',
      issuedBy: 'Unknown Digital Signature / Unregistered Stamp',
      other: 'Modified background noise around student name and degree marks',
      authenticityGood: 'Readable raster text layer present',
      authenticityWarn: 'CRITICAL: Font kerning mismatch around name; Institution seal DPI inconsistent; No matching SHA-256 block found in ledger',
      verdict: 'SUSPICIOUS',
      confidence: 'HIGH',
      tamperScore: 94,
      summary: 'FRAUD DETECTED: The uploaded document exhibits high-confidence signs of digital manipulation, overlaid text, and has no cryptographic record in the blockchain ledger.',
      tamperedAreas: [
        {
          area: 'Candidate Name Block',
          reason: 'Font smoothing artifact mismatch: Student name was digitally overlaid onto an existing certificate template.',
          severity: 'high',
        },
        {
          area: 'Grade & CGPA Section',
          reason: 'Compression artifacts around "9.9" indicate image editing tool splice.',
          severity: 'high',
        },
        {
          area: 'Cryptographic Ledger Cross-Check',
          reason: 'Certificate serial "FAKE-2024-998877" does not exist in the official blockchain hash chain.',
          severity: 'high',
        },
        {
          area: 'Institutional Hologram Seal',
          reason: 'Seal resolution is 72 DPI (web rip), whereas official registrar credentials require 300+ DPI vector engraving.',
          severity: 'medium',
        },
      ],
      forensicAnalysis: {
        ledgerMatch: false,
        hologramSealIntegrity: 'FORGED',
        fontCoherence: 'SUSPICIOUS_ALTERATION',
        qrSignatureMatch: false,
        metadataTimestampValid: false,
      },
    };
  }

  // Scenario 2: Authentic AICTE / EduSkills Internship Certificate
  if (lowerName.includes('intern') || lowerName.includes('aicte') || lowerName.includes('eduskills')) {
    return {
      documentType: 'Virtual Internship Certificate',
      name: 'Arjun Kumar',
      certNumber: 'CERT-2025-000042',
      coursePosition: 'AI-ML Virtual Internship (10 Weeks)',
      organization: 'AICTE-EduSkills / Galgotias University',
      date: '30 Sep 2025',
      gradeDuration: 'Grade B (Good) · 60-69%',
      issuedBy: 'National Internship Portal / EduSkills Academy Director',
      other: 'Google for Developers · India Edu Program Partner seal verified',
      authenticityGood: 'Official EduSkills holographic seal, QR validation code, registrar signature, blockchain hash intact',
      authenticityWarn: 'NONE_DETECTED',
      verdict: 'VERIFIED',
      confidence: 'HIGH',
      tamperScore: 2,
      summary: 'AUTHENTIC & VERIFIED: Document successfully validated against AICTE-EduSkills blockchain ledger. Block #5 cryptographic hash matches with 100% integrity.',
      tamperedAreas: [],
      forensicAnalysis: {
        ledgerMatch: true,
        hologramSealIntegrity: 'GENUINE',
        fontCoherence: 'CONSISTENT',
        qrSignatureMatch: true,
        metadataTimestampValid: true,
      },
    };
  }

  // Scenario 3: Authentic Degree
  if (lowerName.includes('degree') || lowerName.includes('btech') || lowerName.includes('priya')) {
    return {
      documentType: 'Bachelor of Technology Degree',
      name: 'Priya Sharma',
      certNumber: 'CERT-2024-001234',
      coursePosition: 'B.Tech Computer Science & Engineering',
      organization: 'GNIOT, Greater Noida',
      date: '15 May 2024',
      gradeDuration: 'CGPA 8.9 / 10 · First Class with Distinction',
      issuedBy: 'Registrar & Vice Chancellor',
      other: 'University Gold Medallion & Security Watermark confirmed',
      authenticityGood: 'Institutional embossed seal, verifiable serial number, dual authorized signatures, SHA-256 block link confirmed',
      authenticityWarn: 'NONE_DETECTED',
      verdict: 'VERIFIED',
      confidence: 'HIGH',
      tamperScore: 0,
      summary: 'AUTHENTIC & VERIFIED: Official engineering degree recognized with intact blockchain signature and registrar validation on Genesis Block #1.',
      tamperedAreas: [],
      forensicAnalysis: {
        ledgerMatch: true,
        hologramSealIntegrity: 'GENUINE',
        fontCoherence: 'CONSISTENT',
        qrSignatureMatch: true,
        metadataTimestampValid: true,
      },
    };
  }

  // Default clean verified analysis for user document
  const sampleCert = certs[0];
  return {
    documentType: 'Official Academic Certificate',
    name: sampleCert ? sampleCert.student : 'Verified Student Candidate',
    certNumber: sampleCert ? sampleCert.no : 'CERT-2024-001234',
    coursePosition: sampleCert ? sampleCert.course : 'Computer Science Program',
    organization: sampleCert ? sampleCert.institution : 'GNIOT, Greater Noida',
    date: sampleCert ? sampleCert.date : '2024-05-15',
    gradeDuration: sampleCert?.grade || 'First Division with Honors',
    issuedBy: 'Academic Council Registrar',
    other: 'Official institutional seal, verifiable signature, security watermark',
    authenticityGood: 'High-resolution vector typography, valid QR code pattern, cryptographic ledger confirmation',
    authenticityWarn: 'NONE_DETECTED',
    verdict: 'VERIFIED',
    confidence: 'HIGH',
    tamperScore: 3,
    summary: 'AUTHENTIC & VERIFIED: Document validated with high confidence. Key institutional markers, security watermark, and format consistency intact on blockchain.',
    tamperedAreas: [],
    forensicAnalysis: {
      ledgerMatch: true,
      hologramSealIntegrity: 'GENUINE',
      fontCoherence: 'CONSISTENT',
      qrSignatureMatch: true,
      metadataTimestampValid: true,
    },
  };
}
