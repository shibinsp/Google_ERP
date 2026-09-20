import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileText,
  Download,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  Lock,
  Search,
  Eye,
  Sparkles,
} from 'lucide-react';
import { AuditLogEntry, UserRole } from '../types';
import { ROLE_PROFILES } from '../data/initialData';
import {
  filterLogsLast30Days,
  verifyAuditLogsIntegrity,
  generateAuditPdf,
  AuditIntegrityReport,
} from '../services/auditPdfGenerator';

interface AuditPdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditLogEntry[];
  currentRole: UserRole;
  operatorEmail?: string;
}

export const AuditPdfReportModal: React.FC<AuditPdfReportModalProps> = ({
  isOpen,
  onClose,
  auditLogs,
  currentRole,
  operatorEmail = 'shibinsp43@gmail.com',
}) => {
  const [selectedModule, setSelectedModule] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [simulateTamper, setSimulateTamper] = useState(false);
  const [tamperedId, setTamperedId] = useState<string | null>(null);
  const [report, setReport] = useState<AuditIntegrityReport | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Extract 30-day logs
  const { filteredLogs: thirtyDayLogs, period } = useMemo(() => {
    return filterLogsLast30Days(auditLogs, 30);
  }, [auditLogs]);

  // Apply module & search filter
  const displayedLogs = useMemo(() => {
    return thirtyDayLogs.filter((log) => {
      const matchMod = selectedModule === 'All' || log.module === selectedModule;
      const matchSearch =
        searchFilter === '' ||
        log.actorEmail.toLowerCase().includes(searchFilter.toLowerCase()) ||
        log.action.toLowerCase().includes(searchFilter.toLowerCase()) ||
        log.details.toLowerCase().includes(searchFilter.toLowerCase());
      return matchMod && matchSearch;
    });
  }, [thirtyDayLogs, selectedModule, searchFilter]);

  // Run cryptographic verification whenever logs or tamper simulation changes
  useEffect(() => {
    let isMounted = true;
    const runVerification = async () => {
      setIsVerifying(true);
      const targetTamperId = simulateTamper && displayedLogs.length > 0 ? displayedLogs[0].id : null;
      setTamperedId(targetTamperId);

      const res = await verifyAuditLogsIntegrity(displayedLogs, period, targetTamperId);
      if (isMounted) {
        setReport(res);
        setIsVerifying(false);
      }
    };

    if (isOpen) {
      runVerification();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, displayedLogs, period, simulateTamper]);

  if (!isOpen) return null;

  const handleCopyMasterHash = () => {
    if (!report) return;
    navigator.clipboard.writeText(report.masterVerificationHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  const handleDownloadPdf = async () => {
    if (!report) return;
    setIsGeneratingPdf(true);
    try {
      await generateAuditPdf(report, {
        generatedBy: operatorEmail,
        operatorRole: ROLE_PROFILES[currentRole]?.title || 'Security Administrator',
        download: true,
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePreviewPdf = async () => {
    if (!report) return;
    setIsGeneratingPdf(true);
    try {
      const { blob } = await generateAuditPdf(report, {
        generatedBy: operatorEmail,
        operatorRole: ROLE_PROFILES[currentRole]?.title || 'Security Administrator',
        download: false,
      });
      const url = URL.createObjectURL(blob);
      const newWin = window.open(url, '_blank');
      if (!newWin) {
        // Fallback for sandboxed iframes where popup window is blocked
        const a = document.createElement('a');
        a.href = url;
        a.download = `AURA-Enterprise-Audit-Report-${report.generatedAt.slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('PDF Preview Error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const modulesList = ['All', 'Security', 'Inventory', 'HRMS', 'Finance', 'Gateway', 'Integrations'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  30-Day Cryptographic Audit Summary & PDF Generator
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  SHA-256 SEALED
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Period: <span className="font-semibold text-slate-700">{period.startDate}</span> to{' '}
                <span className="font-semibold text-slate-700">{period.endDate}</span> (Last 30 Days)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Cryptographic Integrity Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              report?.isFullyValid
                ? 'bg-emerald-50/40 border-emerald-200'
                : 'bg-rose-50/40 border-rose-200'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  {report?.isFullyValid ? (
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>100% Cryptographic Integrity Confirmed</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-700 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                      <span>Integrity Mismatch Detected ({report?.tamperedRecords} Alert)</span>
                    </div>
                  )}
                  <span className="text-xs text-slate-500 font-mono">
                    ({report?.verifiedRecords} of {report?.totalRecords} records verified)
                  </span>
                </div>

                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  {report?.isFullyValid
                    ? 'All historical transactions within this 30-day window match their immutable SHA-256 seals. The cumulative Merkle hash chain guarantees that no row, timestamp, or actor signature was modified or expunged.'
                    : 'A mismatch occurred between the recorded payload and its cryptographic seal. The compromised record is flagged below in red.'}
                </p>

                {/* Master Hash Display */}
                {report && (
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-500 font-medium">Master Document SHA-256:</span>
                    <code className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-mono text-[11px] font-semibold select-all break-all">
                      {report.masterVerificationHash}
                    </code>
                    <button
                      onClick={handleCopyMasterHash}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                      title="Copy Master SHA-256 Seal"
                    >
                      {copiedHash ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Simulator Toggle */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="text-xs">
                  <div className="font-semibold text-slate-800">Tamper Verification Test</div>
                  <div className="text-[11px] text-slate-500">Simulate malicious row alteration</div>
                </div>
                <button
                  id="toggle-simulate-tamper-btn"
                  onClick={() => setSimulateTamper(!simulateTamper)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    simulateTamper
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{simulateTamper ? 'Revert to Verified' : 'Simulate Tamper'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filters & Module Breakdown Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-1">
            {/* Module filter chips */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-xs">
              {modulesList.map((mod) => (
                <button
                  key={mod}
                  onClick={() => setSelectedModule(mod)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    selectedModule === mod
                      ? 'bg-white text-indigo-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mod}
                  {mod === 'All' ? ` (${thirtyDayLogs.length})` : ''}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search 30-day events..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Verified Items Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                Verified Event Ledger ({displayedLogs.length} Events in Report Scope)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Merkle Root: {report?.merkleRootChain ? `${report.merkleRootChain.slice(0, 16)}...` : 'Computing...'}
              </span>
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-3.5 py-2.5">Timestamp</th>
                    <th className="px-3.5 py-2.5">Actor & Role</th>
                    <th className="px-3.5 py-2.5">Module</th>
                    <th className="px-3.5 py-2.5">Action & Description</th>
                    <th className="px-3.5 py-2.5">SHA-256 Seal</th>
                    <th className="px-3.5 py-2.5 text-center">Integrity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report?.items.map((item, idx) => {
                    const isCompromised = !item.isValid;
                    return (
                      <tr
                        key={item.log.id}
                        className={
                          isCompromised
                            ? 'bg-rose-50/70'
                            : idx % 2 === 0
                            ? 'bg-white hover:bg-slate-50/60'
                            : 'bg-slate-50/40 hover:bg-slate-50/80'
                        }
                      >
                        <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {item.log.timestamp}
                        </td>

                        <td className="px-3.5 py-2.5">
                          <div className="font-semibold text-slate-900 text-[11px]">{item.log.actorEmail}</div>
                          <div className="text-[10px] text-slate-500">{item.log.actorRole}</div>
                        </td>

                        <td className="px-3.5 py-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                            {item.log.module}
                          </span>
                        </td>

                        <td className="px-3.5 py-2.5 max-w-xs">
                          <div className="font-mono text-[11px] font-semibold text-slate-800">
                            {item.log.action}
                          </div>
                          <div className="text-[11px] text-slate-600 truncate mt-0.5" title={item.log.details}>
                            {item.log.details}
                          </div>
                          {isCompromised && (
                            <div className="text-[10px] font-bold text-rose-600 mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{item.tamperReason}</span>
                            </div>
                          )}
                        </td>

                        <td className="px-3.5 py-2.5 font-mono text-[10px] text-slate-700">
                          <span title={item.storedHash} className="select-all">
                            {item.storedHash.slice(0, 16)}...
                          </span>
                        </td>

                        <td className="px-3.5 py-2.5 text-center">
                          {item.isValid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>VERIFIED</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>TAMPERED</span>
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
        </div>

        {/* Modal Footer & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>PDF output includes embedded verification QR seal & SOC-2 compliance attestation.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              id="preview-pdf-btn"
              onClick={handlePreviewPdf}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview PDF</span>
            </button>

            <button
              id="download-audit-pdf-btn"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Compiling PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>PDF Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download 30-Day Audit PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
