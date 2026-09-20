import React from 'react';
import {
  Boxes,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CreditCard,
  FileSpreadsheet,
  HardDrive,
  Mail,
  CheckCircle2,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronRight,
  Plus,
  Command,
  HelpCircle,
  Zap,
  Activity,
  Calendar,
} from 'lucide-react';
import {
  UserRole,
  InventoryItem,
  Employee,
  ResourceAllocation,
  PayrollRecord,
  FinancialMetric,
  PaymentGatewayConfig,
  PaymentGatewayTransaction,
  NotificationAlert,
  DashboardWidgetConfig,
} from '../types';
import { ROLE_PROFILES } from '../data/initialData';

interface DashboardViewProps {
  currentRole: UserRole;
  inventory: InventoryItem[];
  employees: Employee[];
  resources: ResourceAllocation[];
  payroll: PayrollRecord[];
  metrics: FinancialMetric;
  gateways: PaymentGatewayConfig[];
  transactions: PaymentGatewayTransaction[];
  notifications: NotificationAlert[];
  widgets: DashboardWidgetConfig[];
  googleConnected: boolean;
  onNavigateTab: (tab: any) => void;
  onQuickReorder: (itemId: string) => void;
  onSendLowStockEmail: (item: InventoryItem) => void;
  onOpenGoogleModal: () => void;
  onOpenPaymentSimulator: () => void;
  onApprovePayroll: (payrollId: string) => void;
  isSyncing: boolean;
  onRefreshData: () => void;
  onOpenCommandPalette?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentRole,
  inventory,
  employees,
  resources,
  payroll,
  metrics,
  gateways,
  transactions,
  notifications,
  widgets,
  googleConnected,
  onNavigateTab,
  onQuickReorder,
  onSendLowStockEmail,
  onOpenGoogleModal,
  onOpenPaymentSimulator,
  onApprovePayroll,
  isSyncing,
  onRefreshData,
  onOpenCommandPalette,
}) => {
  const roleProfile = ROLE_PROFILES[currentRole];
  const isWidgetEnabled = (id: string) => widgets.find((w) => w.id === id)?.enabled ?? true;

  // Real-time operational calculations
  const totalInventoryValuation = inventory.reduce((sum, i) => sum + i.currentStock * i.unitCost, 0);
  const lowStockItems = inventory.filter((i) => i.currentStock <= i.reorderPoint);
  const avgTurnoverRatio = (
    inventory.reduce((sum, i) => sum + i.turnoverRatio, 0) / (inventory.length || 1)
  ).toFixed(1);
  const avgDsi = Math.round(
    inventory.reduce((sum, i) => sum + i.daysSalesOfInventory, 0) / (inventory.length || 1)
  );
  const totalAllocatedHours = resources.reduce((sum, r) => sum + r.hoursAllocatedTotal, 0);
  const totalUtilizedHours = resources.reduce((sum, r) => sum + r.hoursUtilized, 0);
  const enterpriseCapacityUtilization = Math.round((totalUtilizedHours / (totalAllocatedHours || 1)) * 100);
  const pendingPayroll = payroll.find((p) => p.status === 'pending_approval');

  // Dynamic greeting based on current local hour
  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Workspace Hero Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-mono">
                {roleProfile.title}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Friday, Sep 18, 2026</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Ledger Synchronized</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {timeGreeting}, {roleProfile.title.split('(')[0]}
            </h1>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Global operations overview: Working capital turnover running at{' '}
              <strong className="text-slate-900 font-mono">{avgTurnoverRatio}x</strong>, workforce utilization at{' '}
              <strong className="text-slate-900 font-mono">{enterpriseCapacityUtilization}%</strong>, and liquid cash reserves at{' '}
              <strong className="text-slate-900 font-mono">${(metrics.cashOnHand / 1000000).toFixed(2)}M</strong>.
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onOpenCommandPalette && (
              <button
                id="hero-command-center-btn"
                onClick={onOpenCommandPalette}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 shadow-2xs transition-all"
              >
                <Command className="w-3.5 h-3.5 text-indigo-600" />
                <span>Command (⌘K)</span>
              </button>
            )}

            <button
              id="dashboard-refresh-btn"
              onClick={onRefreshData}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span>{isSyncing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            <button
              id="dashboard-google-sheets-export-btn"
              onClick={onOpenGoogleModal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Workspace Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* Widget: Core KPI Summary Grid */}
      {isWidgetEnabled('kpi_summary') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Inventory Valuation */}
          <div
            id="kpi-inventory-valuation"
            onClick={() => onNavigateTab('inventory')}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Inventory Valuation</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 group-hover:scale-105 transition-transform">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2.5">
              ${totalInventoryValuation.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-2 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+6.4% MoM Velocity</span>
              <span className="text-slate-400 font-normal">({inventory.length} active SKUs)</span>
            </div>
          </div>

          {/* KPI 2: Inventory Turnover & DSI */}
          <div
            id="kpi-inventory-turnover"
            onClick={() => onNavigateTab('analytics')}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Turnover Velocity (DSI)</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2.5">
              {avgTurnoverRatio}x <span className="text-xs font-normal text-slate-500 font-sans">/ yr</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-2 font-medium">
              <span>Avg DSI: {avgDsi} days</span>
              <span className="text-slate-400 font-normal">(Optimal benchmark: &lt;45d)</span>
            </div>
          </div>

          {/* KPI 3: Resource Capacity Utilization */}
          <div
            id="kpi-resource-capacity"
            onClick={() => onNavigateTab('hrms')}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Workforce Utilization</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/80 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2.5">
              {enterpriseCapacityUtilization}% <span className="text-xs font-normal text-slate-500 font-sans">capacity</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-indigo-700 mt-2 font-medium">
              <span>{totalUtilizedHours}/{totalAllocatedHours} hrs</span>
              <span className="text-slate-400 font-normal">({employees.length} staff)</span>
            </div>
          </div>

          {/* KPI 4: Financial Net Income & Cash */}
          <div
            id="kpi-cash-reserves"
            onClick={() => onNavigateTab('finance')}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Liquid Cash Reserves</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 group-hover:scale-105 transition-transform">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2.5">
              ${(metrics.cashOnHand / 1000000).toFixed(2)}M
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-2 font-medium">
              <span>Margin: {metrics.grossProfitMargin}%</span>
              <span className="text-slate-400 font-normal">(18 mo runway)</span>
            </div>
          </div>
        </div>
      )}

      {/* Widget: Automated Stock Alerts & Low Stock Trigger Banner */}
      {isWidgetEnabled('low_stock_banner') && lowStockItems.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/90 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200/70">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700 border border-rose-200">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Automated Low-Stock Trigger Warning</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-bold">
                    {lowStockItems.length} SKUs Alerting
                  </span>
                </h3>
                <p className="text-xs text-rose-900/80 mt-0.5">
                  Stock levels have dropped below configured safety buffer. Automated purchase order generation recommended.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs text-rose-700 hover:text-rose-900 flex items-center gap-1 font-semibold"
            >
              <span>View Full Inventory Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {lowStockItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-white border border-rose-200/80 shadow-2xs flex items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">{item.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    SKU: <span className="font-mono text-slate-700">{item.sku}</span> • Stock:{' '}
                    <span className="font-bold text-rose-600 font-mono">{item.currentStock}</span> / Reorder: {item.reorderPoint}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onQuickReorder(item.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors shadow-2xs"
                  >
                    Reorder
                  </button>
                  {googleConnected && (
                    <button
                      onClick={() => onSendLowStockEmail(item)}
                      title="Dispatch low stock alert via Gmail API"
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Turnover Trends and Resource Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget: Inventory Turnover Trends */}
        {isWidgetEnabled('inventory_turnover') && (
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Inventory Turnover Trends & Velocity</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Annual turn ratios and Days Sales of Inventory (DSI)</p>
                </div>
                <button
                  onClick={() => onNavigateTab('analytics')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <span>Detailed Trends</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3 mt-4">
                {inventory.slice(0, 4).map((item) => {
                  const turnPercentage = Math.min(Math.round((item.turnoverRatio / 15) * 100), 100);
                  return (
                    <div key={item.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 truncate max-w-[200px]">{item.name}</span>
                        <div className="flex items-center gap-3 text-right font-mono tabular-nums">
                          <span className="text-emerald-700 font-bold">{item.turnoverRatio}x / yr</span>
                          <span className="text-slate-500">{item.daysSalesOfInventory}d DSI</span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                          style={{ width: `${turnPercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Benchmark: High velocity hardware &gt;8.0x</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Turnover Optimal
              </span>
            </div>
          </div>
        )}

        {/* Widget: Real-Time Resource Allocation */}
        {isWidgetEnabled('resource_allocation') && (
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Real-Time Resource Allocation</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Project workload bandwidth and team capacity utilization</p>
                </div>
                <button
                  onClick={() => onNavigateTab('hrms')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <span>Staff Directory</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3 mt-4">
                {resources.slice(0, 4).map((project) => {
                  const utilization = Math.round((project.hoursUtilized / project.hoursAllocatedTotal) * 100);
                  const isHigh = utilization >= 90;
                  return (
                    <div key={project.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{project.projectName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium">
                            {project.department}
                          </span>
                        </div>
                        <span
                          className={`text-[11px] font-mono tabular-nums font-bold ${
                            isHigh ? 'text-amber-700' : 'text-emerald-700'
                          }`}
                        >
                          {utilization}% Utilized
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isHigh ? 'bg-amber-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Lead: {project.leadEmployee} ({project.teamSize} engineers)</span>
                        <span className="font-mono tabular-nums">{project.hoursUtilized} / {project.hoursAllocatedTotal} hrs</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Overall Enterprise Staff Load: 86.4%</span>
              <span className="text-slate-700 font-medium">No severe bottlenecks detected</span>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Payment Gateways Telemetry and Payroll Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget: Payment Gateway Status & Telemetry */}
        {isWidgetEnabled('gateway_status') && (
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Third-Party Payment Gateways</h3>
                <p className="text-xs text-slate-500 mt-0.5">Stripe, PayPal, Square, Fedwire/ACH settlement channels</p>
              </div>
              <button
                id="dashboard-open-payment-sim-btn"
                onClick={onOpenPaymentSimulator}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Simulate Gateway</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
              {gateways.map((gw) => (
                <div key={gw.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-900">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span>{gw.name.split(' ')[0]}</span>
                  </div>
                  <div className="text-xs font-bold font-mono tabular-nums text-slate-900 mt-1">
                    ${(gw.totalProcessedMonth / 1000).toFixed(0)}k
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium">{gw.successRate}% OK</div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Recent Gateway Transactions
              </span>
              <div className="space-y-2">
                {transactions.slice(0, 2).map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs text-slate-700"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{txn.customerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {txn.gateway.toUpperCase()} • {txn.transactionId}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold font-mono tabular-nums text-emerald-700">+${txn.amount.toLocaleString()}</div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                        {txn.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Widget: Payroll Processing Status & Alert */}
        {isWidgetEnabled('payroll_status') && (
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Payroll & Treasury Updates</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Automated payroll cycles and direct deposit dispatches</p>
                </div>
                <button
                  onClick={() => onNavigateTab('hrms')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <span>Payroll Center</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {pendingPayroll ? (
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-900 block">{pendingPayroll.periodName}</span>
                      <span className="text-[11px] text-slate-700 mt-0.5 block">
                        Gross Pay: ${pendingPayroll.totalGrossPay.toLocaleString()} • Net: $
                        {pendingPayroll.totalNetPay.toLocaleString()} ({pendingPayroll.employeeCount} staff)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold uppercase">
                      Action Required
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => onApprovePayroll(pendingPayroll.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                    >
                      Authorize Direct Deposit ($196,944)
                    </button>
                    <span className="text-[10px] text-slate-500">Requires CFO/HR approval</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-3 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">All Active Cycles Dispatched</h4>
                    <p className="text-[11px] text-slate-500">Direct deposit ACH batches executed and notifications sent.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Next Disbursement Cycle: Oct 15, 2026</span>
              <span className="text-emerald-700 font-semibold">Auto-Calculations Synchronized</span>
            </div>
          </div>
        )}
      </div>

      {/* Widget: Google Workspace Cloud Sync Hub */}
      {isWidgetEnabled('cloud_sync_hub') && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-2xs">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Google Workspace Enterprise Cloud Infrastructure</span>
                  {googleConnected ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      Live OAuth Connected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                      Setup Ready
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seamless synchronization with Google Sheets (live reporting), Google Drive (encrypted backups), and Gmail (automated alerts).
                </p>
              </div>
            </div>

            <button
              id="dashboard-open-workspace-modal-btn"
              onClick={onOpenGoogleModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 shadow-2xs transition-colors shrink-0"
            >
              <span>Manage Integrations</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-900">Google Sheets v4</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  1-Click push of real-time inventory, resource allocation, and financials into formatted multi-tab spreadsheet.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3">
              <HardDrive className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-900">Google Drive v3</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Automated cloud archival of cryptographic audit snapshots sealed with SHA-256 integrity hashes.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3">
              <Mail className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-900">Gmail API v1</div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Direct dispatch of automated low-stock warnings and payroll authorization alerts to enterprise stakeholders.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
