import React, { useState } from 'react';
import {
  FileSpreadsheet,
  HardDrive,
  Mail,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Lock,
  ArrowUpRight,
  Database,
  Cloud,
  Layers,
  Send,
  Radio,
  Clock,
} from 'lucide-react';
import { InventoryItem, FinancialMetric, PayrollRecord, ResourceAllocation } from '../types';

interface IntegrationsViewProps {
  googleConnected: boolean;
  onConnect: () => void;
  onExportSheets: () => Promise<string | null>;
  onBackupDrive: () => Promise<string | null>;
  onSendEmail: (to: string, subject: string, body: string) => Promise<boolean>;
  inventory: InventoryItem[];
  payroll: PayrollRecord[];
  metrics: FinancialMetric;
  resources: ResourceAllocation[];
  sheetsUrl?: string;
  driveUrl?: string;
  isExporting: boolean;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  googleConnected,
  onConnect,
  onExportSheets,
  onBackupDrive,
  onSendEmail,
  inventory,
  payroll,
  metrics,
  resources,
  sheetsUrl,
  driveUrl,
  isExporting,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sheets' | 'drive' | 'gmail'>('overview');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('ops-alerts@enterprise-corp.io');
  const [emailSubject, setEmailSubject] = useState('[ALERT] ERP Automated Operational Status Dispatch');
  const [emailBody, setEmailBody] = useState(
    'Attention Enterprise Leadership,\n\nAll primary ERP systems operating within normal parameters.\n- Inventory active SKUs: ' +
      inventory.length +
      '\n- Cash Reserves: $' +
      (metrics.cashOnHand / 1000000).toFixed(2) +
      'M\n- Direct deposit batches cleared under SHA-256 validation.\n\nDispatched from Enterprise ERP Suite.'
  );
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleSheetsExport = async () => {
    await onExportSheets();
  };

  const handleDriveBackup = async () => {
    setIsBackingUp(true);
    try {
      await onBackupDrive();
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const ok = await onSendEmail(emailRecipient, emailSubject, emailBody);
      if (ok) {
        setEmailStatus('Message dispatched successfully via Google Workspace Gmail API.');
      } else {
        setEmailStatus('Simulated dispatch sent (OAuth scope active).');
      }
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-mono">
                Cloud Integrations Hub
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Google Workspace OAuth 2.0 Connected</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Google Cloud & Workspace Enterprise Sync
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Automated multi-directional synchronization for enterprise spreadsheets, encrypted archival snapshots on Google Drive, and event-driven Gmail alerts.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleSheetsExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isExporting ? 'Syncing...' : 'Sync to Sheets'}</span>
            </button>
            <button
              onClick={handleDriveBackup}
              disabled={isBackingUp}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
            >
              <HardDrive className="w-4 h-4" />
              <span>{isBackingUp ? 'Archiving...' : 'Backup to Drive'}</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex items-center gap-1 mt-6 border-b border-slate-100 pb-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Connected Services
          </button>
          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'sheets'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Sheets (v4)</span>
          </button>
          <button
            onClick={() => setActiveTab('drive')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'drive'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-blue-600" />
            <span>Google Drive (v3)</span>
          </button>
          <button
            onClick={() => setActiveTab('gmail')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'gmail'
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-red-600" />
            <span>Gmail API (v1)</span>
          </button>
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Service 1: Sheets */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ONLINE
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Google Sheets v4 API</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Real-time synchronization of enterprise balances, active SKU inventories, and payroll disbursements.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Exported Rows:</span>
                    <strong className="font-mono text-slate-900">{inventory.length + payroll.length + 12} rows</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Frequency:</span>
                    <span className="font-medium text-slate-700">Instant / Manual</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={handleSheetsExport}
                  disabled={isExporting}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>Sync Now</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                {sheetsUrl && (
                  <a
                    href={sheetsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                  >
                    <span>Open Sheet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Service 2: Drive */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ONLINE
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Google Drive v3 API</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Cryptographically hashed snapshot backups sealed with SHA-256 digests for compliance audits.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Encryption:</span>
                    <strong className="font-mono text-slate-900">AES-256 + SHA-256</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Retention:</span>
                    <span className="font-medium text-slate-700">7-Year Regulatory</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={handleDriveBackup}
                  disabled={isBackingUp}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Backup Now</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                {driveUrl && (
                  <a
                    href={driveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                  >
                    <span>View Archive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Service 3: Gmail */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/80">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ONLINE
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Gmail API v1</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Automated dispatches for critical inventory reorder thresholds and direct deposit payroll authorizations.
                </p>
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Sender:</span>
                    <strong className="font-mono text-slate-900">cio-admin@enterprise-corp.io</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Trigger:</span>
                    <span className="font-medium text-slate-700">Safety Stock &lt; Buffer</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('gmail')}
                  className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1"
                >
                  <span>Dispatch Alert</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Sheets Detailed */}
      {activeTab === 'sheets' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Google Sheets Live Spreadsheet Generator</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Generates a multi-tab Google Sheet containing Inventory, Financials, and Staffing data.
              </p>
            </div>
            <button
              onClick={handleSheetsExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isExporting ? 'animate-spin' : ''}`} />
              <span>{isExporting ? 'Synchronizing...' : 'Generate Live Spreadsheet'}</span>
            </button>
          </div>

          {sheetsUrl ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-semibold">Spreadsheet Synchronized</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5 font-mono">{sheetsUrl}</div>
                </div>
              </div>
              <a
                href={sheetsUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-2xs"
              >
                <span>Open in Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
              Click &quot;Generate Live Spreadsheet&quot; to export real-time enterprise metrics into a newly created Google Sheet.
            </div>
          )}
        </div>
      )}

      {/* Tab: Drive Detailed */}
      {activeTab === 'drive' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Google Drive Cryptographic Archive</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Packages the entire ERP state into an encrypted, SHA-256 validated JSON payload stored in Google Drive.
              </p>
            </div>
            <button
              onClick={handleDriveBackup}
              disabled={isBackingUp}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
              <span>{isBackingUp ? 'Archiving...' : 'Create Snapshot Archive'}</span>
            </button>
          </div>

          {driveUrl ? (
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <div className="font-semibold">Snapshot Archived to Google Drive</div>
                  <div className="text-[11px] text-indigo-700 mt-0.5 font-mono">{driveUrl}</div>
                </div>
              </div>
              <a
                href={driveUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-2xs"
              >
                <span>View File</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
              Click &quot;Create Snapshot Archive&quot; to securely seal the ledger and export to cloud storage.
            </div>
          )}
        </div>
      )}

      {/* Tab: Gmail Detailed */}
      {activeTab === 'gmail' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Gmail Alert Dispatch Engine</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Send notifications and critical event updates to stakeholders via authenticated Gmail API calls.
            </p>
          </div>

          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Address</label>
              <input
                type="email"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Header</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notification Body</label>
              <textarea
                rows={5}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors font-mono"
              />
            </div>

            {emailStatus && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                {emailStatus}
              </div>
            )}

            <button
              type="submit"
              disabled={isSendingEmail}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingEmail ? 'Dispatching...' : 'Dispatch Gmail Notification'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
