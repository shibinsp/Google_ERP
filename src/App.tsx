import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { HRMSView } from './components/HRMSView';
import { FinanceView } from './components/FinanceView';
import { AnalyticsView } from './components/AnalyticsView';
import { SecurityView } from './components/SecurityView';
import { GoogleIntegrationModal } from './components/GoogleIntegrationModal';
import { IntegrationsView } from './components/IntegrationsView';
import { CommandPalette } from './components/CommandPalette';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import { InvoiceScannerModal } from './components/InvoiceScannerModal';
import { Bot, Camera, Sparkles } from 'lucide-react';

import {
  UserRole,
  InventoryItem,
  StockMovement,
  Employee,
  ResourceAllocation,
  PayrollRecord,
  FinancialMetric,
  Invoice,
  PaymentGatewayConfig,
  PaymentGatewayTransaction,
  AuditLogEntry,
  NotificationAlert,
  DashboardWidgetConfig,
} from './types';

import {
  INITIAL_INVENTORY,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_RESOURCE_ALLOCATIONS,
  INITIAL_PAYROLL,
  INITIAL_FINANCIAL_METRICS,
  INITIAL_INVOICES,
  PAYMENT_GATEWAY_CONFIGS,
  INITIAL_GATEWAY_TRANSACTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  DEFAULT_DASHBOARD_WIDGETS,
  ROLE_PROFILES,
} from './data/initialData';

