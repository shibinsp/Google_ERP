import React, { useState } from 'react';
import {
  Factory,
  Layers,
  Cpu,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Play,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { WorkOrder } from '../types';

interface ManufacturingViewProps {
  workOrders: WorkOrder[];
  onUpdateWorkOrderStatus: (workOrderId: string, status: WorkOrder['status']) => void;
  onCreateWorkOrder: (newWo: Omit<WorkOrder, 'id'>) => void;
}

export const ManufacturingView: React.FC<ManufacturingViewProps> = ({
  workOrders,
  onUpdateWorkOrderStatus,
  onCreateWorkOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'work_orders' | 'bom_tree' | 'mrp_calculator'>('work_orders');
  const [expandedBom, setExpandedBom] = useState<string | null>('SYS-EDGE-CORTEX7');
  const [showNewWoModal, setShowNewWoModal] = useState(false);

  // New Work Order Form State
  const [woSku, setWoSku] = useState('SYS-EDGE-CORTEX7');
  const [woName, setWoName] = useState('Industrial Edge Processing Cortex-M7 Node');
  const [woQty, setWoQty] = useState(100);
  const [woStation, setWoStation] = useState('Assembly Line A / SMT Station 1');

  const handleCreateWoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateWorkOrder({
      workOrderNumber: `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      finishedGoodSku: woSku,
      finishedGoodName: woName,
      targetQuantity: Number(woQty),
      completedQuantity: 0,
      startDate: new Date().toISOString().slice(0, 10),
      targetCompletionDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      status: 'in_production',
      shopFloorStation: woStation,
      unitProductionCost: 480.00,
      totalOrderCost: Number(woQty) * 480.00,
      allocatedBom: [
        { componentSku: 'MCU-8842', componentName: 'NXP Cortex-M7 Microcontroller', quantityRequired: woQty, unitCost: 18.50, extendedCost: woQty * 18.50 },
        { componentSku: 'OPT-800G-QSFP', componentName: '800G QSFP-DD Transceiver Module', quantityRequired: woQty * 2, unitCost: 145.00, extendedCost: woQty * 290.00 },
      ],
    });
    setShowNewWoModal(false);
  };

  const totalInProduction = workOrders.filter((w) => w.status === 'in_production').length;
  const totalCompleted = workOrders.filter((w) => w.status === 'completed').length;
  const totalProductionCostUSD = workOrders.reduce((acc, w) => acc + w.totalOrderCost, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-700/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="p-2.5 bg-indigo-500/20 backdrop-blur-md rounded-xl border border-indigo-400/30">
                <Factory className="w-7 h-7 text-indigo-300" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Manufacturing, MRP & Shop-Floor Control</h1>
                <p className="text-sm text-indigo-200/80">
                  Multi-Level Bills of Materials (BOM), Real-Time Work-Order Costing & Quality Control
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Synchronizes assembly line scheduling, multi-tier component dependencies, and automated material requirements planning (MRP) for zero shop-floor idle time.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowNewWoModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Issue New Work-Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Active Work-Orders</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalInProduction} In Production</p>
            <p className="text-xs text-indigo-600 font-medium mt-0.5">Shop-Floor SMT Lines Active</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600">
            <Factory className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Completed Runs</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalCompleted} QA Passed</p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">100% Quality Inspection</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Work-Order Value</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${totalProductionCostUSD.toLocaleString()}</p>
            <p className="text-xs text-purple-600 font-medium mt-0.5">Allocated Component Costs</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-600">
            <Cpu className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('work_orders')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'work_orders'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-800'
          }`}
        >
          <Factory className="w-4 h-4" />
          <span>Work-Orders & Shop Floor</span>
        </button>

        <button
          onClick={() => setActiveTab('bom_tree')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'bom_tree'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Multi-Level BOM Viewer</span>
        </button>

        <button
          onClick={() => setActiveTab('mrp_calculator')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all ${
            activeTab === 'mrp_calculator'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Material Requirements Planning (MRP)</span>
        </button>
      </div>

      {/* TAB 1: Work Orders Table */}
      {activeTab === 'work_orders' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Active Production Work-Orders</h3>
            <span className="text-xs font-mono text-gray-500">Showing {workOrders.length} Orders</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800/60 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">WO Reference & SKU</th>
                  <th className="px-6 py-3.5">Shop Floor Station</th>
                  <th className="px-6 py-3.5">Target vs Produced</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Order Cost</th>
                  <th className="px-6 py-3.5 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-gray-50/80 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4">
                      <div className="font-bold font-mono text-indigo-600 dark:text-indigo-400">{wo.workOrderNumber}</div>
                      <div className="font-semibold text-gray-900 dark:text-white mt-0.5">{wo.finishedGoodName}</div>
                      <div className="text-[11px] font-mono text-gray-400">{wo.finishedGoodSku}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-700 dark:text-slate-300">{wo.shopFloorStation}</td>
                    <td className="px-6 py-4 font-mono">
                      <span className="font-bold text-gray-900 dark:text-white">{wo.completedQuantity}</span> / {wo.targetQuantity} units
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          wo.status === 'in_production'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : wo.status === 'qa_inspection'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {wo.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">
                      ${wo.totalOrderCost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {wo.status !== 'completed' && (
                        <button
                          onClick={() => onUpdateWorkOrderStatus(wo.id, wo.status === 'in_production' ? 'qa_inspection' : 'completed')}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-[11px]"
                        >
                          Advance Status ➔
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

      {/* TAB 2: Multi-Level BOM Tree Viewer */}
      {activeTab === 'bom_tree' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>Multi-Level Bill of Materials (BOM) & Cost Rollup Tree</span>
          </h3>

          <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between text-indigo-300 font-bold border-b border-slate-800 pb-2">
              <span>Parent SKU: SYS-EDGE-CORTEX7 (Industrial Edge Processing Node)</span>
              <span>Unit Rollup Cost: $480.00</span>
            </div>

            <div className="pl-4 space-y-2">
              <div className="flex items-center justify-between text-slate-200">
                <span>├── MCU-8842: NXP Cortex-M7 Microcontroller (Qty: 1)</span>
                <span className="text-emerald-400 font-bold">$18.50</span>
              </div>
              <div className="flex items-center justify-between text-slate-200">
                <span>├── OPT-800G-QSFP: 800G QSFP-DD Transceiver Module (Qty: 2)</span>
                <span className="text-emerald-400 font-bold">$290.00</span>
              </div>
              <div className="flex items-center justify-between text-slate-200">
                <span>├── ALU-6061-ROD: 6061 Aluminum Structural Enclosure (Qty: 1)</span>
                <span className="text-emerald-400 font-bold">$42.00</span>
              </div>
              <div className="flex items-center justify-between text-slate-200">
                <span>└── SMT-ASSEMBLY-LABOR: Shop Floor SMT Labor & QA Test (2.5 hrs)</span>
                <span className="text-emerald-400 font-bold">$129.50</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MRP Calculator */}
      {activeTab === 'mrp_calculator' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <span>Material Requirements Planning (MRP) Net Shortage Analysis</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 space-y-1">
              <div className="font-bold text-emerald-900 dark:text-emerald-300">NXP Cortex-M7 Stock</div>
              <div className="text-gray-600 dark:text-slate-300">On-Hand: 450 units | Allocated: 250 units</div>
              <div className="text-emerald-600 font-bold">Net Available: +200 units (No Shortage)</div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 space-y-1">
              <div className="font-bold text-amber-900 dark:text-amber-300">800G QSFP Transceivers</div>
              <div className="text-gray-600 dark:text-slate-300">On-Hand: 520 units | Allocated: 500 units</div>
              <div className="text-amber-700 font-bold">Net Available: +20 units (Reorder Urgency)</div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 space-y-1">
              <div className="font-bold text-purple-900 dark:text-purple-300">6061 Aluminum Rods</div>
              <div className="text-gray-600 dark:text-slate-300">On-Hand: 35 units | Allocated: 250 units</div>
              <div className="text-rose-600 font-bold">Net Shortage: -215 units (Auto-PO Triggered)</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Issue Work Order */}
      {showNewWoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-gray-200 dark:border-slate-800 shadow-2xl">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Issue New Shop-Floor Work-Order</h3>
            <form onSubmit={handleCreateWoSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 dark:text-slate-300 font-medium mb-1">Finished Good Name</label>
                <input
                  type="text"
                  value={woName}
                  onChange={(e) => setWoName(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-slate-300 font-medium mb-1">Target Quantity</label>
                  <input
                    type="number"
                    value={woQty}
                    onChange={(e) => setWoQty(Number(e.target.value))}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-slate-300 font-medium mb-1">Shop Floor Station</label>
                  <input
                    type="text"
                    value={woStation}
                    onChange={(e) => setWoStation(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewWoModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold"
                >
                  Dispatch Work-Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
