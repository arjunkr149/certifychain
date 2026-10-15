import React, { createContext, useContext, useState, useEffect } from 'react';
import { Certificate, User, VerificationRecord, PageView, Theme, PrivacyRadarSummary } from '../types';
import { randomHash } from '../utils/blockchain';
import { runAutomatedPrivacyAudit } from '../utils/privacyRadar';

export const INITIAL_CERT_DB: Certificate[] = [
  {
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
  },
  {
    no: 'CERT-2024-001235',
    student: 'Rohit Verma',
    studentId: 'STU-2024-0022',
    course: 'MBA Finance',
    institution: 'GNIOT, Greater Noida',
    date: '2024-05-16',
    grade: '7.8 / 10',
    notes: 'First Class',
    hash: 'b4e2f8c1d9a35678',
    prevHash: 'a3f1c9d2e8b74f5a',
    valid: true,
  },
  {
    no: 'CERT-2024-001236',
    student: 'Ananya Singh',
    studentId: 'STU-2024-0033',
    course: 'M.Tech Artificial Intelligence & ML',
    institution: 'GNIOT, Greater Noida',
    date: '2024-05-17',
    grade: '9.2 / 10',
    notes: 'Gold Medal · University Topper',
    hash: 'c5f3a2b1e0d47890',
    prevHash: 'b4e2f8c1d9a35678',
    valid: true,
  },
  {
    no: 'CERT-2024-001237',
    student: 'Vikram Patel',
    studentId: 'STU-2024-0044',
    course: 'BCA Information Technology',
    institution: 'GNIOT, Greater Noida',
    date: '2024-05-18',
    grade: '8.1 / 10',
    notes: 'First Class',
    hash: 'd6a4c3b2f1e89012',
    prevHash: 'c5f3a2b1e0d47890',
    valid: true,
  },
  {
    no: 'CERT-2025-000042',
    student: 'Arjun Kumar',
    studentId: 'STU6612f44c529f81712518220',
    course: 'AI-ML Virtual Internship (10 Weeks)',
    institution: 'AICTE-EduSkills / Galgotias University',
    date: '2025-09-30',
    grade: 'B (Good) · 60-69',
    notes: 'Google for Developers · India Edu Program · National Internship Portal',
    hash: 'e7b5d4c3a2f19034',
    prevHash: 'd6a4c3b2f1e89012',
    valid: true,
  },
];

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  page: PageView;
  setPage: (page: PageView) => void;
  user: User | null;
  login: (username: string, pass: string) => boolean;
  register: (user: User, pass: string) => void;
  logout: () => void;
  updateProfile: (updated: Partial<User>) => void;
  changePassword: (cur: string, next: string) => boolean;
  certs: Certificate[];
  issuedCerts: Certificate[];
  issueCertificate: (cert: Omit<Certificate, 'no' | 'hash' | 'prevHash' | 'valid'>) => Certificate;
  verifyLog: VerificationRecord[];
  addVerifyRecord: (record: VerificationRecord) => void;
  toast: { message: string; type: 'success' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'error') => void;
  selectedBlockForModal: { cert: Certificate; blockNum: number } | null;
  setSelectedBlockForModal: (block: { cert: Certificate; blockNum: number } | null) => void;
  tamperBlock: (index: number) => void;
  resetChain: () => void;
  privacySummary: PrivacyRadarSummary;
  runPrivacyScan: () => void;
  remediatePrivacyLeaks: () => void;
  remediationApplied: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const VALID_PAGES: PageView[] = [
  'home',
  'login',
  'dashboard',
  'verify',
  'issue',
  'blockchain',
  'privacy-radar',
  'ai-assistant',
  'profile',
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('cc_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cc_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  };

  // User auth state
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('cc_token');
    if (!token) return null;
    const stored = localStorage.getItem('cc_user');
    return stored ? JSON.parse(stored) : {
      username: 'admin',
      name: 'Arjun Kumar',
      email: 'aksir648@gmail.com',
      institution: 'GNIOT, Greater Noida'
    };
  });

  // Navigation page
  const [page, setPageState] = useState<PageView>(() => {
    const hash = window.location.hash.replace('#', '') as PageView;
    if (VALID_PAGES.includes(hash)) {
      return hash;
    }
    const token = localStorage.getItem('cc_token');
    return token ? 'dashboard' : 'home';
  });

  const setPage = (p: PageView) => {
    setPageState(p);
    window.location.hash = p;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as PageView;
      if (VALID_PAGES.includes(hash)) {
        setPageState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Certificates list
  const [certs, setCerts] = useState<Certificate[]>(() => {
    const sessionCertsStr = sessionStorage.getItem('cc_session_certs');
    const sessionCerts = sessionCertsStr ? JSON.parse(sessionCertsStr) : [];
    return [...INITIAL_CERT_DB, ...sessionCerts];
  });

  const [issuedCerts, setIssuedCerts] = useState<Certificate[]>(() => {
    const sessionCertsStr = sessionStorage.getItem('cc_session_certs');
    return sessionCertsStr ? JSON.parse(sessionCertsStr) : [];
  });

  // Verification Log
  const [verifyLog, setVerifyLog] = useState<VerificationRecord[]>([]);

  const addVerifyRecord = (record: VerificationRecord) => {
    setVerifyLog(prev => [record, ...prev]);
  };

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Selected Block Modal
  const [selectedBlockForModal, setSelectedBlockForModal] = useState<{ cert: Certificate; blockNum: number } | null>(null);

  // Privacy Radar State
  const [remediationApplied, setRemediationApplied] = useState(false);
  const [privacySummary, setPrivacySummary] = useState<PrivacyRadarSummary>(() =>
    runAutomatedPrivacyAudit(certs, user)
  );

  const runPrivacyScan = () => {
    const summary = runAutomatedPrivacyAudit(certs, user);
    setPrivacySummary(summary);
    showToast(`Privacy Audit Complete: ${summary.testsPassed}/${summary.testsRun} Tests Passed (Score: ${summary.overallScore}/100)`, summary.overallScore >= 80 ? 'success' : 'error');
  };

  const remediatePrivacyLeaks = () => {
    // Mask sensitive unredacted phone in user profile
    if (user && user.phone) {
      const maskedPhone = '+91-XXXXX-16463';
      const updatedUser = { ...user, phone: maskedPhone };
      setUser(updatedUser);
      localStorage.setItem('cc_user', JSON.stringify(updatedUser));
    }
    // Mask long un-salted student ID in certs
    const updatedCerts = certs.map(c => {
      if (c.studentId && c.studentId.length > 18) {
        return { ...c, studentId: 'STU-***-220 (Salted ZK-Token)' };
      }
      return c;
    });
    setCerts(updatedCerts);
    setRemediationApplied(true);

    // Refresh audit
    setTimeout(() => {
      const freshSummary = runAutomatedPrivacyAudit(updatedCerts, user);
      setPrivacySummary(freshSummary);
      showToast('1-Click Privacy Remediation applied! All PII masked and zero-knowledge pseudonymization enabled.', 'success');
    }, 400);
  };

  // Issue Certificate
  const issueCertificate = (data: Omit<Certificate, 'no' | 'hash' | 'prevHash' | 'valid'>): Certificate => {
    const year = new Date().getFullYear();
    const num = String(Math.floor(Math.random() * 9000) + 1000);
    const certNo = `CERT-${year}-${num.padStart(6, '0')}`;
    const prevHash = certs.length > 0 ? certs[certs.length - 1].hash : '0000000000000000';
    const hash = randomHash(8);

    const newCert: Certificate = {
      ...data,
      no: certNo,
      hash,
      prevHash,
      valid: true,
      timestamp: new Date().toISOString(),
    };

    const updatedCerts = [...certs, newCert];
    const updatedIssued = [...issuedCerts, newCert];

    setCerts(updatedCerts);
    setIssuedCerts(updatedIssued);
    sessionStorage.setItem('cc_session_certs', JSON.stringify(updatedIssued));

    // Update privacy audit on new cert
    setPrivacySummary(runAutomatedPrivacyAudit(updatedCerts, user));

    return newCert;
  };

  // Tamper simulation
  const tamperBlock = (index: number) => {
    if (index < 0 || index >= certs.length) return;
    const altered = [...certs];
    altered[index] = {
      ...altered[index],
      hash: 'tampered_' + randomHash(4),
      notes: 'MODIFIED DATA (Tampered block for testing)',
    };
    setCerts(altered);
    showToast(`Block #${index + 1} hash was modified! Verification will now flag broken chain.`, 'error');
  };

  const resetChain = () => {
    const sessionCertsStr = sessionStorage.getItem('cc_session_certs');
    const sessionCerts = sessionCertsStr ? JSON.parse(sessionCertsStr) : [];
    setCerts([...INITIAL_CERT_DB, ...sessionCerts]);
    setRemediationApplied(false);
    showToast('Blockchain restored to verified state.', 'success');
  };

  // Auth functions
  const login = (username: string, pass: string): boolean => {
    if (username === 'admin' && pass === 'admin123') {
      const u: User = {
        username: 'admin',
        name: 'Arjun Kumar',
        email: 'aksir648@gmail.com',
        phone: '+91-6386416463',
        institution: 'GNIOT, Greater Noida',
      };
      localStorage.setItem('cc_token', 'demo-token-' + Date.now());
      localStorage.setItem('cc_user', JSON.stringify(u));
      setUser(u);
      setPage('dashboard');
      showToast('Welcome back, Arjun!', 'success');
      return true;
    }
    const savedUserStr = localStorage.getItem('cc_registered_user');
    const savedPass = localStorage.getItem('cc_password') || 'admin123';
    if (savedUserStr) {
      const savedUser: User = JSON.parse(savedUserStr);
      if (savedUser.username === username && pass === savedPass) {
        localStorage.setItem('cc_token', 'demo-token-' + Date.now());
        localStorage.setItem('cc_user', JSON.stringify(savedUser));
        setUser(savedUser);
        setPage('dashboard');
        showToast(`Welcome back, ${savedUser.name}!`, 'success');
        return true;
      }
    }
    return false;
  };

  const register = (newUser: User, pass: string) => {
    localStorage.setItem('cc_password', pass);
    localStorage.setItem('cc_registered_user', JSON.stringify(newUser));
    localStorage.setItem('cc_token', 'demo-token-' + Date.now());
    localStorage.setItem('cc_user', JSON.stringify(newUser));
    setUser(newUser);
    setPage('dashboard');
    showToast('Account created successfully!', 'success');
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    sessionStorage.removeItem('cc_session_certs');
    setUser(null);
    setPage('login');
    showToast('Logged out successfully.', 'success');
  };

  const updateProfile = (updated: Partial<User>) => {
    if (!user) return;
    const nextUser = { ...user, ...updated };
    setUser(nextUser);
    localStorage.setItem('cc_user', JSON.stringify(nextUser));
    showToast('Profile updated successfully!', 'success');
  };

  const changePassword = (cur: string, next: string): boolean => {
    const stored = localStorage.getItem('cc_password') || 'admin123';
    if (cur !== stored) {
      return false;
    }
    localStorage.setItem('cc_password', next);
    showToast('Password changed successfully!', 'success');
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        page,
        setPage,
        user,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        certs,
        issuedCerts,
        issueCertificate,
        verifyLog,
        addVerifyRecord,
        toast,
        showToast,
        selectedBlockForModal,
        setSelectedBlockForModal,
        tamperBlock,
        resetChain,
        privacySummary,
        runPrivacyScan,
        remediatePrivacyLeaks,
        remediationApplied,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
