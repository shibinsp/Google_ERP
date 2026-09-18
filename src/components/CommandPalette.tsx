import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  LayoutDashboard,
  Boxes,
  Users,
  DollarSign,
  BarChart3,
  ShieldCheck,
  CloudCog,
  FileSpreadsheet,
  HardDrive,
  Plus,
  ArrowRight,
  Sparkles,
  Command,
  CornerDownLeft,
  X,
  UserCheck,
  CreditCard,
  QrCode,
  ShieldAlert,
  Camera,
  Bot,
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { InventoryItem, Employee, Invoice, UserRole } from '../types';
import { ROLE_PROFILES } from '../data/initialData';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  inventory: InventoryItem[];
  employees: Employee[];
  invoices: Invoice[];
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onExportSheets: () => void;
  onBackupDrive: () => void;
  onOpenQuickReorderModal?: () => void;
  onOpenChatbot?: () => void;
  onOpenInvoiceScanner?: () => void;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Actions' | 'Inventory SKUs' | 'Personnel' | 'Security & RBAC';
  title: string;
  subtitle?: string;
  badge?: string;
  icon: React.ElementType;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  inventory,
  employees,
  invoices,
  currentRole,
  onRoleChange,
  onExportSheets,
  onBackupDrive,
  onOpenChatbot,
  onOpenInvoiceScanner,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Build command list
  const allCommands = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [
      // Navigation
      {
        id: 'nav-dash',
        category: 'Navigation',
        title: 'Executive Dashboard',
        subtitle: 'Main enterprise operations overview & KPI summaries',
        icon: LayoutDashboard,
        action: () => {
          onNavigateTab('dashboard');
          onClose();
        },
      },
      {
        id: 'nav-inv',
        category: 'Navigation',
        title: 'Inventory & Stock Velocity',
        subtitle: 'SKU catalog, depletion dates, stock movements & QR labels',
        icon: Boxes,
        action: () => {
          onNavigateTab('inventory');
          onClose();
        },
      },
      {
        id: 'nav-hrms',
        category: 'Navigation',
        title: 'HRMS & Resource Allocation',
        subtitle: 'Personnel vault, payroll batches & project capacity utilization',
        icon: Users,
        action: () => {
          onNavigateTab('hrms');
          onClose();
        },
      },
      {
        id: 'nav-fin',
        category: 'Navigation',
        title: 'Financials & Payment Gateways',
        subtitle: 'Treasury cash-flow, accounts payable & payment gateway routing',
        icon: DollarSign,
        action: () => {
          onNavigateTab('finance');
          onClose();
        },
      },
      {
        id: 'nav-ana',
        category: 'Navigation',
        title: 'Real-Time Analytics & BI',
        subtitle: 'YoY revenue growth, inventory turnover curves & predictive forecasts',
        icon: BarChart3,
        action: () => {
          onNavigateTab('analytics');
          onClose();
        },
      },
      {
        id: 'nav-sec',
        category: 'Navigation',
        title: 'E2EE Security & Audit Log',
        subtitle: 'Cryptographic SHA-256 tamper verification & compliance ledger',
        icon: ShieldCheck,
        action: () => {
          onNavigateTab('security');
          onClose();
        },
      },
      {
        id: 'nav-int',
        category: 'Navigation',
        title: 'Google Workspace Cloud Sync',
        subtitle: 'Sheets bidirectional balance export, Drive backups & Gmail alerts',
        icon: CloudCog,
        action: () => {
          onNavigateTab('integrations');
          onClose();
        },
      },

      // Executive Actions
      {
        id: 'act-ai-copilot',
        category: 'Actions',
        title: 'Launch Aura ERP Copilot (Gemini AI)',
        subtitle: 'Ask natural language questions about cash, runway, inventory & payroll',
        badge: 'AI Assistant',
        icon: Bot,
        action: () => {
          if (onOpenChatbot) onOpenChatbot();
          onClose();
        },
      },
      {
        id: 'act-scan-invoice',
        category: 'Actions',
        title: 'Scan Invoice / Bill with AI Vision',
        subtitle: 'Capture receipt or bill image with camera/upload to auto-extract ledger items',
        badge: 'Gemini OCR',
        icon: Camera,
        action: () => {
          if (onOpenInvoiceScanner) onOpenInvoiceScanner();
          onClose();
        },
      },
      {
        id: 'act-export-sheets',
        category: 'Actions',
        title: 'Export Ledger to Google Sheets',
        subtitle: 'Synchronizes inventory, financial KPIs, and resource allocations',
        badge: 'Workspace',
        icon: FileSpreadsheet,
        action: () => {
          onExportSheets();
          onClose();
        },
      },
      {
        id: 'act-backup-drive',
        category: 'Actions',
        title: 'Backup Encrypted Snapshot to Google Drive',
        subtitle: 'Stores SHA-256 sealed disaster recovery archive to Cloud Drive',
        badge: 'Workspace',
        icon: HardDrive,
        action: () => {
          onBackupDrive();
          onClose();
        },
      },
      {
        id: 'act-audit-verify',
        category: 'Actions',
        title: 'Run Cryptographic Tamper Verification',
        subtitle: 'Verifies hash chain integrity across all audit logs',
        badge: 'Security',
        icon: ShieldAlert,
        action: () => {
          onNavigateTab('security');
          onClose();
        },
      },

      // RBAC Role Switchers
      ...(Object.keys(ROLE_PROFILES) as UserRole[]).map((role) => ({
        id: `role-${role}`,
        category: 'Security & RBAC' as const,
        title: `Switch Profile: ${ROLE_PROFILES[role].title}`,
        subtitle: `Permissions: ${ROLE_PROFILES[role].allowedModules.join(', ')}`,
        badge: currentRole === role ? 'Active' : undefined,
        icon: UserCheck,
        action: () => {
          onRoleChange(role);
          onClose();
        },
      })),

      // Dynamic Inventory SKUs
      ...inventory.map((item) => ({
        id: `sku-${item.id}`,
        category: 'Inventory SKUs' as const,
        title: `${item.sku} • ${item.name}`,
        subtitle: `${item.currentStock} in stock • Reorder pt: ${item.reorderPoint} • Loc: ${item.warehouseLocation}`,
        badge: item.currentStock <= item.reorderPoint ? 'Low Stock' : 'Optimal',
        icon: Boxes,
        action: () => {
          onNavigateTab('inventory');
          onClose();
        },
      })),

      // Dynamic Personnel
      ...employees.map((emp) => ({
        id: `emp-${emp.id}`,
        category: 'Personnel' as const,
        title: `${emp.fullName} (${emp.employeeCode})`,
        subtitle: `${emp.roleTitle} • ${emp.department} • ${emp.employmentType}`,
        badge: emp.directDepositStatus === 'verified' ? 'Active' : 'Pending',
        icon: Users,
        action: () => {
          onNavigateTab('hrms');
          onClose();
        },
      })),
    ];

    return list;
  }, [inventory, employees, currentRole, onNavigateTab, onRoleChange, onExportSheets, onBackupDrive, onClose]);

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      return allCommands.filter((c) => c.category === 'Navigation' || c.category === 'Actions');
    }

    const q = query.toLowerCase();
    return allCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q)
    );
  }, [allCommands, query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filteredCommands.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredCommands.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      id="command-palette-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="command-palette-modal"
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Command className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            id="command-palette-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, jump to SKU, staff, report, or RBAC role..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto p-2 flex-1 divide-y divide-slate-50">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No matching command or record found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try searching for a SKU name, employee, or module</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = cmd.icon;

              return (
                <button
                  key={cmd.id}
                  data-selected={isSelected}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={cmd.action}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/90 text-indigo-950 shadow-2xs'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {cmd.title}
                        </span>
                        {cmd.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${
                              cmd.badge === 'Low Stock'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : cmd.badge === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {cmd.badge}
                          </span>
                        )}
                      </div>
                      {cmd.subtitle && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-3 shrink-0">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
                      {cmd.category}
                    </span>
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Legend */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="font-mono font-semibold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px]">
                ↑
              </span>
              <span className="font-mono font-semibold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px]">
                ↓
              </span>
              <span>to navigate</span>
            </span>

            <span className="flex items-center gap-1.5">
              <span className="font-mono font-semibold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px]">
                ↵
              </span>
              <span>to select</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <span>Enterprise Quick Command</span>
          </div>
        </div>
      </div>
    </div>
  );
};
