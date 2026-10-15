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
  | 'ai-assistant'
  | 'profile';

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
