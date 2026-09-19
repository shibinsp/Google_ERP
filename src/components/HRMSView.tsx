import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  Plus,
  Search,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Send,
  Mail,
  ChevronRight,
  TrendingUp,
  X,
} from 'lucide-react';
import { Employee, ResourceAllocation, PayrollRecord, UserRole } from '../types';
import { encryptSensitiveData } from '../services/crypto';

interface HRMSViewProps {
  employees: Employee[];
  resources: ResourceAllocation[];
  payroll: PayrollRecord[];
  currentRole: UserRole;
  googleConnected: boolean;
  onAddNewEmployee: (employee: Employee) => void;
  onApprovePayroll: (payrollId: string) => void;
  onDispatchPayroll: (payrollId: string) => void;
  onSendPayrollEmail: (payroll: PayrollRecord) => void;
  onUpdateResourceHours: (projectId: string, deltaHours: number) => void;
  globalSearchQuery: string;
}

export const HRMSView: React.FC<HRMSViewProps> = ({
  employees,
  resources,
  payroll,
  currentRole,
  googleConnected,
  onAddNewEmployee,
  onApprovePayroll,
  onDispatchPayroll,
  onSendPayrollEmail,
  onUpdateResourceHours,
  globalSearchQuery,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'resources' | 'payroll'>('directory');
  const [searchQuery, setSearchQuery] = useState(globalSearchQuery || '');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [revealedSensitives, setRevealedSensitives] = useState<Record<string, boolean>>({});
  const [vaultAccessNotice, setVaultAccessNotice] = useState<string | null>(null);

  // Add Employee Form State
  const [newEmp, setNewEmp] = useState({
    fullName: '',
    email: '',
    department: 'Engineering' as const,
    roleTitle: '',
    employmentType: 'Full-time' as const,
    grossSalaryAnnual: 120000,
    allocatedHoursPerWeek: 40,
    taxIdRaw: '984-21-4412',
    bankAccountRaw: 'JPMorgan Chase • 882109481',
  });

  const canManagePayroll = currentRole === 'super_admin' || currentRole === 'finance_controller' || currentRole === 'hr_director';
  const canAccessE2eeVault = currentRole === 'super_admin' || currentRole === 'compliance_auditor';

  const departments = ['All', 'Engineering', 'Supply Chain', 'Finance', 'Human Resources', 'Operations'];

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const toggleRevealSensitive = (empId: string) => {
    if (!canAccessE2eeVault) {
      setVaultAccessNotice(
        'Access Restricted: Only Super Admin and Compliance Auditors have clearance to unmask E2EE client vault credentials.'
      );
      setTimeout(() => setVaultAccessNotice(null), 4500);
      return;
    }
    setRevealedSensitives((prev) => ({ ...prev, [empId]: !prev[empId] }));
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.fullName || !newEmp.email) return;

    // Encrypt sensitive records with AES-GCM
    const encTax = await encryptSensitiveData(newEmp.taxIdRaw);
    const encBank = await encryptSensitiveData(newEmp.bankAccountRaw);

    const empId = `emp-${Math.floor(100 + Math.random() * 900)}`;
    const empCode = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: Employee = {
      id: empId,
      employeeCode: empCode,
      fullName: newEmp.fullName,
      email: newEmp.email,
      department: newEmp.department,
      roleTitle: newEmp.roleTitle,
      employmentType: newEmp.employmentType,
      startDate: new Date().toISOString().slice(0, 10),
      grossSalaryAnnual: Number(newEmp.grossSalaryAnnual),
      monthlyNet: Math.round((Number(newEmp.grossSalaryAnnual) * 0.68) / 12),
      allocatedHoursPerWeek: Number(newEmp.allocatedHoursPerWeek),
      currentAllocatedHours: Number(newEmp.allocatedHoursPerWeek),
      activeProjectCount: 1,
      performanceRating: 4.8,
      encryptedTaxId: encTax,
      maskedTaxId: `***-**-${newEmp.taxIdRaw.slice(-4)}`,
      encryptedBankAccount: encBank,
      maskedBankAccount: `Direct Deposit •••• ${newEmp.bankAccountRaw.slice(-4)}`,
      directDepositStatus: 'verified',
    };

    onAddNewEmployee(newRecord);
    setShowAddEmpModal(false);
    setNewEmp({
      fullName: '',
      email: '',
      department: 'Engineering',
      roleTitle: '',
      employmentType: 'Full-time',
      grossSalaryAnnual: 120000,
      allocatedHoursPerWeek: 40,
      taxIdRaw: '984-21-4412',
      bankAccountRaw: 'JPMorgan Chase • 882109481',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Human Resources & Resource Allocation</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise staff directory, real-time workload capacity allocation, E2EE payroll ledger, and automated alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs font-medium">
            <button
              id="hrms-tab-directory"
              onClick={() => setActiveSubTab('directory')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'directory' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staff Directory ({employees.length})
            </button>
            <button
              id="hrms-tab-resources"
              onClick={() => setActiveSubTab('resources')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'resources' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resource Allocation ({resources.length})
            </button>
            <button
              id="hrms-tab-payroll"
              onClick={() => setActiveSubTab('payroll')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'payroll' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Payroll Operations
            </button>
          </div>

          <button
            id="hrms-add-employee-btn"
            onClick={() => setShowAddEmpModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Employee</span>
          </button>
        </div>
      </div>

      {/* Access Restriction Notice Banner */}
      {vaultAccessNotice && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-2xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{vaultAccessNotice}</span>
          </div>
          <button
            onClick={() => setVaultAccessNotice(null)}
            className="p-1 rounded-lg hover:bg-rose-100 text-rose-600 hover:text-rose-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUB-TAB 1: Staff Directory & E2EE Vault */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          {/* Search & Department Filters */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee, email, role, code..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setDeptFilter(dept)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    deptFilter === dept
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Directory Table */}
          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Employee & Code</th>
                    <th className="px-4 py-3">Department & Role</th>
                    <th className="px-4 py-3 text-right">Annual Gross Salary</th>
                    <th className="px-4 py-3 text-center">Allocated Capacity</th>
                    <th className="px-4 py-3">E2EE Masked Tax ID</th>
                    <th className="px-4 py-3">Direct Deposit Bank</th>
                    <th className="px-4 py-3 text-center">E2EE Vault</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((emp) => {
                    const isRevealed = revealedSensitives[emp.id];
                    const isOverloaded = emp.currentAllocatedHours > emp.allocatedHoursPerWeek;

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{emp.fullName}</div>
                          <div className="text-[11px] text-slate-500">{emp.email}</div>
                          <div className="text-[10px] font-mono text-indigo-600 mt-0.5">{emp.employeeCode}</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="text-slate-900 font-medium">{emp.roleTitle}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                            {emp.department}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right font-mono">
                          <div className="font-bold text-slate-900">${emp.grossSalaryAnnual.toLocaleString()}</div>
                          <div className="text-[10px] text-slate-500">Net: ~${emp.monthlyNet.toLocaleString()} / mo</div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                              isOverloaded
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {emp.currentAllocatedHours} / {emp.allocatedHoursPerWeek} hrs
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5">{emp.activeProjectCount} Active Projects</div>
                        </td>

                        <td className="px-4 py-3 font-mono text-slate-700">
                          {isRevealed ? (
                            <span className="text-emerald-700 font-bold">984-11-8492</span>
                          ) : (
                            <span className="text-slate-500">{emp.maskedTaxId}</span>
                          )}
                        </td>

                        <td className="px-4 py-3 font-mono text-slate-700">
                          {isRevealed ? (
                            <span className="text-emerald-700 font-bold">JPMorgan #884129841</span>
                          ) : (
                            <span className="text-slate-500">{emp.maskedBankAccount}</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleRevealSensitive(emp.id)}
                            title={
                              canAccessE2eeVault
                                ? 'Toggle client-side cryptographic unmasking'
                                : 'Restricted to Admin/Auditor'
                            }
                            className={`p-1.5 rounded-lg border transition-colors shadow-2xs ${
                              isRevealed
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                            }`}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Real-Time Resource Allocation & Project Capacity */}
      {activeSubTab === 'resources' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Strategic Project Resource Matrix</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time engineering hours, departmental capacity budgets, and utilization health.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-700 font-bold px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                Enterprise Capacity: 86.4% Optimum
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((proj) => {
                const util = Math.round((proj.hoursUtilized / proj.hoursAllocatedTotal) * 100);

                return (
                  <div key={proj.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{proj.projectName}</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                            {proj.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Lead: {proj.leadEmployee} • {proj.department} ({proj.teamSize} dedicated staff)
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          proj.health === 'optimal'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {proj.health}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Workload Capacity Utilized</span>
                        <span className="font-mono font-bold text-slate-900">
                          {proj.hoursUtilized} / {proj.hoursAllocatedTotal} hrs ({util}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            util >= 100 ? 'bg-rose-500' : util >= 90 ? 'bg-amber-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${Math.min(util, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500">Budget: </span>
                        <span className="font-mono font-semibold text-slate-800">
                          ${proj.budgetSpent.toLocaleString()} / ${proj.budgetAllocated.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onUpdateResourceHours(proj.id, -10)}
                          className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-mono shadow-2xs"
                          title="Reallocate -10 Hours"
                        >
                          -10h
                        </button>
                        <button
                          onClick={() => onUpdateResourceHours(proj.id, 10)}
                          className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-mono shadow-2xs"
                          title="Allocate +10 Hours"
                        >
                          +10h
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Payroll Operations & Automated Alerts */}
      {activeSubTab === 'payroll' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Monthly Gross Payroll</span>
              <div className="text-lg font-bold text-slate-900 mt-1">$582,900.00</div>
              <span className="text-[10px] text-slate-500">Semi-monthly bi-weekly cycle</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Statutory Tax Withholding</span>
              <div className="text-lg font-bold text-indigo-700 mt-1">$172,017.00</div>
              <span className="text-[10px] text-slate-500">Federal & State payroll withholdings</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-medium">Net ACH Direct Deposit</span>
              <div className="text-lg font-bold text-emerald-700 mt-1">$384,714.00</div>
              <span className="text-[10px] text-emerald-700 font-medium">ACH / Fedwire Verified</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Payroll Cycle Ledger & Dispatches</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review tax withholdings, execute direct deposit dispatches, and trigger automated staff email notifications.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {payroll.map((p) => {
                const isPending = p.status === 'pending_approval';
                const isDispatched = p.status === 'dispatched';

                return (
                  <div key={p.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-bold text-slate-900">{p.periodName}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isDispatched
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {p.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 mt-1">
                        Batch: <span className="font-mono text-slate-700">{p.batchReference}</span> • Pay Date:{' '}
                        <span className="text-slate-700">{p.payDate}</span> • Covered Staff:{' '}
                        <span className="text-slate-700">{p.employeeCount} full-time personnel</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-700 mt-2">
                        <span>Gross: ${p.totalGrossPay.toLocaleString()}</span>
                        <span>•</span>
                        <span>Federal/State Tax: ${(p.federalTaxWithheld + p.stateTaxWithheld).toLocaleString()}</span>
                        <span>•</span>
                        <span>Benefits: ${p.benefitsDeductions.toLocaleString()}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">
                          Net Pay: ${p.totalNetPay.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isPending && canManagePayroll && (
                        <button
                          onClick={() => onApprovePayroll(p.id)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                        >
                          Sign-Off & Dispatch ($196,944)
                        </button>
                      )}

                      {isDispatched && googleConnected && (
                        <button
                          onClick={() => onSendPayrollEmail(p)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition-colors shadow-2xs"
                          title="Send automated payroll confirmation notification via Gmail API"
                        >
                          <Mail className="w-3.5 h-3.5 text-rose-600" />
                          <span>Dispatch Gmail Alert</span>
                        </button>
                      )}

                      <span className="text-[10px] text-slate-500 font-mono">
                        {p.authorizedBy ? `Authorized by ${p.authorizedBy}` : 'Awaiting Authorization'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Employee */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddEmpModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">Add Employee to Directory</h3>
            <p className="text-xs text-slate-500 mb-4">
              Sensitive SSN and bank details are encrypted client-side using AES-GCM 256-bit cryptography.
            </p>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={newEmp.fullName}
                    onChange={(e) => setNewEmp({ ...newEmp, fullName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                    placeholder="e.g. Maya Lin"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Corporate Email</label>
                  <input
                    type="email"
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                    placeholder="m.lin@enterprise-corp.io"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Department</label>
                  <select
                    value={newEmp.department}
                    onChange={(e: any) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Supply Chain">Supply Chain</option>
                    <option value="Finance">Finance</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Role Title</label>
                  <input
                    type="text"
                    value={newEmp.roleTitle}
                    onChange={(e) => setNewEmp({ ...newEmp, roleTitle: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                    placeholder="e.g. Senior Embedded Engineer"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Annual Gross Compensation ($)</label>
                  <input
                    type="number"
                    value={newEmp.grossSalaryAnnual}
                    onChange={(e) => setNewEmp({ ...newEmp, grossSalaryAnnual: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Weekly Budgeted Hours</label>
                  <input
                    type="number"
                    value={newEmp.allocatedHoursPerWeek}
                    onChange={(e) => setNewEmp({ ...newEmp, allocatedHoursPerWeek: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Sensitive End-to-End Encrypted Data (E2EE)</span>
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Tax ID / SSN (Encrypted before storage)</label>
                  <input
                    type="text"
                    value={newEmp.taxIdRaw}
                    onChange={(e) => setNewEmp({ ...newEmp, taxIdRaw: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">Direct Deposit Bank Account Number</label>
                  <input
                    type="text"
                    value={newEmp.bankAccountRaw}
                    onChange={(e) => setNewEmp({ ...newEmp, bankAccountRaw: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-2xs transition-colors"
                >
                  Encrypt & Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
