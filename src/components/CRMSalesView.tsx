import React, { useState } from 'react';
import {
  ShoppingBag,
  FileText,
  Users,
  CheckCircle2,
  DollarSign,
  Plus,
  Send,
  Truck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { CustomerAccount, SalesQuote, SalesOrder } from '../types';

interface CRMSalesViewProps {
  customers: CustomerAccount[];
  quotes: SalesQuote[];
  orders: SalesOrder[];
  onCreateQuote: (newQuote: Omit<SalesQuote, 'id'>) => void;
  onConvertQuoteToOrder: (quoteId: string) => void;
}

export const CRMSalesView: React.FC<CRMSalesViewProps> = ({
  customers,
  quotes,
  orders,
  onCreateQuote,
  onConvertQuoteToOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'quotes' | 'orders' | 'customers'>('quotes');
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  // New Quote Form State
  const [quoteCustomer, setQuoteCustomer] = useState(customers[0]?.companyName || 'Apex Aeronautics Global');
  const [quoteItemSku, setQuoteItemSku] = useState('SYS-EDGE-CORTEX7');
  const [quoteQty, setQuoteQty] = useState(10);
  const [quoteUnitPrice, setQuoteUnitPrice] = useState(850.00);
  const [quoteDiscount, setQuoteDiscount] = useState(10);

  const handleCreateQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = quoteQty * quoteUnitPrice;
    const discountAmt = (subtotal * quoteDiscount) / 100;
    const netSubtotal = subtotal - discountAmt;
    const tax = netSubtotal * 0.08;
    const total = netSubtotal + tax;

    onCreateQuote({
      quoteNumber: `Q-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: customers[0]?.id || 'cust-01',
      customerName: quoteCustomer,
      createdDate: new Date().toISOString().slice(0, 10),
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      subtotal: netSubtotal,
      discountPercent: quoteDiscount,
      taxAmount: tax,
      totalAmount: total,
      status: 'approved',
      lineItems: [
        { sku: quoteItemSku, description: 'Industrial Edge Processing Cortex-M7 Node', quantity: quoteQty, unitPrice: quoteUnitPrice, total: subtotal },
      ],
    });
    setShowQuoteModal(false);
  };

  const totalPipelineRevenueUSD = quotes.reduce((acc, q) => acc + q.totalAmount, 0) + orders.reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-blue-700/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="p-2.5 bg-blue-500/20 backdrop-blur-md rounded-xl border border-blue-400/30">
                <ShoppingBag className="w-7 h-7 text-blue-300" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Sales & CRM Quote-to-Order Pipeline</h1>
                <p className="text-sm text-blue-200/80">
                  Customer Accounts, Dynamic Tiered Volume Pricing & Order Fulfillment Telemetry
                </p>
              </div>
            </div>
            <p className="text-xs text-blue-300/70 max-w-2xl mt-1">
              Automates quote generation with real-time volume discount calculation and converts approved quotes into confirmed sales orders in a single click.
            </p>
          </div>

          <button
            onClick={() => setShowQuoteModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Sales Quote</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Pipeline Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${totalPipelineRevenueUSD.toLocaleString()}</p>
            <p className="text-xs text-blue-600 font-medium mt-0.5">Approved Quotes + Confirmed Orders</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Active Sales Quotes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{quotes.length} Open Quotes</p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">10% Volume Discount Applied</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Enterprise Customers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{customers.length} Accounts</p>
            <p className="text-xs text-purple-600 font-medium mt-0.5">Enterprise Platinum & Gold Tiers</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-600">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('quotes')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'quotes'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Sales Quotes ({quotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'orders'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Sales Orders & Fulfillment ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'customers'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>CRM Accounts ({customers.length})</span>
        </button>
      </div>

      {/* TAB 1: Quotes */}
      {activeTab === 'quotes' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Quote-to-Order Pipeline Registry</h3>
            <span className="text-xs font-mono text-gray-500">Auto-Tier Discount Active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800/60 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Quote Reference & Customer</th>
                  <th className="px-6 py-3.5">Created & Valid Until</th>
                  <th className="px-6 py-3.5">Volume Discount</th>
                  <th className="px-6 py-3.5">Quote Total</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4">
                      <div className="font-bold font-mono text-blue-600 dark:text-blue-400">{q.quoteNumber}</div>
                      <div className="font-semibold text-gray-900 dark:text-white mt-0.5">{q.customerName}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-500">
                      <div>{q.createdDate}</div>
                      <div className="text-[10px] text-gray-400">Valid to {q.validUntil}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-emerald-600">{q.discountPercent}% Tier Discount</td>
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">${q.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase text-[10px]">
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {q.status !== 'converted_to_order' && (
                        <button
                          onClick={() => onConvertQuoteToOrder(q.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-[11px] flex items-center space-x-1 ml-auto"
                        >
                          <span>Convert to Order</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Confirmed Sales Orders & Dispatch Telemetry</h3>
            <span className="text-xs font-mono text-gray-500">Carrier API Live</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800/60 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Sales Order & Quote Ref</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Promised Ship Date</th>
                  <th className="px-6 py-3.5">Carrier & Tracking</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5 text-right">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4">
                      <div className="font-bold font-mono text-blue-600">{o.orderNumber}</div>
                      {o.quoteReference && <div className="text-[10px] text-gray-400 font-mono">Ref: {o.quoteReference}</div>}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{o.customerName}</td>
                    <td className="px-6 py-4 font-mono text-gray-600">{o.promisedShipDate}</td>
                    <td className="px-6 py-4 font-mono text-gray-600">
                      <div>{o.shippingCarrier}</div>
                      <div className="text-[10px] text-indigo-600 font-bold">{o.trackingNumber}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">${o.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold uppercase text-[10px]">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Customers */}
      {activeTab === 'customers' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base">CRM Account Directory & Credit Limits</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {customers.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-750 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{c.companyName}</span>
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">{c.tier}</span>
                </div>
                <div className="text-gray-500">Contact: {c.contactName} ({c.contactEmail})</div>
                <div className="pt-2 border-t border-gray-200 dark:border-slate-700 flex justify-between font-mono">
                  <span>Credit Limit: <strong className="text-gray-900 dark:text-white">${c.creditLimitUSD.toLocaleString()}</strong></span>
                  <span className="text-rose-600 font-bold">Balance: ${c.outstandingBalanceUSD.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create Sales Quote */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-gray-200 dark:border-slate-800 shadow-2xl">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Generate New Sales Quote</h3>
            <form onSubmit={handleCreateQuoteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Customer Account</label>
                <select
                  value={quoteCustomer}
                  onChange={(e) => setQuoteCustomer(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.companyName}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quoteQty}
                    onChange={(e) => setQuoteQty(Number(e.target.value))}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    value={quoteUnitPrice}
                    onChange={(e) => setQuoteUnitPrice(Number(e.target.value))}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold"
                >
                  Generate Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
