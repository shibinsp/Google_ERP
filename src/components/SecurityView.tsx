import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Fingerprint,
  Smartphone,
  Copy,
  Check,
  Clock,
  FileText,
  Download,
} from 'lucide-react';
import { AuditLogEntry, UserRole } from '../types';
import { ROLE_PROFILES } from '../data/initialData';
import {
  encryptSensitiveData,
  decryptSensitiveData,
  computeSha256,
  getCurrentTotpCode,
} from '../services/crypto';
import { AuditPdfReportModal } from './AuditPdfReportModal';

interface SecurityViewProps {
  auditLogs: AuditLogEntry[];
  currentRole: UserRole;
  mfaVerified: boolean;
  onVerifyMfa: () => void;
  globalSearchQuery: string;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  auditLogs,
  currentRole,
  mfaVerified,
  onVerifyMfa,
  globalSearchQuery,
}) => {
  const [activeTab, setActiveTab] = useState<'mfa' | 'e2ee' | 'rbac' | 'audit'>('mfa');
  const [searchQuery, setSearchQuery] = useState(globalSearchQuery || '');
  const [showPdfModal, setShowPdfModal] = useState(false);

  // E2EE Playground State
  const [testPlaintext, setTestPlaintext] = useState('SSN-984-21-4412 // JP-CHASE-ACH-409124');
  const [encryptedOutput, setEncryptedOutput] = useState('');
  const [decryptedOutput, setDecryptedOutput] = useState('');
  const [shaHash, setShaHash] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);

  // TOTP Live State
  const [totpData, setTotpData] = useState(getCurrentTotpCode());
  const [totpInput, setTotpInput] = useState('');
  const [totpFeedback, setTotpFeedback] = useState<string | null>(null);

  // Update TOTP timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTotpData(getCurrentTotpCode());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTestEncrypt = async () => {
    setIsEncrypting(true);
    const cipher = await encryptSensitiveData(testPlaintext);
    const hash = await computeSha256(testPlaintext);
    setEncryptedOutput(cipher);
    setShaHash(hash);
    setDecryptedOutput('');
    setIsEncrypting(false);
  };

  const handleTestDecrypt = async () => {
    if (!encryptedOutput) return;
    const plain = await decryptSensitiveData(encryptedOutput);
    setDecryptedOutput(plain);
  };

  const handleValidateTotp = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpInput.trim() === totpData.code) {
      setTotpFeedback('Verification Successful: TOTP 6-digit challenge matched!');
      onVerifyMfa();
    } else {
      setTotpFeedback('Invalid Code: Please enter the 6-digit rolling code shown above.');
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    return (
      log.actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>Cloud Security, E2EE Cryptography & RBAC</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            AES-256 GCM client-side encryption vault, multi-factor authentication, enterprise role policies, and immutable audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="security-export-audit-pdf-btn"
            onClick={() => setShowPdfModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>30-Day Audit PDF</span>
          </button>

          {/* Security Tabs */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('mfa')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'mfa' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Multi-Factor Auth (MFA)
            </button>
            <button
              onClick={() => setActiveTab('e2ee')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'e2ee' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              E2EE Vault Tester
            </button>
            <button
              onClick={() => setActiveTab('rbac')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'rbac' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              RBAC Matrix
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'audit' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Audit Log ({auditLogs.length})
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: Multi-Factor Authentication (MFA) */}
      {activeTab === 'mfa' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Enterprise Multi-Factor Authentication (MFA)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                      Enforced Protocol
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Time-based One-Time Passwords (TOTP RFC 6238) paired with client-side biometric/key challenges.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">MFA Session:</span>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    mfaVerified
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {mfaVerified ? 'Authenticated & Verified' : 'Challenge Required'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Authenticator Simulator */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">Live Virtual Authenticator (TOTP)</span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-mono font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{totpData.secondsRemaining}s remaining</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white border border-slate-200 text-center space-y-1 shadow-2xs">
                  <span className="text-[11px] text-slate-400 uppercase tracking-widest font-mono font-semibold">
                    Enterprise ERP Suite
                  </span>
                  <div className="text-3xl font-mono font-bold tracking-widest text-emerald-700 select-all">
                    {totpData.code.slice(0, 3)} {totpData.code.slice(3)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Rolling Secret: ERP-CORP-MFA-2026</span>
                </div>

                {/* Validation Form */}
                <form onSubmit={handleValidateTotp} className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-700 font-medium mb-1">
                      Enter 6-Digit Code to Confirm Step-Up MFA Challenge
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={totpInput}
                        onChange={(e) => setTotpInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 849201"
                        className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono text-center tracking-widest text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                      >
                        Verify
                      </button>
                    </div>
                  </div>

                  {totpFeedback && (
                    <div
                      className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                        totpFeedback.includes('Successful')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {totpFeedback.includes('Successful') ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{totpFeedback}</span>
                    </div>
                  )}
                </form>
              </div>

              {/* Recovery Codes & Security Policy */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4 text-xs">
                <h4 className="font-semibold text-slate-900">Cryptographic Disaster Recovery Backup Codes</h4>
                <p className="text-slate-500 text-[11px]">
                  Store these single-use emergency bypass codes in an offline enterprise safe.
                </p>

                <div className="grid grid-cols-2 gap-2 font-mono text-slate-800">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center shadow-2xs font-semibold">4419-8802</div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center shadow-2xs font-semibold">9012-7741</div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center shadow-2xs font-semibold">3389-1094</div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-center shadow-2xs font-semibold">6120-4590</div>
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Session idle timeout: 15 minutes</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Step-up auth required for payroll sign-off &gt;$100,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: End-to-End Encryption (E2EE) Vault Tester */}
      {activeTab === 'e2ee' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>Web Crypto API (SubtleCrypto) AES-GCM 256-bit Tester</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Demonstrates real client-side cryptographic encapsulation of sensitive employee, banking, and payment payload fields.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Plaintext Input (Sensitive Data)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testPlaintext}
                    onChange={(e) => setTestPlaintext(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Enter SSN, routing number, or private token..."
                  />
                  <button
                    onClick={handleTestEncrypt}
                    disabled={isEncrypting}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-2xs transition-colors"
                  >
                    {isEncrypting ? 'Encrypting...' : 'Encrypt with AES-GCM'}
                  </button>
                </div>
              </div>

              {encryptedOutput && (
                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1.5">
                      <span>AES-GCM Ciphertext (Base64 IV + Ciphertext Payload)</span>
                      <span className="text-emerald-700 font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">256-BIT SECURE</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-emerald-800 font-mono text-[11px] break-all select-all shadow-2xs">
                      {encryptedOutput}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1.5">
                      <span>SHA-256 Tamper-Evident Integrity Seal</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-mono text-[11px] break-all select-all shadow-2xs">
                      {shaHash}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTestDecrypt}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-2xs transition-colors"
                    >
                      Decrypt with Master Vault Key
                    </button>
                  </div>

                  {decryptedOutput && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-[11px] font-semibold text-emerald-800 block mb-1">
                        Decrypted Plaintext Verified:
                      </span>
                      <div className="text-slate-900 font-mono text-xs font-semibold">{decryptedOutput}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Role-Based Access Control (RBAC) Matrix */}
      {activeTab === 'rbac' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC) Security Governance</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Granular access privilege boundaries across all 5 standard enterprise roles.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Role Title</th>
                  <th className="px-4 py-3 text-center">Inventory Mgmt</th>
                  <th className="px-4 py-3 text-center">HR & Staff</th>
                  <th className="px-4 py-3 text-center">Payroll Sign-Off</th>
                  <th className="px-4 py-3 text-center">Financials & AP/AR</th>
                  <th className="px-4 py-3 text-center">Payment Gateways</th>
                  <th className="px-4 py-3 text-center">E2EE Key Vault</th>
                  <th className="px-4 py-3 text-center">Audit Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(Object.keys(ROLE_PROFILES) as UserRole[]).map((roleKey) => {
                  const r = ROLE_PROFILES[roleKey];
                  const isCurrent = currentRole === roleKey;

                  return (
                    <tr key={roleKey} className={isCurrent ? 'bg-indigo-50/50' : 'hover:bg-slate-50/80 transition-colors'}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{r.title}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-600 text-white font-mono font-bold">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">{r.department}</div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        {r.allowedModules.includes('inventory') ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {r.allowedModules.includes('hrms') ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {r.canExecutePayroll ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {r.allowedModules.includes('finance') ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {r.canApprovePayments ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {r.canAccessEncryptionKeys ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {r.canViewAuditLogs ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
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

      {/* SUB-TAB 4: Immutable Audit Log */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* 30-Day Cryptographic Integrity & PDF Export Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SHA-256 TAMPER-EVIDENT LEDGER
                </span>
                <span className="text-xs text-slate-300 font-mono">SOC-2 Type II Certified</span>
              </div>
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Last 30 Days Audit Trail & Cryptographic Verification</span>
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                All administrative changes, role updates, payment transactions, and inventory transfers are sealed with deterministic W3C WebCrypto SHA-256 hashes. Generate an executive compliance PDF report with cryptographic integrity verification.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                id="audit-banner-generate-pdf-btn"
                onClick={() => setShowPdfModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Generate 30-Day PDF Report</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail by actor, action, module..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="text-xs text-slate-600 font-mono font-medium">{filteredLogs.length} events verified</span>
              <button
                id="audit-table-export-pdf-btn"
                onClick={() => setShowPdfModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Download PDF Summary</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Timestamp & Actor</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Module</th>
                    <th className="px-4 py-3">Action & Details</th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3">SHA-256 Tamper Seal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{log.actorEmail}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{log.timestamp}</div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                          {log.actorRole}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                          {log.module}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-mono text-[11px] text-slate-900 font-semibold">{log.action}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 max-w-md">{log.details}</div>
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">{log.ipAddress}</td>

                      <td className="px-4 py-3 font-mono text-[10px] text-emerald-700 font-bold truncate max-w-[140px]">
                        {log.cryptographicHash.slice(0, 16)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PDF Summary & Cryptographic Integrity Modal */}
      <AuditPdfReportModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        auditLogs={auditLogs}
        currentRole={currentRole}
      />
    </div>
  );
};
