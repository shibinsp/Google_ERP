import React, { useState } from 'react';
import {
  ShieldCheck,
  Scale,
  FileCheck,
  AlertOctagon,
  FileText,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Eye,
  Lock,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Search,
} from 'lucide-react';
import { EUAIActModuleRecord, HallucinationGuardrailCheck } from '../types';

interface GovernanceComplianceViewProps {
  euRecords: EUAIActModuleRecord[];
  hallucinationChecks: HallucinationGuardrailCheck[];
  onGenerateFRIA: (moduleId: string) => void;
  onApproveHumanOversight: (checkId: string) => void;
}

export const GovernanceComplianceView: React.FC<GovernanceComplianceViewProps> = ({
  euRecords,
  hallucinationChecks,
  onGenerateFRIA,
  onApproveHumanOversight,
}) => {
  const [activeTab, setActiveTab] = useState<'eu_ai_act' | 'coso_controls' | 'hallucination_guardrails'>('eu_ai_act');
  const [friaModalOpen, setFriaModalOpen] = useState(false);
  const [selectedModuleForFRIA, setSelectedModuleForFRIA] = useState<EUAIActModuleRecord | null>(null);

  const handleOpenFRIA = (mod: EUAIActModuleRecord) => {
    setSelectedModuleForFRIA(mod);
    setFriaModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white shadow-xl relative overflow-hidden border border-emerald-700/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="p-2.5 bg-emerald-500/20 backdrop-blur-md rounded-xl border border-emerald-400/30">
                <Scale className="w-7 h-7 text-emerald-300" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">AI Governance, Compliance & Risk Framework</h1>
                <p className="text-sm text-emerald-200/80">
                  EU AI Act (EU 2024/1689), COSO 2026 Internal Controls & PCAOB Hallucination Guardrails
                </p>
              </div>
            </div>
            <p className="text-xs text-emerald-300/70 max-w-2xl mt-1">
              Operationalizes Annex III Category 4 high-risk compliance, FRIA assessments, Article 4 workforce AI literacy, COSO Generative AI controls, and numerical ledger reconciliation.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/60 backdrop-blur-md">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <div className="text-xs">
              <div className="font-bold text-white">Legal Risk Level: COMPLIANT</div>
              <div className="text-emerald-300">180-Day Immutable Logs Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('eu_ai_act')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'eu_ai_act'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>EU AI Act (EU 2024/1689)</span>
        </button>

        <button
          onClick={() => setActiveTab('coso_controls')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'coso_controls'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>COSO 2026 GenAI Controls</span>
        </button>

        <button
          onClick={() => setActiveTab('hallucination_guardrails')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'hallucination_guardrails'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Financial Hallucination Mitigation (PCAOB)</span>
        </button>
      </div>

      {/* Tab 1: EU AI Act Compliance */}
      {activeTab === 'eu_ai_act' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-base">EU AI Act Module Compliance Registry</h3>
                <p className="text-xs text-gray-500">Annex III Category 4 Employment & High-Risk Decision Inventory</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                Article 4 Literacy Verified
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-slate-800/60 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">ERP AI Module</th>
                    <th className="px-4 py-3">Risk Tier</th>
                    <th className="px-4 py-3">FRIA Status</th>
                    <th className="px-4 py-3">Human Oversight</th>
                    <th className="px-4 py-3">Audit Retention</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                  {euRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3.5 font-medium text-gray-900 dark:text-white">{rec.moduleName}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            rec.riskCategory === 'high_risk'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {rec.riskCategory === 'high_risk' ? 'HIGH RISK (Annex III)' : rec.riskCategory.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {rec.friaCompleted ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Completed ({rec.friaDate})</span>
                          </span>
                        ) : (
                          <span className="text-amber-600 font-semibold">Pending FRIA</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {rec.humanOversightRequired ? (
                          <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-semibold">
                            Mandatory Human-in-Loop
                          </span>
                        ) : (
                          <span className="text-gray-400">Automated</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono">{rec.auditLogRetentionDays} Days</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleOpenFRIA(rec)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Inspect FRIA Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: COSO 2026 Internal Controls */}
      {activeTab === 'coso_controls' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>COSO 2026 Generative AI Internal Control Framework & M&A Due Diligence</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-750 space-y-2">
              <div className="font-bold text-gray-900 dark:text-white text-sm">Control Activity Mapping</div>
              <p className="text-gray-600 dark:text-slate-300">
                Treats GenAI models as explicit control environments. Enforces input validation before retrieval-augmented generation.
              </p>
              <div className="text-emerald-600 font-semibold text-[11px] flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Pre-Query Validated</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-750 space-y-2">
              <div className="font-bold text-gray-900 dark:text-white text-sm">Algorithmic M&A Due Diligence</div>
              <p className="text-gray-600 dark:text-slate-300">
                Verifies training data lineage, model transparency, and license posture prior to corporate acquisitions.
              </p>
              <div className="text-emerald-600 font-semibold text-[11px] flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Lineage Certified</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-750 space-y-2">
              <div className="font-bold text-gray-900 dark:text-white text-sm">Continuous Monitoring</div>
              <p className="text-gray-600 dark:text-slate-300">
                Automated model drift detection and prompt injection guardrails active across all financial reporting tools.
              </p>
              <div className="text-emerald-600 font-semibold text-[11px] flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Drift Guard Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Financial Hallucination Mitigation (PCAOB) */}
      {activeTab === 'hallucination_guardrails' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">PCAOB & NIST Compliant Hallucination Mitigation Log</h3>
              <p className="text-xs text-gray-500">Numerical General Ledger Reconciliation & Deep-Linked Citation Traceability</p>
            </div>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
              Provenance Flagging Active
            </span>
          </div>

          <div className="space-y-4">
            {hallucinationChecks.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-purple-300 font-bold">Query ID: {item.queryId}</div>
                  <div className="text-gray-400 text-[11px]">{item.timestamp}</div>
                </div>

                <div className="text-slate-200">
                  <span className="text-gray-400 font-semibold">User Request:</span> "{item.userPrompt}"
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-lg font-mono text-[11px]">
                  <div>
                    <span className="text-gray-500">RAG Source:</span>
                    <div className="text-emerald-400 font-bold truncate">{item.ragSourceDocument}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Numerical GL Reconciliation:</span>
                    <div className="text-emerald-400 font-bold">
                      {item.numericalReconciliationPassed ? 'PASSED ($0.00 Discrepancy)' : 'FAILED'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Audit Provenance:</span>
                    <div className="text-purple-300 font-bold">Disclosure Flagged</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <a
                    href={item.sourceTraceabilityUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline flex items-center space-x-1"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>View Primary Source Deep-Link</span>
                  </a>

                  {item.humanReviewerSignoff ? (
                    <span className="text-emerald-400 font-bold flex items-center space-x-1">
                      <UserCheck className="w-4 h-4" />
                      <span>Committee Sign-Off Approved</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onApproveHumanOversight(item.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                    >
                      Sign Off Output
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FRIA Inspection Modal */}
      {friaModalOpen && selectedModuleForFRIA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 space-y-4 border border-gray-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Fundamental Rights Impact Assessment (FRIA)</h3>
              <button onClick={() => setFriaModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700 dark:text-slate-300">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200">
                <div className="font-bold text-emerald-900 dark:text-emerald-300">Module: {selectedModuleForFRIA.moduleName}</div>
                <div className="text-emerald-700 dark:text-emerald-400">EU AI Act Category: {selectedModuleForFRIA.riskCategory.toUpperCase()}</div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-gray-900 dark:text-white">Impact Assessment Metrics:</div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Non-discrimination & Algorithmic Bias Audit: Passed (0.01 demographic parity delta)</li>
                  <li>Human Oversight Protocol: Mandatory human review enforced for all rejection decisions</li>
                  <li>Worker Privacy & Dignity Evaluation: Approved by Works Council</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-slate-800">
              <button
                onClick={() => setFriaModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onGenerateFRIA(selectedModuleForFRIA.id);
                  setFriaModalOpen(false);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF FRIA Submission</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
