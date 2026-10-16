export interface Certificate {
  no: string;
  student: string;
  studentId: string;
  course: string;
  institution: string;
  date: string;
  grade?: string;
  notes?: string;
  hash: string;
  prevHash: string;
  valid: boolean;
  timestamp?: string;
  multiSig?: {
    registrarSigned: boolean;
    deanSigned: boolean;
    witnessValidated: boolean;
  };
  merkleRoot?: string;
}

export interface User {
  username: string;
  name: string;
  email: string;
  phone?: string;
  institution?: string;
}

export interface VerificationRecord {
  certNo: string;
  method: string;
  student: string;
  result: 'Valid' | 'Verified' | 'Not Found' | 'Suspicious' | 'Review' | 'Fake';
  time: string;
  zkpVerified?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time?: string;
}

export type PageView =
  | 'home'
  | 'login'
  | 'dashboard'
  | 'verify'
  | 'issue'
  | 'blockchain'
  | 'privacy-radar'
  | 'zkp-studio'
  | 'data-minimization'
  | 'profile';

export type FieldDisclosureLevel =
  | 'FULL'
  | 'MASKED'
  | 'YEAR_ONLY'
  | 'CATEGORY_ONLY'
  | 'ZK_PREDICATE'
  | 'REDACTED';

export type VerificationScopeId =
  | 'employment'
  | 'admissions'
  | 'licensing'
  | 'student-discount'
  | 'custom';

export interface DataMinimizationPolicy {
  id: VerificationScopeId;
  name: string;
  targetVerifier: string;
  purpose: string;
  legalBasis: string;
  icon: string;
  fields: {
    studentName: FieldDisclosureLevel;
    studentId: FieldDisclosureLevel;
    course: FieldDisclosureLevel;
    institution: FieldDisclosureLevel;
    date: FieldDisclosureLevel;
    grade: FieldDisclosureLevel;
    notes: FieldDisclosureLevel;
    blockchainHash: FieldDisclosureLevel;
  };
  zkPredicates?: {
    hasGraduated: boolean;
    minimumGradeThreshold?: string;
    issueYearAfter?: number;
  };
  allowAuditTrail: boolean;
  watermarkVerifierIdentity: boolean;
}

export interface FieldDecision {
  field: string;
  fieldLabel: string;
  originalValue: string;
  disclosedValue: string;
  action: 'DISCLOSED' | 'MASKED' | 'REDACTED' | 'ZK_PROVED';
  legalRationale: string;
}

export interface MinimizationEvaluationResult {
  scopeId: VerificationScopeId;
  scopeName: string;
  verifierIdentity: string;
  purpose: string;
  legalBasis: string;
  timestamp: string;
  rawCertificate: Certificate;
  disclosedCertificate: {
    no: string;
    student: string;
    studentId: string;
    course: string;
    institution: string;
    date: string;
    grade: string;
    notes: string;
    hash: string;
    prevHash: string;
    valid: boolean;
    zkPredicateResults?: Array<{ label: string; passed: boolean; proofHash: string }>;
  };
  fieldDecisions: FieldDecision[];
  reductionPercentage: number;
  piiFieldsBlocked: number;
  cryptographicProofToken: string;
  disclosureNonce: string;
  expiresIn: string;
}

export type Theme = 'dark' | 'light';

export interface TamperArea {
  area: string;
  reason: string;
  severity: 'high' | 'medium';
}

export interface ForensicReport {
  ledgerMatch: boolean;
  hologramSealIntegrity: 'GENUINE' | 'FORGED' | 'SUSPICIOUS' | 'ABSENT';
  fontCoherence: 'CONSISTENT' | 'SUSPICIOUS_ALTERATION' | 'MISMATCHED_WEIGHT';
  qrSignatureMatch: boolean;
  metadataTimestampValid: boolean;
  elaHeatmapGenerated?: boolean;
}

export interface AIAnalysisResult {
  documentType: string;
  name: string;
  certNumber: string;
  coursePosition: string;
  organization: string;
  date: string;
  gradeDuration: string;
  issuedBy: string;
  other: string;
  authenticityGood: string;
  authenticityWarn: string;
  verdict: 'VERIFIED' | 'SUSPICIOUS' | 'NEEDS_REVIEW';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  tamperScore: number; // 0 - 100
  tamperedAreas?: TamperArea[];
  forensicAnalysis?: ForensicReport;
}

export interface PrivacyFinding {
  id: string;
  testName: string;
  category: 'PII_LEAK' | 'BLOCKCHAIN_LEAK' | 'QR_PAYLOAD' | 'METADATA_EXPOSURE' | 'SECURITY_POSTURE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'PASSED';
  resource: string;
  detectedText?: string;
  description: string;
  recommendation: string;
  remediated?: boolean;
}

export interface PrivacyRadarSummary {
  overallScore: number; // 0 - 100
  status: 'EXCELLENT' | 'COMPLIANT' | 'WARNING' | 'CRITICAL_LEAK';
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  piiExposureCount: number;
  lastScanTime: string;
  findings: PrivacyFinding[];
}