import {
  sendGmailNotification,
  exportToGoogleSheets,
  backupToGoogleDrive,
} from './services/googleWorkspace';
import { computeSha256 } from './services/crypto';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  // Navigation & Role State
  const [currentRole, setCurrentRole] = useState<UserRole>('super_admin');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Modals & Command Center
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isInvoiceScannerOpen, setIsInvoiceScannerOpen] = useState(false);

  // Dashboard customization state
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(DEFAULT_DASHBOARD_WIDGETS);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  // Enterprise Data States
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [movements, setMovements] = useState<StockMovement[]>(INITIAL_STOCK_MOVEMENTS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [resources, setResources] = useState<ResourceAllocation[]>(INITIAL_RESOURCE_ALLOCATIONS);
  const [payroll, setPayroll] = useState<PayrollRecord[]>(INITIAL_PAYROLL);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetric>(INITIAL_FINANCIAL_METRICS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>(PAYMENT_GATEWAY_CONFIGS);
  const [gatewayTransactions, setGatewayTransactions] = useState<PaymentGatewayTransaction[]>(INITIAL_GATEWAY_TRANSACTIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [alerts, setAlerts] = useState<NotificationAlert[]>(INITIAL_NOTIFICATIONS);

  // Security & MFA State
  const [mfaVerified, setMfaVerified] = useState(true);

  // Google Workspace Integration State
  const [googleConnected, setGoogleConnected] = useState(true);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState<string | undefined>(undefined);
  const [driveUrl, setDriveUrl] = useState<string | undefined>(undefined);

  // Toast / Status Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const gKeyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gKeyPressedRef = useRef<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeTagName = document.activeElement?.tagName.toLowerCase();
      const isInputFocused = activeTagName === 'input' || activeTagName === 'textarea' || activeTagName === 'select';

      // ⌘K or Ctrl+K -> Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // ⌘J or Ctrl+J -> AI Copilot Chatbot
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsChatbotOpen((prev) => !prev);
        return;
      }

      // ⌘I or Ctrl+I -> Scan Invoice with AI
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsInvoiceScannerOpen((prev) => !prev);
        return;
      }

      // '?' (Shift + /) -> Shortcuts Guide (if not typing in input)
      if (e.key === '?' && !isInputFocused) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // '/' -> Open Command Palette (if not typing in input)
      if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
        return;
      }

      // Alt + S -> Export to Google Sheets
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleExportSheets();
        return;
      }

      // Alt + D -> Backup to Google Drive
      if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleBackupDrive();
        return;
      }

      // Alt + R -> Refresh telemetry stream
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        showToast('Real-time telemetry and ledger metrics refreshed.');
        return;
      }

      // Sequential 'G' then [D, I, H, F, A, S] for quick module navigation
      if (!isInputFocused && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key.toLowerCase() === 'g') {
          gKeyPressedRef.current = true;
          if (gKeyTimerRef.current) clearTimeout(gKeyTimerRef.current);
          gKeyTimerRef.current = setTimeout(() => {
            gKeyPressedRef.current = false;
          }, 1000);
          return;
        }

        if (gKeyPressedRef.current) {
          gKeyPressedRef.current = false;
          if (gKeyTimerRef.current) clearTimeout(gKeyTimerRef.current);
          const key = e.key.toLowerCase();
          const targetModuleMap: Record<string, ActiveTab> = {
            d: 'dashboard',
            i: 'inventory',
            h: 'hrms',
            f: 'finance',
            a: 'analytics',
            s: 'security',
          };
          if (targetModuleMap[key]) {
            e.preventDefault();
            setActiveTab(targetModuleMap[key]);
            showToast(`Jumped to ${targetModuleMap[key].toUpperCase()}`);
            return;
          }
        }
      }

      // Escape -> close dialogs
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
        if (isShortcutsModalOpen) setIsShortcutsModalOpen(false);
        if (isCustomizeModalOpen) setIsCustomizeModalOpen(false);
        if (isGoogleModalOpen) setIsGoogleModalOpen(false);
        if (isChatbotOpen) setIsChatbotOpen(false);
        if (isInvoiceScannerOpen) setIsInvoiceScannerOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isCommandPaletteOpen, isShortcutsModalOpen, isCustomizeModalOpen, isGoogleModalOpen, isChatbotOpen, isInvoiceScannerOpen, inventory, financialMetrics, payroll, resources, employees]);

  // Log an immutable audit event
  const logAuditEvent = async (
    action: string,
    module: 'Inventory' | 'HRMS' | 'Finance' | 'Security' | 'Integrations' | 'Gateway',
    details: string
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const hash = await computeSha256(`${timestamp}-${currentRole}-${action}-${details}`);

    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
      actorEmail: `${currentRole}@enterprise-corp.io`,
      actorRole: ROLE_PROFILES[currentRole].title,
      action,
      module,
      details,
      ipAddress: '10.240.0.1 (Zero-Trust VPC)',
      cryptographicHash: hash,
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Toggle dashboard widget visibility
  const handleToggleWidget = (widgetId: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, enabled: !w.enabled } : w))
    );
  };

  // Reset dashboard widgets
  const handleResetWidgets = () => {
    setWidgets(DEFAULT_DASHBOARD_WIDGETS);
    showToast('Dashboard widgets reset to default layout.');
  };

  // Inventory actions
  const handleAddStockMovement = (movement: Omit<StockMovement, 'id' | 'timestamp'>) => {
    const newMvt: StockMovement = {
      ...movement,
      id: `mvt-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    setMovements((prev) => [newMvt, ...prev]);

    // Update current inventory stock
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === movement.itemId) {
          let delta = movement.quantity;
          if (movement.type === 'outbound_dispatch') {
            delta = -Math.abs(delta);
          } else if (movement.type === 'inbound_receipt') {
            delta = Math.abs(delta);
          }
          const updatedStock = Math.max(0, item.currentStock + delta);
          let newStatus: InventoryItem['status'] = 'optimal';
          if (updatedStock <= item.safetyStock) newStatus = 'critical';
          else if (updatedStock <= item.reorderPoint) newStatus = 'low_stock';

          return { ...item, currentStock: updatedStock, status: newStatus };
        }
        return item;
      })
    );

    logAuditEvent(
      'STOCK_MOVEMENT_RECORDED',
      'Inventory',
      `${movement.type} of ${movement.quantity} units for ${movement.itemName} (${movement.sku}). Ref: ${movement.referenceNumber}`
    );

    showToast(`Stock movement ${movement.referenceNumber} recorded successfully.`);
  };

  const handleAddNewSku = (newItem: Omit<InventoryItem, 'id' | 'status' | 'turnoverRatio' | 'daysSalesOfInventory'>) => {
    const item: InventoryItem = {
      ...newItem,
      id: `inv-${Date.now()}`,
      status: newItem.currentStock <= newItem.reorderPoint ? 'low_stock' : 'optimal',
      turnoverRatio: 8.5,
      daysSalesOfInventory: 42,
    };

    setInventory((prev) => [item, ...prev]);

    logAuditEvent('SKU_REGISTERED', 'Inventory', `New SKU ${item.sku} (${item.name}) added to central catalog.`);
    showToast(`SKU ${item.sku} registered in inventory.`);
  };

  const handleQuickReorder = (itemId: string, quantity = 50) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newStock = item.currentStock + quantity;
          return {
            ...item,
            currentStock: newStock,
            status: newStock <= item.reorderPoint ? 'low_stock' : 'optimal',
            lastRestocked: new Date().toISOString().slice(0, 10),
          };
        }
        return item;
      })
    );

    const targetItem = inventory.find((i) => i.id === itemId);
    if (targetItem) {
      logAuditEvent('PURCHASE_ORDER_REORDER', 'Inventory', `Quick replenishment of +${quantity} units for ${targetItem.name} (${targetItem.sku}).`);
    }

    showToast(`Replenishment purchase order of +${quantity} units approved.`);
  };

  const handleSendLowStockEmail = async (item: InventoryItem) => {
    const subject = `[ACTION REQUIRED] Low Stock Alert: ${item.name} (${item.sku})`;
    const body = `Automated ERP Inventory Alert\n\nItem: ${item.name}\nSKU: ${item.sku}\nCurrent Physical Stock: ${item.currentStock} units\nReorder Trigger Point: ${item.reorderPoint} units\nSafety Stock Threshold: ${item.safetyStock} units\nWarehouse Location: ${item.warehouseLocation}\nSupplier: ${item.supplier}\n\nPlease review automated purchase requisition PO-${Math.floor(1000 + Math.random() * 9000)}.`;

    await sendGmailNotification('procurement-leads@enterprise-corp.io', subject, body);
    logAuditEvent('Integrations', 'Integrations', `Dispatched low-stock alert email for SKU ${item.sku} via Gmail.`);
    showToast(`Gmail alert sent for ${item.sku} to procurement distribution list.`);
  };

  // HRMS & Payroll actions
  const handleAddNewEmployee = (employee: Employee) => {
    setEmployees((prev) => [employee, ...prev]);
    logAuditEvent('HRMS', 'HRMS', `Onboarded ${employee.fullName} (${employee.employeeCode}) in ${employee.department}. E2EE credentials stored.`);
    showToast(`Employee ${employee.fullName} onboarded with E2EE credential vault.`);
  };

  const handleApprovePayroll = (payrollId: string) => {
    setPayroll((prev) =>
      prev.map((p) => {
        if (p.id === payrollId) {
          return {
            ...p,
            status: 'dispatched',
            authorizedBy: `${ROLE_PROFILES[currentRole].title}`,
          };
        }
        return p;
      })
    );

    const record = payroll.find((p) => p.id === payrollId);
    if (record) {
      logAuditEvent(
        'HRMS',
        'HRMS',
        `Dispatched direct deposit batch ${record.batchReference} for ${record.periodName}. Total Net: $${record.totalNetPay.toLocaleString()}`
      );
    }

    showToast('Payroll authorized and dispatched via ACH Fedwire batch.');
  };

  const handleSendPayrollEmail = async (p: PayrollRecord) => {
    const subject = `[CONFIRMED] Direct Deposit Payroll Dispatched: ${p.periodName}`;
    const body = `Automated ERP Payroll Confirmation\n\nCycle: ${p.periodName}\nBatch Ref: ${p.batchReference}\nNet Direct Deposit: $${p.totalNetPay.toLocaleString()}\nTotal Personnel: ${p.employeeCount}\nAuthorized By: ${p.authorizedBy}\n\nACH clearing tokens generated under E2EE encryption.`;

    await sendGmailNotification('payroll-notices@enterprise-corp.io', subject, body);
    logAuditEvent('Integrations', 'Integrations', `Dispatched payroll confirmation notice for ${p.batchReference} via Gmail.`);
    showToast(`Payroll notice emailed for ${p.periodName}.`);
  };

  const handleUpdateResourceHours = (projectId: string, deltaHours: number) => {
    setResources((prev) =>
      prev.map((r) => {
        if (r.id === projectId) {
          const updatedUtilized = Math.max(0, r.hoursUtilized + deltaHours);
          const utilPct = updatedUtilized / r.hoursAllocatedTotal;
          let health: ResourceAllocation['health'] = 'optimal';
          if (utilPct > 1.05) health = 'overloaded';
          else if (utilPct > 0.9) health = 'warning';

          return {
            ...r,
            hoursUtilized: updatedUtilized,
            health,
          };
        }
        return r;
      })
    );
  };

  // Finance & Payment Gateway Actions
  const handleProcessGatewayPayment = (
    transaction: Omit<PaymentGatewayTransaction, 'id' | 'timestamp' | 'feeAmount' | 'e2eEncryptedToken'>
  ) => {
    const fee = transaction.amount * 0.024 + 0.3;
    const newTxn: PaymentGatewayTransaction = {
      ...transaction,
      id: `txn-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      feeAmount: Number(fee.toFixed(2)),
      e2eEncryptedToken: `tok_aes_${Math.random().toString(36).slice(2, 12)}`,
    };

    setGatewayTransactions((prev) => [newTxn, ...prev]);

    // Update gateway total volume
    setGateways((prev) =>
      prev.map((gw) => {
        if (gw.id === transaction.gateway) {
          return {
            ...gw,
            totalProcessedMonth: gw.totalProcessedMonth + transaction.amount,
          };
        }
        return gw;
      })
    );

    // Update financial metric cash reserves
    setFinancialMetrics((prev) => ({
      ...prev,
      cashOnHand: prev.cashOnHand + (transaction.amount - fee),
      totalRevenueYTD: prev.totalRevenueYTD + transaction.amount,
    }));

    logAuditEvent(
      'Gateway',
      'Gateway',
      `Captured ${transaction.currency} $${transaction.amount} via ${transaction.gateway.toUpperCase()}. Customer: ${transaction.customerName}`
    );

    showToast(`Payment of $${transaction.amount.toLocaleString()} captured via ${transaction.gateway.toUpperCase()}.`);
  };

  const handlePayInvoice = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'paid' } : inv))
    );

    const inv = invoices.find((i) => i.id === invoiceId);
    if (inv) {
      logAuditEvent('Finance', 'Finance', `Marked invoice ${inv.invoiceNumber} (${inv.partyName}) as PAID.`);
    }

    showToast('Invoice marked as settled.');
  };

  const handleAddInvoice = (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);

    setFinancialMetrics((prev) => {
      if (newInvoice.type === 'payable') {
        return {
          ...prev,
          accountsPayableOutstanding: prev.accountsPayableOutstanding + newInvoice.amount,
        };
      } else {
        return {
          ...prev,
          accountsReceivableOutstanding: prev.accountsReceivableOutstanding + newInvoice.amount,
        };
      }
    });

    logAuditEvent(
      'Finance',
      'Finance',
      `Ingested invoice ${newInvoice.invoiceNumber} from ${newInvoice.partyName} ($${newInvoice.amount.toLocaleString()}) via AI Vision OCR.`
    );

    showToast(`Invoice ${newInvoice.invoiceNumber} successfully recorded into ledger.`);
  };

  const handleRefundTransaction = (txnId: string) => {
    setGatewayTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: 'refunded' } : t))
    );

    const txn = gatewayTransactions.find((t) => t.id === txnId);
    if (txn) {
      logAuditEvent('Finance', 'Finance', `Issued refund for ${txn.transactionId} ($${txn.amount}).`);
    }

    showToast('Payment transaction refunded.');
  };

  // Google Workspace Handlers
  const handleExportSheets = async () => {
    setIsExportingSheets(true);
    try {
      const url = await exportToGoogleSheets({
        inventory,
        financialMetrics,
        payroll,
        resources,
      });

      if (url) {
        setSheetsUrl(url);
        logAuditEvent('Integrations', 'Integrations', `Exported ERP balance sheet and inventory to Google Sheets (${url}).`);
        showToast('Google Sheet generated & synchronized successfully!');
        return url;
      }
      return null;
    } finally {
      setIsExportingSheets(false);
    }
  };

  const handleBackupDrive = async () => {
    const erpPayload = {
      exportedAt: new Date().toISOString(),
      inventoryCount: inventory.length,
      employeesCount: employees.length,
      cashOnHand: financialMetrics.cashOnHand,
      inventory,
      payroll,
      financialMetrics,
    };

    const url = await backupToGoogleDrive(erpPayload);
    if (url) {
      setDriveUrl(url);
      logAuditEvent('Integrations', 'Integrations', `Archived encrypted ERP snapshot to Google Drive (${url}).`);
      showToast('Encrypted compliance backup saved to Google Drive!');
      return url;
    }
    return null;
  };

  // Filter accessible modules based on role
  const allowedModules: string[] = ['dashboard', ...(ROLE_PROFILES[currentRole]?.allowedModules || [])];
  useEffect(() => {
    if (!allowedModules.includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [currentRole, allowedModules, activeTab]);

  const lowStockCount = inventory.filter((i) => i.currentStock <= i.reorderPoint).length;
  const pendingPayrollCount = payroll.filter((p) => p.status === 'pending_approval').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* Enterprise Toast Notification Banner */}
      {toastMessage && (
        <div
          id="enterprise-live-toast"
          className="fixed bottom-20 right-5 z-50 px-4 py-3 rounded-2xl bg-slate-900/95 text-white text-xs font-semibold shadow-2xl flex items-center gap-3 border border-slate-700/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
          <span className="leading-snug max-w-xs sm:max-w-sm">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white transition-colors ml-1 p-0.5"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Desktop & Mobile Responsive Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
        }}
        currentRole={currentRole}
        lowStockCount={lowStockCount}
        pendingPayrollCount={pendingPayrollCount}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenCustomizeModal={() => setIsCustomizeModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden lg:pl-64">
        {/* Responsive Header */}
        <Header
          currentRole={currentRole}
          onRoleChange={(r) => {
            setCurrentRole(r);
            showToast(`Switched active profile to ${ROLE_PROFILES[r].title}`);
          }}
          mfaVerified={mfaVerified}
          onOpenMfaModal={() => setActiveTab('security')}
          onOpenCustomizeModal={() => setIsCustomizeModalOpen(true)}
          onOpenGoogleModal={() => setIsGoogleModalOpen(true)}
          notifications={alerts}
          onMarkNotificationRead={(id: string) =>
            setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)))
          }
          onSendGmailNotification={async (notif) => {
            await sendGmailNotification('alerts@enterprise-corp.io', notif.title, notif.message);
            showToast(`Gmail alert dispatched for "${notif.title}"`);
          }}
          googleConnected={googleConnected}
          userEmail="cio-admin@enterprise-corp.io"
          onGoogleSignIn={() => setGoogleConnected(true)}
          onGoogleSignOut={() => setGoogleConnected(false)}
          onToggleMobileSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          searchQuery={globalSearchQuery}
          onSearchChange={setGlobalSearchQuery}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
          onOpenChatbot={() => setIsChatbotOpen(true)}
          onOpenInvoiceScanner={() => setIsInvoiceScannerOpen(true)}
          activeTab={activeTab}
        />

        {/* Workspace Canvas Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Module View Routers */}
          {activeTab === 'dashboard' && (
            <DashboardView
              currentRole={currentRole}
              inventory={inventory}
              employees={employees}
              resources={resources}
              payroll={payroll}
              metrics={financialMetrics}
              gateways={gateways}
              transactions={gatewayTransactions}
              notifications={alerts}
              widgets={widgets}
              googleConnected={googleConnected}
              onNavigateTab={(tab: ActiveTab) => setActiveTab(tab)}
              onQuickReorder={handleQuickReorder}
              onSendLowStockEmail={handleSendLowStockEmail}
              onOpenGoogleModal={() => setIsGoogleModalOpen(true)}
              onOpenPaymentSimulator={() => setActiveTab('finance')}
              onApprovePayroll={handleApprovePayroll}
              isSyncing={isExportingSheets}
              onRefreshData={() => showToast('Refreshed real-time telemetry from enterprise ledger.')}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              inventory={inventory}
              movements={movements}
              currentRole={currentRole}
              googleConnected={googleConnected}
              onAddStockMovement={handleAddStockMovement}
              onAddNewSku={handleAddNewSku}
              onQuickReorder={handleQuickReorder}
              onSendLowStockEmail={handleSendLowStockEmail}
              globalSearchQuery={globalSearchQuery}
            />
          )}

          {activeTab === 'hrms' && (
            <HRMSView
              employees={employees}
              resources={resources}
              payroll={payroll}
              currentRole={currentRole}
              googleConnected={googleConnected}
              onAddNewEmployee={handleAddNewEmployee}
              onApprovePayroll={handleApprovePayroll}
              onDispatchPayroll={handleApprovePayroll}
              onSendPayrollEmail={handleSendPayrollEmail}
              onUpdateResourceHours={handleUpdateResourceHours}
              globalSearchQuery={globalSearchQuery}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceView
              metrics={financialMetrics}
              invoices={invoices}
              gateways={gateways}
              transactions={gatewayTransactions}
              currentRole={currentRole}
              onProcessGatewayPayment={handleProcessGatewayPayment}
              onPayInvoice={handlePayInvoice}
              onRefundTransaction={handleRefundTransaction}
              globalSearchQuery={globalSearchQuery}
              onOpenInvoiceScanner={() => setIsInvoiceScannerOpen(true)}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              inventory={inventory}
              movements={movements}
              resources={resources}
              employees={employees}
              payroll={payroll}
              metrics={financialMetrics}
              googleConnected={googleConnected}
              onOpenGoogleModal={() => setIsGoogleModalOpen(true)}
              onExportSheets={handleExportSheets}
              onBackupDrive={handleBackupDrive}
              onQuickReorder={handleQuickReorder}
              isExporting={isExportingSheets}
              sheetsUrl={sheetsUrl}
              driveUrl={driveUrl}
            />
          )}

          {activeTab === 'security' && (
            <SecurityView
              auditLogs={auditLogs}
              currentRole={currentRole}
              mfaVerified={mfaVerified}
              onVerifyMfa={() => {
                setMfaVerified(true);
                showToast('MFA Step-Up Authentication verified successfully!');
              }}
              globalSearchQuery={globalSearchQuery}
            />
          )}

          {activeTab === 'integrations' && (
            <IntegrationsView
              googleConnected={googleConnected}
              onConnect={() => setGoogleConnected(true)}
              onExportSheets={handleExportSheets}
              onBackupDrive={handleBackupDrive}
              onSendEmail={async (to, sub, body) => {
                const res = await sendGmailNotification(to, sub, body);
                logAuditEvent('Integrations', 'Integrations', `Dispatched notification to ${to}. Subject: ${sub}`);
                showToast(`Gmail notification sent to ${to}`);
                return res;
              }}
              inventory={inventory}
              payroll={payroll}
              metrics={financialMetrics}
              resources={resources}
              sheetsUrl={sheetsUrl}
              driveUrl={driveUrl}
              isExporting={isExportingSheets}
            />
          )}
        </main>
      </div>

      {/* Global Enterprise Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsCommandPaletteOpen(false);
        }}
        inventory={inventory}
        employees={employees}
        invoices={invoices}
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          showToast(`Switched active profile to ${ROLE_PROFILES[role].title}`);
        }}
        onExportSheets={handleExportSheets}
        onBackupDrive={handleBackupDrive}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onOpenInvoiceScanner={() => setIsInvoiceScannerOpen(true)}
      />

      {/* Keyboard Shortcuts Reference Modal (?) */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Floating Aura ERP Copilot AI Launcher */}
      {!isChatbotOpen && (
        <button
          id="floating-ai-copilot-btn"
          onClick={() => setIsChatbotOpen(true)}
          title="Open Aura ERP Copilot (⌘J)"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-indigo-600 text-white shadow-2xl transition-all duration-200 active:scale-95 border border-slate-700/80 hover:border-indigo-400 group cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <span className="text-xs font-bold tracking-tight">AI Copilot</span>
          <span className="hidden sm:inline text-[10px] font-mono bg-slate-800 group-hover:bg-indigo-700 px-1.5 py-0.5 rounded text-slate-300">
            ⌘J
          </span>
        </button>
      )}

      {/* Enterprise AI Copilot Chatbot */}
      <ChatbotDrawer
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        inventory={inventory}
        metrics={financialMetrics}
        invoices={invoices}
        employees={employees}
        payroll={payroll}
        currentRole={currentRole}
        onNavigateTab={(tab) => {
          setActiveTab(tab as ActiveTab);
          setIsChatbotOpen(false);
        }}
        onOpenInvoiceScanner={() => {
          setIsChatbotOpen(false);
          setIsInvoiceScannerOpen(true);
        }}
      />

      {/* AI Invoice & Bill Camera / Vision Scanner */}
      <InvoiceScannerModal
        isOpen={isInvoiceScannerOpen}
        onClose={() => setIsInvoiceScannerOpen(false)}
        onAddInvoice={handleAddInvoice}
      />

      {/* Customize Dashboard Modal */}
      {isCustomizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 relative">
            <h3 className="text-base font-bold text-slate-900 mb-1">Customize Role Dashboard</h3>
            <p className="text-xs text-slate-500 mb-4">
              Toggle visibility of dashboard widgets to personalize your enterprise workspace.
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {widgets.map((w) => (
                <div
                  key={w.id}
                  onClick={() => handleToggleWidget(w.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    w.enabled
                      ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-semibold block text-slate-900">{w.title}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{w.category}</span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      w.enabled ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {w.enabled ? 'VISIBLE' : 'HIDDEN'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={handleResetWidgets}
                className="text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors"
              >
                Reset Default Layout
              </button>
              <button
                onClick={() => setIsCustomizeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Integration Modal */}
      <GoogleIntegrationModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        isConnected={googleConnected}
        onConnect={() => setGoogleConnected(true)}
        onSendEmail={async (to, sub, body) => {
          const res = await sendGmailNotification(to, sub, body);
          logAuditEvent('Integrations', 'Integrations', `Dispatched notification to ${to}. Subject: ${sub}`);
          showToast(`Gmail notification sent to ${to}`);
          return res;
        }}
        onExportSheets={handleExportSheets}
        onBackupDrive={handleBackupDrive}
        inventory={inventory}
        payroll={payroll}
        sheetsUrl={sheetsUrl}
        driveUrl={driveUrl}
      />
    </div>
  );
}
