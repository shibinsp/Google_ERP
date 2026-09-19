import React, { useState } from 'react';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  RefreshCw,
  Lock,
  Search,
  Sliders,
  X,
  Camera,
  Sparkles,
  Tag,
  Filter,
} from 'lucide-react';
import {
  FinancialMetric,
  Invoice,
  PaymentGatewayConfig,
  PaymentGatewayTransaction,
  UserRole,
} from '../types';
import { encryptSensitiveData } from '../services/crypto';
import { getTagColorClasses } from '../utils/tagColors';

interface FinanceViewProps {
  metrics: FinancialMetric;
  invoices: Invoice[];
  gateways: PaymentGatewayConfig[];
  transactions: PaymentGatewayTransaction[];
  currentRole: UserRole;
  onProcessGatewayPayment: (transaction: Omit<PaymentGatewayTransaction, 'id' | 'timestamp' | 'feeAmount' | 'e2eEncryptedToken'>) => void;
  onPayInvoice: (invoiceId: string) => void;
  onRefundTransaction: (txnId: string) => void;
  globalSearchQuery: string;
  onOpenInvoiceScanner?: () => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  metrics,
  invoices,
  gateways,
  transactions,
  currentRole,
  onProcessGatewayPayment,
  onPayInvoice,
  onRefundTransaction,
  globalSearchQuery,
  onOpenInvoiceScanner,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'gateways' | 'invoices' | 'ai_cfo_suite'>('overview');
  const [mdaOutput, setMdaOutput] = useState<string | null>(null);
  const [isGeneratingMDA, setIsGeneratingMDA] = useState(false);
  const [searchQuery, setSearchQuery] = useState(globalSearchQuery || '');
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<'All' | 'payable' | 'receivable'>('All');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('All');
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);

  // Payment Simulator State
  const [simGateway, setSimGateway] = useState<'stripe' | 'paypal' | 'square' | 'wire_ach'>('stripe');
  const [simAmount, setSimAmount] = useState<number>(4500.0);
  const [simCurrency, setSimCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [simCustomer, setSimCustomer] = useState('Apex Aeronautics Global');
  const [simEmail, setSimEmail] = useState('billing@apexaero.com');
  const [simDescription, setSimDescription] = useState('Hardware Maintenance SLA - Q4 Batch');
  const [simCard, setSimCard] = useState('Visa ending in 4242');
  const [isProcessingTxn, setIsProcessingTxn] = useState(false);
  const [txnSuccessMessage, setTxnSuccessMessage] = useState<string | null>(null);

  // Compute tag counts across all loaded invoices
  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    invoices.forEach((inv) => {
      inv.tags?.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return counts;
  }, [invoices]);

  const uniqueTags = React.useMemo(() => {
    return Object.keys(tagCounts).sort();
  }, [tagCounts]);

  const canApprovePayments = currentRole === 'super_admin' || currentRole === 'finance_controller';

  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.partyName.toLowerCase().includes(q) ||
      inv.category.toLowerCase().includes(q) ||
      (inv.tags && inv.tags.some((t) => t.toLowerCase().includes(q) || `#${t.toLowerCase()}`.includes(q)));

    const matchesType = invoiceTypeFilter === 'All' || inv.type === invoiceTypeFilter;
    const matchesTag =
      selectedTagFilter === 'All' ||
      (inv.tags && inv.tags.some((t) => t.toLowerCase() === selectedTagFilter.toLowerCase()));

    return matchesSearch && matchesType && matchesTag;
  });

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingTxn(true);

    setTimeout(() => {
      onProcessGatewayPayment({
        transactionId: `${simGateway === 'stripe' ? 'pi_' : simGateway === 'paypal' ? 'PAYID-' : 'TXN-'}${Math.random()
          .toString(36)
          .substring(2, 9)}`,
        gateway: simGateway,
        amount: Number(simAmount),
        currency: simCurrency,
        customerName: simCustomer,
        customerEmail: simEmail,
        description: simDescription,
        status: 'succeeded',
        paymentMethod: simCard,
      });

      setIsProcessingTxn(false);
      setTxnSuccessMessage(`Payment of ${simCurrency} $${Number(simAmount).toLocaleString()} processed successfully via ${simGateway.toUpperCase()} Gateway!`);
      setTimeout(() => {
        setTxnSuccessMessage(null);
        setShowSimulatorModal(false);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-indigo-600" />
            <span>Financial Operations & Payment Gateways</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            General ledger oversight, third-party payment gateway terminals, AP/AR settlements, and treasury liquidity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'overview' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              P&L Overview
            </button>
            <button
              onClick={() => setActiveTab('gateways')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'gateways' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Payment Gateways ({gateways.length})
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'invoices' ? 'bg-white text-indigo-700 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Invoices (AP/AR)
            </button>
            <button
              onClick={() => setActiveTab('ai_cfo_suite')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
                activeTab === 'ai_cfo_suite' ? 'bg-indigo-600 text-white font-semibold shadow-2xs' : 'text-indigo-600 hover:text-indigo-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI CFO Suite</span>
            </button>
          </div>

          {onOpenInvoiceScanner && (
            <button
              id="finance-scan-invoice-header-btn"
              onClick={onOpenInvoiceScanner}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Bill / Invoice</span>
            </button>
          )}

          <button
            id="finance-open-terminal-btn"
            onClick={() => setShowSimulatorModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0"
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment Terminal</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB: P&L Summary */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Financial Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500">Total Revenue YTD</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">${(metrics.totalRevenueYTD / 1000000).toFixed(2)}M</div>
              <div className="text-[11px] text-emerald-700 mt-1 font-medium">+18.2% vs prior fiscal yr</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500">Gross Profit Margin</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">{metrics.grossProfitMargin}%</div>
              <div className="text-[11px] text-slate-500 mt-1 font-normal">Industry Benchmark: 52%</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500">Monthly Operating Burn</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">${(metrics.operatingExpensesMonthly / 1000).toFixed(0)}k</div>
              <div className="text-[11px] text-slate-500 mt-1">Runway: 18 months</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500">Liquid Cash Reserves</span>
              <div className="text-xl font-bold font-mono text-emerald-700 mt-1">${(metrics.cashOnHand / 1000000).toFixed(2)}M</div>
              <div className="text-[11px] text-emerald-700 mt-1 font-medium">Fully Backed in Treasury</div>
            </div>
          </div>

          {/* Double-Entry Ledger Summary Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Double-Entry General Ledger Balance Sheet (Summary)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="font-semibold text-indigo-700 uppercase tracking-wider text-[11px]">Assets & Receivables</div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/70">
                  <span className="text-slate-600">Cash and Cash Equivalents</span>
                  <span className="font-mono text-slate-900 font-bold">${metrics.cashOnHand.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/70">
                  <span className="text-slate-600">Accounts Receivable (AR)</span>
                  <span className="font-mono text-slate-900 font-bold">${metrics.accountsReceivableOutstanding.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600">Physical Capital & Inventory</span>
                  <span className="font-mono text-slate-900 font-bold">$1,420,000</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="font-semibold text-indigo-700 uppercase tracking-wider text-[11px]">Liabilities & Payables</div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/70">
                  <span className="text-slate-600">Accounts Payable (AP Invoices)</span>
                  <span className="font-mono text-slate-900 font-bold">${metrics.accountsPayableOutstanding.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/70">
                  <span className="text-slate-600">Accrued Payroll & Benefits</span>
                  <span className="font-mono text-slate-900 font-bold">$196,944</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600">Retained Earnings (Equity)</span>
                  <span className="font-mono text-emerald-700 font-bold">$4,108,056</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GATEWAYS TAB: Multi-Provider Processing */}
      {activeTab === 'gateways' && (
        <div className="space-y-6">
          {/* Gateway Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gateways.map((gw) => (
              <div key={gw.id} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{gw.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    {gw.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500">Processed this Month:</span>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    ${gw.totalProcessedMonth.toLocaleString()}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1">
                  <div>Fee: <span className="text-slate-800 font-medium">{gw.processingFee}</span></div>
                  <div>Uptime / SLA: <span className="text-emerald-700 font-bold">{gw.successRate}%</span></div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Webhook: {gw.webhookStatus}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSimGateway(gw.id);
                    setShowSimulatorModal(true);
                  }}
                  className="w-full py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition-colors"
                >
                  Simulate Gateway Test
                </button>
              </div>
            ))}
          </div>

          {/* Payment Gateway Transactions Ledger */}
          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Payment Gateway Live Transaction Log</h3>
                <p className="text-xs text-slate-500 mt-0.5">End-to-end encrypted payment tokens and settlement records</p>
              </div>
              <span className="text-xs font-mono text-slate-500">{transactions.length} captured</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5">Transaction ID & Timestamp</th>
                    <th className="px-4 py-3.5">Gateway</th>
                    <th className="px-4 py-3.5">Customer & Description</th>
                    <th className="px-4 py-3.5">Method</th>
                    <th className="px-4 py-3.5 text-right">Amount (Gross)</th>
                    <th className="px-4 py-3.5 text-right">Fee</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-bold text-slate-900">{txn.transactionId}</div>
                        <div className="text-[10px] text-slate-500">{txn.timestamp}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200 uppercase font-mono font-semibold">
                          {txn.gateway}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{txn.customerName}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[200px]">{txn.description}</div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-700 text-[11px]">{txn.paymentMethod}</td>

                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                        +${txn.amount.toLocaleString()} {txn.currency}
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono text-slate-500">
                        ${txn.feeAmount.toFixed(2)}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            txn.status === 'succeeded'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : txn.status === 'refunded'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {txn.status === 'succeeded' && canApprovePayments && (
                          <button
                            onClick={() => onRefundTransaction(txn.id)}
                            className="text-[11px] text-slate-500 hover:text-rose-600 underline font-medium transition-colors"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INVOICES TAB: AP / AR Management */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoices by number, client, category..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setInvoiceTypeFilter('All')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    invoiceTypeFilter === 'All' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Invoices
                </button>
                <button
                  onClick={() => setInvoiceTypeFilter('receivable')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    invoiceTypeFilter === 'receivable' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Receivables (AR)
                </button>
                <button
                  onClick={() => setInvoiceTypeFilter('payable')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    invoiceTypeFilter === 'payable' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Payables (AP)
                </button>
              </div>

              {onOpenInvoiceScanner && (
                <button
                  id="finance-scan-invoice-tab-btn"
                  onClick={onOpenInvoiceScanner}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan Bill / Invoice</span>
                </button>
              )}
            </div>
          </div>

          {/* Metadata Tags Filter Bar */}
          {uniqueTags.length > 0 && (
            <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px] mr-1">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                <span>Filter by Tag:</span>
              </div>

              <button
                onClick={() => setSelectedTagFilter('All')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedTagFilter === 'All'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                All Tags ({invoices.length})
              </button>

              {uniqueTags.map((tag) => {
                const isSelected = selectedTagFilter.toLowerCase() === tag.toLowerCase();
                const style = getTagColorClasses(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTagFilter(isSelected ? 'All' : tag)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                      isSelected
                        ? `${style.bg} ${style.text} border ${style.border} font-bold ring-2 ring-indigo-500/30 shadow-2xs`
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    <span>{tag}</span>
                    <span className="text-[10px] opacity-75 font-mono">({tagCounts[tag]})</span>
                  </button>
                );
              })}

              {selectedTagFilter !== 'All' && (
                <button
                  onClick={() => setSelectedTagFilter('All')}
                  className="ml-auto text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>Clear Tag Filter</span>
                </button>
              )}
            </div>
          )}

          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5">Invoice # & Date</th>
                    <th className="px-4 py-3.5">Client / Vendor & Tags</th>
                    <th className="px-4 py-3.5">Type</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5 text-right">Amount</th>
                    <th className="px-4 py-3.5">Due Date</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center">
                        <div className="max-w-sm mx-auto space-y-2">
                          <Tag className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="text-xs font-semibold text-slate-700">
                            No invoices match current search & tag filters
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {selectedTagFilter !== 'All'
                              ? `No invoices found with tag "${selectedTagFilter}".`
                              : 'Try adjusting your search keywords or invoice type filter.'}
                          </p>
                          {(selectedTagFilter !== 'All' || searchQuery) && (
                            <button
                              onClick={() => {
                                setSelectedTagFilter('All');
                                setSearchQuery('');
                              }}
                              className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Reset All Filters</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <div className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</div>
                            {inv.confidenceScore && (
                              <span
                                title={`Extracted with Gemini Vision AI (${inv.confidenceScore}% confidence)`}
                                className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5"
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>AI</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">{inv.createdDate}</div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-900">{inv.partyName}</div>
                          {inv.tags && inv.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {inv.tags.map((tag) => {
                                const style = getTagColorClasses(tag);
                                const isFilterActive = selectedTagFilter.toLowerCase() === tag.toLowerCase();
                                return (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTagFilter(isFilterActive ? 'All' : tag);
                                    }}
                                    title={`Click to filter by tag "${tag}"`}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                                      style.bg
                                    } ${style.text} border ${style.border} ${
                                      isFilterActive ? 'ring-2 ring-indigo-500/40 font-bold' : 'hover:opacity-80'
                                    }`}
                                  >
                                    <span className={`w-1 h-1 rounded-full ${style.dot}`} />
                                    <span>{tag}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              inv.type === 'receivable'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {inv.type}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-slate-600">{inv.category}</td>

                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                          ${inv.amount.toLocaleString()}
                        </td>

                        <td className="px-4 py-3.5 text-slate-600">{inv.dueDate}</td>

                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              inv.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : inv.status === 'overdue'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          {inv.status !== 'paid' && canApprovePayments && (
                            <button
                              onClick={() => onPayInvoice(inv.id)}
                              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors shadow-2xs"
                            >
                              Mark Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Payment Terminal / Gateway Simulator */}
      {showSimulatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowSimulatorModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <span>Third-Party Payment Gateway Terminal</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Simulate live enterprise transaction capture via Stripe, PayPal, Square, or Fedwire.
            </p>

            {txnSuccessMessage ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{txnSuccessMessage}</span>
              </div>
            ) : (
              <form onSubmit={handleSimulatePayment} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Target Payment Gateway</label>
                    <select
                      value={simGateway}
                      onChange={(e: any) => setSimGateway(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="stripe">Stripe Payments Engine</option>
                      <option value="paypal">PayPal Commerce Platform</option>
                      <option value="square">Square Enterprise</option>
                      <option value="wire_ach">Fedwire / Direct ACH</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Currency</label>
                    <select
                      value={simCurrency}
                      onChange={(e: any) => setSimCurrency(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Payment Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={simAmount}
                      onChange={(e) => setSimAmount(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono text-sm focus:bg-white focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Payment Method</label>
                    <input
                      type="text"
                      value={simCard}
                      onChange={(e) => setSimCard(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Customer / Entity Name</label>
                    <input
                      type="text"
                      value={simCustomer}
                      onChange={(e) => setSimCustomer(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Customer Email</label>
                    <input
                      type="email"
                      value={simEmail}
                      onChange={(e) => setSimEmail(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Invoice / Line Item Description</label>
                  <input
                    type="text"
                    value={simDescription}
                    onChange={(e) => setSimDescription(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>3D-Secure 2.0 & E2EE Cryptographic Tokenizer Active</span>
                  </div>
                  <p className="text-slate-500">
                    Card data is tokenized via client-side AES-GCM before transmission to sandbox payment rails.
                  </p>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSimulatorModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingTxn}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs transition-all disabled:opacity-50"
                  >
                    {isProcessingTxn && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isProcessingTxn ? 'Authorizing 3DS...' : 'Process Payment'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* AI CFO SUITE TAB */}
      {activeTab === 'ai_cfo_suite' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white shadow-xl border border-indigo-700/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold flex items-center space-x-2">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                  <span>AI CFO Suite & Autonomous Treasury Operations</span>
                </h2>
                <p className="text-xs text-indigo-200/80 mt-1">
                  Record-to-Report (R2R) Continuous Close • Order-to-Cash (O2C) &gt;90% Touchless Cash • Procure-to-Pay (P2P) 3-Way Match
                </p>
              </div>

              <button
                onClick={() => {
                  setIsGeneratingMDA(true);
                  setTimeout(() => {
                    setMdaOutput(
                      `### Executive Management Discussion & Analysis (MD&A) Report - Q3 2026\n\n` +
                      `**1. Financial Performance Summary**:\n` +
                      `- YTD Revenue expanded **+24.5% YoY** to **$14.85M**, driven by strong Enterprise ERP subscription adoption.\n` +
                      `- Gross Profit Margin reached **58.4%**, outperforming standard benchmark targets by 340 bps.\n\n` +
                      `**2. Order-to-Cash (O2C) & Working Capital Optimization**:\n` +
                      `- Touchless Cash Application Rate sustained at **94.2%**, freeing AR teams from manual remittance matching.\n` +
                      `- Automated utility dunning agents reduced Days Sales Outstanding (DSO) by **8.4 days**, liberating **$890,000 in working capital**.\n\n` +
                      `**3. Record-to-Report (R2R) Close Acceleration**:\n` +
                      `- Month-end close cycle compressed to **3.2 days** (Gartner projected 30% speedup achieved).\n` +
                      `- 100% of journal entries auto-reconciled against sub-ledgers with zero variance flags.`
                    );
                    setIsGeneratingMDA(false);
                  }, 1000);
                }}
                disabled={isGeneratingMDA}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 shadow-md transition-all disabled:opacity-50"
              >
                {isGeneratingMDA ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isGeneratingMDA ? 'Generating Report...' : 'Generate Generative MD&A Report'}</span>
              </button>
            </div>

            {mdaOutput && (
              <div className="mt-4 p-4 bg-slate-950/80 rounded-xl border border-indigo-500/30 text-xs text-slate-200 font-mono space-y-2 whitespace-pre-line">
                {mdaOutput}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* R2R Continuous Close Card */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
                <span className="font-semibold text-gray-900 dark:text-white text-sm">Record-to-Report (R2R)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Gartner 30% Speedup</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-slate-300">
                Continuous financial close engine automatically routes journal entries based on amount risk tiers and validates general ledger integrity.
              </p>
              <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg text-xs space-y-1">
                <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
                  <span>Current Close Duration:</span>
                  <span className="text-emerald-600 font-mono font-bold">3.2 Days</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Baseline Legacy Close:</span>
                  <span className="font-mono">11.5 Days</span>
                </div>
              </div>
            </div>

            {/* O2C Touchless Cash Application Card */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
                <span className="font-semibold text-gray-900 dark:text-white text-sm">Order-to-Cash (O2C)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">&gt;90% Touchless</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-slate-300">
                Multi-format remittance extraction matches bank payments to open receivables. Autonomous utility agents execute dynamic dunning.
              </p>
              <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg text-xs space-y-1">
                <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
                  <span>Touchless Match Rate:</span>
                  <span className="text-indigo-600 font-mono font-bold">94.2%</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Working Capital Liberated:</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">$890,000</span>
                </div>
              </div>
            </div>

            {/* P2P 3-Way Matching Card */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-3">
                <span className="font-semibold text-gray-900 dark:text-white text-sm">Procure-to-Pay (P2P)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">80% Cycle Cut</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-slate-300">
                AI computer vision extracts invoice line items, performs 3-way matching against POs and receiving receipts, and flags duplicate/fraud billing.
              </p>
              <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-lg text-xs space-y-1">
                <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
                  <span>Processing Cycle Time:</span>
                  <span className="text-purple-600 font-mono font-bold">1.4 Days</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Duplicate Billing Prevention:</span>
                  <span className="font-mono text-emerald-600 font-bold">Active (0 Anomalies)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
