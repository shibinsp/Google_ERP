import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Mail,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Clock,
  X,
  Sparkles,
  Sliders,
  Calendar,
  Zap,
  LineChart,
  ChevronRight,
  Eye,
  QrCode,
  Camera,
  Printer,
  Hourglass,
  ArrowUpDown,
} from 'lucide-react';
import { InventoryItem, StockMovement, UserRole, StockForecast } from '../types';
import { calculateStockForecasts, ForecastModelType } from '../services/forecasting';
import { SkuQrCodeModal } from './SkuQrCodeModal';
import { CameraScannerModal } from './CameraScannerModal';

interface InventoryViewProps {
  inventory: InventoryItem[];
  movements: StockMovement[];
  currentRole: UserRole;
  googleConnected: boolean;
  onAddStockMovement: (movement: Omit<StockMovement, 'id' | 'timestamp'>) => void;
  onAddNewSku: (item: Omit<InventoryItem, 'id' | 'status' | 'turnoverRatio' | 'daysSalesOfInventory'>) => void;
  onQuickReorder: (itemId: string, quantity?: number) => void;
  onSendLowStockEmail: (item: InventoryItem) => void;
  globalSearchQuery: string;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  movements,
  currentRole,
  googleConnected,
  onAddStockMovement,
  onAddNewSku,
  onQuickReorder,
  onSendLowStockEmail,
  globalSearchQuery,
}) => {
  const [searchQuery, setSearchQuery] = useState(globalSearchQuery || '');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showAddSkuModal, setShowAddSkuModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedItemForMovement, setSelectedItemForMovement] = useState<InventoryItem | null>(null);

  // QR Code & Camera Scanner states
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedItemForQr, setSelectedItemForQr] = useState<InventoryItem | null>(null);
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  // Predictive Forecasting Model states
  const [forecastModel, setForecastModel] = useState<ForecastModelType>('exponential');
  const [forecastFilter, setForecastFilter] = useState<'all' | 'critical' | 'upcoming'>('all');
  const [previewForecastItem, setPreviewForecastItem] = useState<StockForecast | null>(null);

  // Projected Depletion filtering & sorting states
  const [depletionFilter, setDepletionFilter] = useState<'all' | 'urgent_7d' | 'moderate_14d' | 'healthy_15d_plus'>('all');
  const [sortOrder, setSortOrder] = useState<'default' | 'depletion_asc' | 'burn_desc' | 'stock_asc'>('default');

  // Derive predictive forecasts from historical movements and current inventory
  const forecasts = useMemo(() => {
    return calculateStockForecasts(inventory, movements, {
      modelType: forecastModel,
      surgeFactor: forecastModel === 'surge' ? 1.3 : 1.0,
    });
  }, [inventory, movements, forecastModel]);

  const forecastMap = useMemo(() => {
    return new Map<string, StockForecast>(forecasts.map((f) => [f.itemId, f]));
  }, [forecasts]);

  // Aggregate depletion analytics across entire catalog
  const depletionSummary = useMemo<{
    earliestDepletionSku: StockForecast | null;
    criticalDepletionCount: number;
    warningDepletionCount: number;
    avgRunwayDays: number;
    totalOutboundEvents: number;
    totalOutboundDispatchedUnits: number;
  }>(() => {
    let earliestDepletionSku: StockForecast | null = null;
    let criticalDepletionCount = 0;
    let warningDepletionCount = 0;
    let totalRunwayDays = 0;
    let totalOutboundEvents = 0;
    let totalOutboundDispatchedUnits = 0;

    forecasts.forEach((f) => {
      totalRunwayDays += f.daysUntilDepletion;
      totalOutboundEvents += f.outboundMovementCount;
      totalOutboundDispatchedUnits += f.totalHistoricalDispatched;

      if (f.daysUntilDepletion <= 7) {
        criticalDepletionCount++;
      } else if (f.daysUntilDepletion <= 14) {
        warningDepletionCount++;
      }

      if (!earliestDepletionSku || f.daysUntilDepletion < earliestDepletionSku.daysUntilDepletion) {
        earliestDepletionSku = f;
      }
    });

    const avgRunwayDays = forecasts.length > 0 ? Math.round(totalRunwayDays / forecasts.length) : 0;

    return {
      earliestDepletionSku,
      criticalDepletionCount,
      warningDepletionCount,
      avgRunwayDays,
      totalOutboundEvents,
      totalOutboundDispatchedUnits,
    };
  }, [forecasts]);

  // Form states for movement
  const [movementType, setMovementType] = useState<'inbound_receipt' | 'outbound_dispatch' | 'warehouse_transfer' | 'audit_adjustment'>('inbound_receipt');
  const [movementQty, setMovementQty] = useState<number>(50);
  const [movementOrigin, setMovementOrigin] = useState('');
  const [movementDestination, setMovementDestination] = useState('');
  const [movementRef, setMovementRef] = useState('');

  // Form states for new SKU
  const [newSku, setNewSku] = useState({
    sku: '',
    name: '',
    category: 'Components' as const,
    warehouseLocation: 'WH-East / Bay A-01 / Shelf 1',
    currentStock: 100,
    safetyStock: 30,
    reorderPoint: 45,
    maxCapacity: 500,
    unitCost: 25.0,
    unitPrice: 65.0,
    supplier: 'Global Components Ltd',
    lastRestocked: new Date().toISOString().slice(0, 10),
  });

  const categories = ['All', 'Electronics', 'Raw Materials', 'Components', 'Packaging', 'Finished Goods'];

  // Filtered and sorted inventory with depletion filters
  const filteredInventory = useMemo(() => {
    let items = inventory.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.warehouseLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'alerting' && (item.status === 'critical' || item.status === 'low_stock')) ||
        (statusFilter === 'optimal' && item.status === 'optimal');

      const f = forecastMap.get(item.id);
      const days = f?.daysUntilDepletion ?? 999;
      const matchesDepletion =
        depletionFilter === 'all' ||
        (depletionFilter === 'urgent_7d' && days <= 7) ||
        (depletionFilter === 'moderate_14d' && days > 7 && days <= 14) ||
        (depletionFilter === 'healthy_15d_plus' && days > 14);

      return matchesSearch && matchesCategory && matchesStatus && matchesDepletion;
    });

    if (sortOrder === 'depletion_asc') {
      items = [...items].sort((a, b) => {
        const daysA = forecastMap.get(a.id)?.daysUntilDepletion ?? 9999;
        const daysB = forecastMap.get(b.id)?.daysUntilDepletion ?? 9999;
        return daysA - daysB;
      });
    } else if (sortOrder === 'burn_desc') {
      items = [...items].sort((a, b) => {
        const rateA = forecastMap.get(a.id)?.historicalOutboundBurnRate ?? 0;
        const rateB = forecastMap.get(b.id)?.historicalOutboundBurnRate ?? 0;
        return rateB - rateA;
      });
    } else if (sortOrder === 'stock_asc') {
      items = [...items].sort((a, b) => a.currentStock - b.currentStock);
    }

    return items;
  }, [inventory, searchQuery, categoryFilter, statusFilter, depletionFilter, sortOrder, forecastMap]);

  const lowStockCount = inventory.filter((i) => i.currentStock <= i.reorderPoint).length;
  const totalValuation = inventory.reduce((acc, i) => acc + i.currentStock * i.unitCost, 0);

  const handleOpenMovementModal = (item?: InventoryItem) => {
    if (item) {
      setSelectedItemForMovement(item);
      setMovementOrigin(item.warehouseLocation);
      setMovementDestination('Client Fulfillment');
    } else {
      setSelectedItemForMovement(inventory[0] || null);
      setMovementOrigin('WH-East');
      setMovementDestination('Production Floor');
    }
    setMovementRef(`MVT-${Math.floor(1000 + Math.random() * 9000)}`);
    setShowMovementModal(true);
  };

  const handleExecuteMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForMovement) return;

    onAddStockMovement({
      itemId: selectedItemForMovement.id,
      sku: selectedItemForMovement.sku,
      itemName: selectedItemForMovement.name,
      type: movementType,
      quantity: Number(movementQty),
      origin: movementOrigin,
      destination: movementDestination,
      operator: 'Enterprise Operations Operator',
      referenceNumber: movementRef,
    });

    setShowMovementModal(false);
  };

  const handleCreateSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSku.sku || !newSku.name) return;

    onAddNewSku(newSku);
    setShowAddSkuModal(false);
    setNewSku({
      sku: '',
      name: '',
      category: 'Components',
      warehouseLocation: 'WH-East / Bay A-01 / Shelf 1',
      currentStock: 100,
      safetyStock: 30,
      reorderPoint: 45,
      maxCapacity: 500,
      unitCost: 25.0,
      unitPrice: 65.0,
      supplier: 'Global Components Ltd',
      lastRestocked: new Date().toISOString().slice(0, 10),
    });
  };

  const handleOpenQrModal = (item?: InventoryItem) => {
    setSelectedItemForQr(item || filteredInventory[0] || inventory[0] || null);
    setShowQrModal(true);
  };

  const handleOpenScanner = () => {
    setShowCameraScanner(true);
  };

  const handleSelectScannedItem = (item: InventoryItem) => {
    setSearchQuery(item.sku);
    setCategoryFilter('All');
    setStatusFilter('All');
  };

  const handleOpenAddNewSkuWithCode = (skuCode: string) => {
    setNewSku((prev) => ({ ...prev, sku: skuCode.toUpperCase() }));
    setShowAddSkuModal(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-indigo-600" />
            <span>Inventory & Warehouse Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock ledger, automated low-stock triggers, multi-warehouse tracking, and turnover analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="inventory-scan-barcode-btn"
            onClick={handleOpenScanner}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan SKU Barcode</span>
          </button>

          <button
            id="inventory-batch-qr-btn"
            onClick={() => handleOpenQrModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 shadow-2xs transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>QR Labels</span>
          </button>

          <button
            id="inventory-record-movement-btn"
            onClick={() => handleOpenMovementModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 shadow-2xs transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
            <span>Record Movement</span>
          </button>

          <button
            id="inventory-add-sku-btn"
            onClick={() => setShowAddSkuModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New SKU</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Total Valuation</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">${totalValuation.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Total SKUs</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{inventory.length} Items</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Low Stock Alerts</span>
          <div className="text-xl font-bold font-mono text-rose-600 mt-1">{lowStockCount} Triggers Active</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500">Average Turnover</span>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1">8.6x / yr</div>
        </div>
      </div>
      {/* IIOT PREDICTIVE MAINTENANCE & AUTONOMOUS SOURCING BANNER */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md border border-indigo-700/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-300 font-mono text-xs font-bold uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>IIoT Telemetry Sensor Feed & Autonomous Sourcing</span>
            </div>
            <h3 className="text-base font-bold text-white">Equipment Predictive Maintenance & 360° Supplier ESG Intelligence</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Monitors CNC thermal & vibration telemetry. Automatically schedules preventive work orders and dispatches autonomous RFQs to top-rated ESG suppliers.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-gray-400 block">Active Sensors:</span>
              <span className="text-emerald-400 font-bold">128 Telemetry Nodes (100% Online)</span>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <span className="text-gray-400 block">Supplier ESG Index:</span>
              <span className="text-purple-300 font-bold">94.8% Benchmark</span>
            </div>
          </div>
        </div>
      </div>

      {/* PREDICTIVE FORECASTING & PROJECTED STOCK DEPLETION ENGINE */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" /> Outbound Movement Trend Analytics
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mt-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Projected Stock Depletion & Predictive Reorder Engine</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Calculates projected stock depletion dates for each SKU based on historical outbound movement trends, dispatch velocity, and supplier lead times.
            </p>
          </div>

          {/* Model Switcher & Urgency Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setForecastModel('exponential')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  forecastModel === 'exponential'
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Exponential moving average weighted on recent 7-day dispatches"
              >
                Exponential
              </button>
              <button
                onClick={() => setForecastModel('linear')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  forecastModel === 'linear'
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="30-day linear regression moving average"
              >
                Linear
              </button>
              <button
                onClick={() => setForecastModel('surge')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                  forecastModel === 'surge'
                    ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                    : 'text-amber-700 hover:text-amber-900'
                }`}
                title="Stress-test buffer simulating a +30% sudden demand shock"
              >
                <Zap className="w-3 h-3" /> +30% Surge
              </button>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setForecastFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  forecastFilter === 'all'
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({forecasts.length})
              </button>
              <button
                onClick={() => setForecastFilter('critical')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  forecastFilter === 'critical'
                    ? 'bg-rose-600 text-white font-semibold shadow-2xs'
                    : 'text-rose-700 hover:text-rose-900'
                }`}
              >
                Immediate ({forecasts.filter((f) => f.urgency === 'critical_immediate').length})
              </button>
              <button
                onClick={() => setForecastFilter('upcoming')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  forecastFilter === 'upcoming'
                    ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                    : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                &lt;7 Days ({forecasts.filter((f) => f.urgency === 'reorder_soon').length})
              </button>
            </div>
          </div>
        </div>

        {/* Depletion Summary Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-slate-500">
              <Hourglass className="w-3 h-3 text-rose-600" /> Earliest Depletion SKU
            </div>
            <div className="text-xs font-bold text-rose-600 mt-1 truncate">
              {depletionSummary.earliestDepletionSku?.sku} • {depletionSummary.earliestDepletionSku?.projectedDepletionDate}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Runway: {depletionSummary.earliestDepletionSku?.daysUntilDepletion} days remaining
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-slate-500">
              <AlertTriangle className="w-3 h-3 text-rose-500" /> Imminent Depletion (≤7d)
            </div>
            <div className="text-base font-bold font-mono text-rose-600 mt-0.5">
              {depletionSummary.criticalDepletionCount} SKUs
            </div>
            <div className="text-[10px] text-slate-500">
              Immediate PO dispatch recommended
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-slate-500">
              <Clock className="w-3 h-3 text-amber-500" /> Catalog Average Runway
            </div>
            <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
              {depletionSummary.avgRunwayDays} Days
            </div>
            <div className="text-[10px] text-slate-500">
              {depletionSummary.warningDepletionCount} SKUs in 8–14d window
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-slate-500">
              <ArrowDownLeft className="w-3 h-3 text-indigo-500" /> Outbound Dispatch Volume
            </div>
            <div className="text-base font-bold font-mono text-indigo-700 mt-0.5">
              {depletionSummary.totalOutboundDispatchedUnits.toLocaleString()} Units
            </div>
            <div className="text-[10px] text-slate-500">
              From {depletionSummary.totalOutboundEvents} logged outbound movements
            </div>
          </div>
        </div>

        {/* Predictive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {forecasts
            .filter((f) => {
              if (forecastFilter === 'critical') return f.urgency === 'critical_immediate';
              if (forecastFilter === 'upcoming') return f.urgency === 'reorder_soon';
              return true;
            })
            .slice(0, 8)
            .map((f) => {
              const isCritical = f.urgency === 'critical_immediate';
              const isSoon = f.urgency === 'reorder_soon';

              return (
                <div
                  key={f.itemId}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isCritical
                      ? 'bg-rose-50/60 border-rose-200/90 shadow-2xs'
                      : isSoon
                      ? 'bg-amber-50/60 border-amber-200/90 shadow-2xs'
                      : 'bg-slate-50/70 border-slate-200/80 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-indigo-700 border border-slate-200 font-semibold">
                          {f.sku}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-1">{f.itemName}</h4>
                      </div>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : isSoon
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {isCritical ? 'Reorder Today' : isSoon ? 'Reorder Soon' : 'Optimal'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-200/80 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Stock / Reorder</span>
                        <div className="font-mono font-bold text-slate-900">
                          {f.currentStock} <span className="text-slate-500 text-[10px] font-normal">/ {f.reorderPoint}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[10px]">Outbound Burn</span>
                        <div className="font-mono font-bold text-indigo-700">
                          ~{f.historicalOutboundBurnRate} u/d
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 p-2.5 rounded-xl bg-white/90 border border-slate-200/80 space-y-1 text-[11px] shadow-2xs">
                      {/* Projected Depletion Date Highlight */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 text-[10px] font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-indigo-600" /> Depletion Date:
                        </span>
                        <span
                          className={`font-mono font-bold text-[11px] ${
                            f.depletionRiskLevel === 'critical_depleted' || f.depletionRiskLevel === 'urgent_7d'
                              ? 'text-rose-600'
                              : f.depletionRiskLevel === 'moderate_14d'
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {f.projectedDepletionDate} ({f.daysUntilDepletion}d)
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Suggested PO:</span>
                        <span
                          className={`font-mono font-semibold ${
                            isCritical ? 'text-rose-600' : isSoon ? 'text-amber-700' : 'text-slate-700'
                          }`}
                        >
                          {f.daysUntilReorderPoint === 0 ? 'Today' : f.suggestedReorderDate}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Outbound Trend:</span>
                        <span className="text-slate-700 font-mono">
                          {f.outboundMovementCount} dispatches ({f.demandVelocityTrend})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setPreviewForecastItem(f)}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-medium border border-slate-200 flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <Eye className="w-3 h-3 text-indigo-600" />
                      <span>Inspect</span>
                    </button>

                    <button
                      onClick={() => onQuickReorder(f.itemId, f.recommendedReorderQuantity)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-2xs ${
                        isCritical
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <span>Order +{f.recommendedReorderQuantity}</span>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Search & Filtering Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="inventory-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SKU, Name, Warehouse, Supplier..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Category Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                    categoryFilter === cat ? 'bg-indigo-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Status Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setStatusFilter('All')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  statusFilter === 'All' ? 'bg-indigo-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('alerting')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                  statusFilter === 'alerting' ? 'bg-rose-600 text-white font-semibold shadow-2xs' : 'text-rose-700 hover:text-rose-900'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Low ({lowStockCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter('optimal')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  statusFilter === 'optimal' ? 'bg-emerald-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Optimal
              </button>
            </div>
          </div>
        </div>

        {/* Depletion Horizon & Sorting Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Hourglass className="w-3.5 h-3.5 text-indigo-600" /> Depletion Runway:
            </span>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setDepletionFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  depletionFilter === 'all'
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Horizons
              </button>
              <button
                onClick={() => setDepletionFilter('urgent_7d')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                  depletionFilter === 'urgent_7d'
                    ? 'bg-rose-600 text-white font-semibold shadow-2xs'
                    : 'text-rose-700 hover:text-rose-900'
                }`}
              >
                <span>≤ 7 Days Depletion ({forecasts.filter((f) => f.daysUntilDepletion <= 7).length})</span>
              </button>
              <button
                onClick={() => setDepletionFilter('moderate_14d')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  depletionFilter === 'moderate_14d'
                    ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                    : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                8–14 Days ({forecasts.filter((f) => f.daysUntilDepletion > 7 && f.daysUntilDepletion <= 14).length})
              </button>
              <button
                onClick={() => setDepletionFilter('healthy_15d_plus')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  depletionFilter === 'healthy_15d_plus'
                    ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                &gt; 14 Days ({forecasts.filter((f) => f.daysUntilDepletion > 14).length})
              </button>
            </div>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 flex items-center gap-1 text-[11px] font-medium">
              <ArrowUpDown className="w-3 h-3 text-slate-400" /> Sort:
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 py-1 px-2.5 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white font-medium"
            >
              <option value="default">Default Order</option>
              <option value="depletion_asc">Soonest Depletion First</option>
              <option value="burn_desc">Highest Outbound Burn Rate</option>
              <option value="stock_asc">Lowest Stock Level First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Catalog Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">SKU & Item Name</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Warehouse Location</th>
                <th className="px-4 py-3.5 text-right">Stock Level</th>
                <th className="px-4 py-3.5 text-right">Unit Cost / Price</th>
                <th className="px-4 py-3.5 text-center">Projected Depletion Date</th>
                <th className="px-4 py-3.5 text-right">Turnover (DSI)</th>
                <th className="px-4 py-3.5 text-center">Velocity & Suggested Reorder</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    No matching inventory items found for current filters.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isLow = item.currentStock <= item.reorderPoint;
                  const isCritical = item.currentStock <= item.safetyStock;
                  const f = forecastMap.get(item.id);
                  const suggestedQty = f?.recommendedReorderQuantity || 50;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-[11px] font-mono text-indigo-600 font-medium mt-0.5">{item.sku}</div>
                        <div className="text-[10px] text-slate-500">{item.supplier}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                          {item.category}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[170px]">{item.warehouseLocation}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div
                          className={`text-sm font-bold font-mono ${
                            isCritical ? 'text-rose-600' : isLow ? 'text-amber-700' : 'text-slate-900'
                          }`}
                        >
                          {item.currentStock}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Reorder: {item.reorderPoint} • Safe: {item.safetyStock}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono">
                        <div className="text-slate-900 font-semibold">${item.unitPrice.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500">Cost: ${item.unitCost.toFixed(2)}</div>
                      </td>

                      {/* Projected Stock Depletion Date Column */}
                      <td className="px-4 py-3.5 text-center">
                        {f ? (
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span className="font-mono font-bold text-slate-900 text-xs">
                                {f.projectedDepletionDate}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-1">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-tight ${
                                  f.depletionRiskLevel === 'critical_depleted'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : f.depletionRiskLevel === 'urgent_7d'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : f.depletionRiskLevel === 'moderate_14d'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {f.daysUntilDepletion === 0
                                  ? 'Depleted'
                                  : f.daysUntilDepletion <= 1
                                  ? 'Depletes Tomorrow'
                                  : `${f.daysUntilDepletion}d runway`}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                              ~{f.historicalOutboundBurnRate} u/d burn ({f.outboundMovementCount} outbound)
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono">
                        <div className="text-emerald-700 font-bold">{item.turnoverRatio}x / yr</div>
                        <div className="text-[10px] text-slate-500">{item.daysSalesOfInventory}d DSI</div>
                      </td>

                      {/* Demand Velocity & Suggested Reorder Date Column */}
                      <td className="px-4 py-3.5 text-center">
                        {f ? (
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-indigo-700">
                              <span>{f.averageDailyDemand} u/d</span>
                              <span
                                className={`text-[9px] px-1 py-0.2 rounded font-normal ${
                                  f.demandVelocityTrend === 'accelerating'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'text-slate-500'
                                }`}
                              >
                                {f.demandVelocityTrend === 'accelerating' ? '▲' : '●'}
                              </span>
                            </div>
                            <div
                              className={`text-[10px] font-semibold mt-0.5 ${
                                f.daysUntilReorderPoint === 0
                                  ? 'text-rose-600'
                                  : f.daysUntilReorderPoint <= 7
                                  ? 'text-amber-700'
                                  : 'text-slate-500'
                              }`}
                            >
                              {f.daysUntilReorderPoint === 0
                                ? 'Reorder Today'
                                : `Reorder ${f.suggestedReorderDate.slice(5)}`}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {isCritical ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-bold uppercase">
                            Critical
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-bold uppercase">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold uppercase">
                            Optimal
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onQuickReorder(item.id, suggestedQty)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors shadow-2xs"
                            title={`Reorder +${suggestedQty} Units Based on Forecasting Model`}
                          >
                            +{suggestedQty}
                          </button>
                          {f && (
                            <button
                              onClick={() => setPreviewForecastItem(f)}
                              className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-indigo-600 text-xs transition-colors border border-slate-200 shadow-2xs"
                              title="Inspect Forecast & Trajectory"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            id={`qr-btn-${item.sku}`}
                            onClick={() => handleOpenQrModal(item)}
                            className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-indigo-600 text-xs transition-colors border border-slate-200 shadow-2xs"
                            title="Generate & Print SKU QR Barcode"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenMovementModal(item)}
                            className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs transition-colors border border-slate-200 shadow-2xs"
                            title="Transfer / Adjust Stock"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                          {googleConnected && isLow && (
                            <button
                              onClick={() => onSendLowStockEmail(item)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs transition-colors"
                              title="Send Automated Gmail Alert"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Stock Movement Ledger */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Stock Movement Ledger & Audit Trail</h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time receipts, transfers, customer dispatches, and inventory count adjustments</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">{movements.length} logged events</span>
        </div>

        <div className="divide-y divide-slate-100">
          {movements.slice(0, 5).map((m) => (
            <div key={m.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                    m.type === 'inbound_receipt'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : m.type === 'outbound_dispatch'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : m.type === 'warehouse_transfer'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {m.type === 'inbound_receipt' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : m.type === 'outbound_dispatch' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowRightLeft className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <span>{m.itemName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {m.sku}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {m.origin} → {m.destination} • Ref:{' '}
                    <span className="font-mono text-slate-700 font-medium">{m.referenceNumber}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Operator: {m.operator} • {m.timestamp}
                  </div>
                </div>
              </div>

              <div className="text-right sm:text-right shrink-0">
                <div
                  className={`font-mono font-bold text-sm ${
                    m.quantity > 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {m.quantity > 0 ? `+${m.quantity}` : m.quantity} units
                </div>
                <span className="text-[10px] uppercase font-semibold text-slate-500">
                  {m.type.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Record Stock Movement */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowMovementModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">Record Stock Movement</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter ledger transaction details to adjust physical inventory across facilities.
            </p>

            <form onSubmit={handleExecuteMovement} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Target SKU Item</label>
                <select
                  value={selectedItemForMovement?.id || ''}
                  onChange={(e) => {
                    const item = inventory.find((i) => i.id === e.target.value);
                    setSelectedItemForMovement(item || null);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                >
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.sku}) - Current: {item.currentStock} units
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Movement Type</label>
                  <select
                    value={movementType}
                    onChange={(e: any) => setMovementType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="inbound_receipt">Inbound Supplier Receipt (+)</option>
                    <option value="outbound_dispatch">Outbound Client Dispatch (-)</option>
                    <option value="warehouse_transfer">Warehouse Transfer</option>
                    <option value="audit_adjustment">Physical Audit Adjustment (+/-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    value={movementQty}
                    onChange={(e) => setMovementQty(Number(e.target.value))}
                    min={1}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Origin / Source</label>
                  <input
                    type="text"
                    value={movementOrigin}
                    onChange={(e) => setMovementOrigin(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. WH-Central"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Destination</label>
                  <input
                    type="text"
                    value={movementDestination}
                    onChange={(e) => setMovementDestination(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. Assembly Line"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Reference PO / Shipment #</label>
                <input
                  type="text"
                  value={movementRef}
                  onChange={(e) => setMovementRef(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Post Movement to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New SKU */}
      {showAddSkuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddSkuModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">Add New Inventory SKU</h3>
            <p className="text-xs text-slate-500 mb-4">Register new component or finished product in central ERP catalog.</p>

            <form onSubmit={handleCreateSku} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={newSku.sku}
                    onChange={(e) => setNewSku({ ...newSku, sku: e.target.value.toUpperCase() })}
                    placeholder="e.g. EL-PWR-48V"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono uppercase focus:bg-white focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Category</label>
                  <select
                    value={newSku.category}
                    onChange={(e: any) => setNewSku({ ...newSku, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Components">Components</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Finished Goods">Finished Goods</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Item Description</label>
                <input
                  type="text"
                  value={newSku.name}
                  onChange={(e) => setNewSku({ ...newSku, name: e.target.value })}
                  placeholder="e.g. 48V DC High Efficiency Power Supply Unit"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Warehouse Location</label>
                  <input
                    type="text"
                    value={newSku.warehouseLocation}
                    onChange={(e) => setNewSku({ ...newSku, warehouseLocation: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Primary Supplier</label>
                  <input
                    type="text"
                    value={newSku.supplier}
                    onChange={(e) => setNewSku({ ...newSku, supplier: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newSku.currentStock}
                    onChange={(e) => setNewSku({ ...newSku, currentStock: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Safety Buffer</label>
                  <input
                    type="number"
                    value={newSku.safetyStock}
                    onChange={(e) => setNewSku({ ...newSku, safetyStock: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Reorder Point</label>
                  <input
                    type="number"
                    value={newSku.reorderPoint}
                    onChange={(e) => setNewSku({ ...newSku, reorderPoint: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSku.unitCost}
                    onChange={(e) => setNewSku({ ...newSku, unitCost: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSku.unitPrice}
                    onChange={(e) => setNewSku({ ...newSku, unitPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSkuModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Create SKU Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Predictive Forecast & Trajectory Inspection Modal */}
      {previewForecastItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-mono text-[10px] font-bold uppercase">
                    {previewForecastItem.sku}
                  </span>
                  <span className="text-[11px] text-slate-500">({previewForecastItem.category})</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">{previewForecastItem.itemName}</h3>
              </div>
              <button
                onClick={() => setPreviewForecastItem(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Physical Stock</span>
                <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {previewForecastItem.currentStock} units
                </div>
                <span className="text-[10px] text-slate-500">Reorder at: {previewForecastItem.reorderPoint}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Outbound Burn Rate</span>
                <div className="text-base font-bold text-indigo-700 font-mono mt-0.5">
                  ~{previewForecastItem.historicalOutboundBurnRate} u / day
                </div>
                <span className="text-[10px] text-slate-500 capitalize">{previewForecastItem.demandVelocityTrend} trend</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Suggested Reorder</span>
                <div
                  className={`text-base font-bold font-mono mt-0.5 ${
                    previewForecastItem.daysUntilReorderPoint === 0 ? 'text-rose-600' : 'text-amber-700'
                  }`}
                >
                  {previewForecastItem.daysUntilReorderPoint === 0
                    ? 'Today'
                    : previewForecastItem.suggestedReorderDate}
                </div>
                <span className="text-[10px] text-slate-500">
                  {previewForecastItem.daysUntilReorderPoint === 0
                    ? 'Immediate PO'
                    : `in ${previewForecastItem.daysUntilReorderPoint} days`}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Projected Depletion</span>
                <div className={`text-base font-bold font-mono mt-0.5 ${
                  previewForecastItem.daysUntilDepletion <= 7
                    ? 'text-rose-600'
                    : previewForecastItem.daysUntilDepletion <= 14
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}>
                  {previewForecastItem.projectedDepletionDate}
                </div>
                <span className="text-[10px] text-slate-500">in {previewForecastItem.daysUntilDepletion} days runway</span>
              </div>
            </div>

            {/* Comprehensive Stock Depletion Analysis & Trend Breakdown */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hourglass className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">Projected Stock Depletion Date Calculation</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-tight ${
                    previewForecastItem.depletionRiskLevel === 'critical_depleted'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : previewForecastItem.depletionRiskLevel === 'urgent_7d'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : previewForecastItem.depletionRiskLevel === 'moderate_14d'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {previewForecastItem.depletionRiskLevel === 'critical_depleted'
                    ? 'Stock Depleted'
                    : previewForecastItem.depletionRiskLevel === 'urgent_7d'
                    ? 'Critical Depletion (≤ 7 Days)'
                    : previewForecastItem.depletionRiskLevel === 'moderate_14d'
                    ? 'Warning Window (8–14 Days)'
                    : 'Healthy Runway (> 14 Days)'}
                </span>
              </div>

              {/* Mathematical calculation cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-sans block">Current Usable Inventory</span>
                  <span className="font-bold text-slate-900">{previewForecastItem.currentStock} Units</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-sans block">Historical Outbound Velocity</span>
                  <span className="font-bold text-indigo-700">~{previewForecastItem.historicalOutboundBurnRate} Units / Day</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-sans block">Projected Depletion Date</span>
                  <span className={`font-bold ${
                    previewForecastItem.daysUntilDepletion <= 7 ? 'text-rose-600' : 'text-slate-900'
                  }`}>
                    {previewForecastItem.projectedDepletionDate} ({previewForecastItem.daysUntilDepletion}d)
                  </span>
                </div>
              </div>

              {/* Mathematical Formula & Movement Evidence */}
              <div className="text-[11px] text-slate-600 bg-white/90 p-3 rounded-lg border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-mono text-slate-800 font-medium">
                  <span className="text-indigo-600 font-bold">Depletion Formula:</span>
                  <span>{previewForecastItem.currentStock} units ÷ {previewForecastItem.historicalOutboundBurnRate} u/day = {previewForecastItem.daysUntilDepletion} days runway</span>
                </div>
                <p className="text-slate-500 text-[10px] pt-0.5">
                  Calculated from <strong className="text-slate-700">{previewForecastItem.outboundMovementCount} historical outbound dispatches</strong> totaling <strong className="text-slate-700">{previewForecastItem.totalHistoricalDispatched} units</strong> in the 30-day movement ledger. Supplier lead time buffer is {previewForecastItem.leadTimeDays} days.
                </p>
              </div>
            </div>

            {/* Projected Trajectory Timeline Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-800">
                  24-Day Demand Depletion Trajectory (Simulation Horizon)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Confidence: {previewForecastItem.modelConfidence}%
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase sticky top-0 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="px-3 py-2">Offset</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2 text-right">Projected Stock</th>
                      <th className="px-3 py-2 text-right">95% Confidence Band</th>
                      <th className="px-3 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px] font-mono">
                    {previewForecastItem.projectionTimeline
                      .filter((_, idx) => idx % 2 === 0)
                      .map((pt) => {
                        const isReorderBreached = pt.projectedStock <= pt.reorderThreshold;
                        const isSafetyBreached = pt.projectedStock <= pt.safetyThreshold;

                        return (
                          <tr
                            key={pt.day}
                            className={`hover:bg-slate-50 ${
                              pt.day === 0 ? 'bg-indigo-50/50 font-bold' : ''
                            }`}
                          >
                            <td className="px-3 py-1.5 text-slate-500">
                              {pt.day === 0 ? 'Today' : pt.day > 0 ? `+${pt.day}d` : `${pt.day}d`}
                            </td>
                            <td className="px-3 py-1.5 text-slate-900">{pt.date}</td>
                            <td className="px-3 py-1.5 text-right font-bold text-slate-900">
                              {pt.projectedStock} units
                            </td>
                            <td className="px-3 py-1.5 text-right text-slate-500">
                              {pt.lowerConfidenceBound} - {pt.upperConfidenceBound}
                            </td>
                            <td className="px-3 py-1.5 text-center">
                              {isSafetyBreached ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-medium">
                                  Safety Floor
                                </span>
                              ) : isReorderBreached ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">
                                  Reorder Point
                                </span>
                              ) : (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-medium">
                                  Healthy
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

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Supplier SLA: <strong className="text-slate-800">{previewForecastItem.supplier}</strong> ({previewForecastItem.leadTimeDays}d lead time)
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewForecastItem(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onQuickReorder(
                      previewForecastItem.itemId,
                      previewForecastItem.recommendedReorderQuantity
                    );
                    setPreviewForecastItem(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Order +{previewForecastItem.recommendedReorderQuantity} Units Now (${(previewForecastItem.recommendedReorderQuantity * previewForecastItem.unitCost).toLocaleString()})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Printable SKU QR Barcodes */}
      <SkuQrCodeModal
        item={selectedItemForQr}
        allItems={filteredInventory.length > 0 ? filteredInventory : inventory}
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        onSelectSku={(it) => setSelectedItemForQr(it)}
      />

      {/* Modal: Camera Barcode & QR Scanner */}
      <CameraScannerModal
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        inventory={inventory}
        onAddStockMovement={onAddStockMovement}
        onSelectScannedItem={handleSelectScannedItem}
        onOpenAddNewSkuWithCode={handleOpenAddNewSkuWithCode}
      />
    </div>
  );
};
