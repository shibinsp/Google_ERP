import React, { useState } from 'react';
import {
  LayoutDashboard,
  Boxes,
  Users,
  DollarSign,
  BarChart3,
  ShieldCheck,
  CloudCog,
  ChevronRight,
  SlidersHorizontal,
  Building2,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Bot,
  Cpu,
  Scale,
  Factory,
  ShoppingBag,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { UserRole } from '../types';
import { ROLE_PROFILES } from '../data/initialData';

export type ActiveTab =
  | 'dashboard'
  | 'inventory'
  | 'hrms'
  | 'finance'
  | 'analytics'
  | 'security'
  | 'integrations'
  | 'agentic_mesh'
  | 'mcp_protocol'
  | 'governance'
  | 'manufacturing'
  | 'crm_sales'
  | 'ooux_framework'
  | 'design_tokens'
  | 'micro_frontends'
  | 'agentic_ux'
  | 'ux_roi_analytics';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentRole: UserRole;
  lowStockCount: number;
  pendingPayrollCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenCustomizeModal: () => void;
  onOpenShortcutsModal?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentRole,
  lowStockCount,
  pendingPayrollCount,
  isMobileOpen,
  onCloseMobile,
  onOpenCustomizeModal,
  onOpenShortcutsModal,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const roleProfile = ROLE_PROFILES[currentRole];
  const [selectedFacility, setSelectedFacility] = useState('Global HQ (US-East-1)');
  const [showFacilityDropdown, setShowFacilityDropdown] = useState(false);

  const facilities = [
    'Global HQ (US-East-1)',
    'Logistics Hub (Austin, TX)',
    'EMEA Distribution (Frankfurt)',
    'APAC Core (Singapore)',
  ];

  interface NavItem {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
    moduleKey:
      | 'inventory'
      | 'hrms'
      | 'finance'
      | 'analytics'
      | 'security'
      | 'integrations'
      | 'agentic_mesh'
      | 'mcp_protocol'
      | 'governance'
      | 'manufacturing'
      | 'crm_sales';
  }

  const operationsNav: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      moduleKey: 'analytics',
    },
    {
      id: 'inventory',
      label: 'Inventory & Stock Velocity',
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      moduleKey: 'inventory',
    },
    {
      id: 'manufacturing',
      label: 'Manufacturing & MRP',
      icon: Factory,
      moduleKey: 'manufacturing',
    },
    {
      id: 'crm_sales',
      label: 'CRM & Quote-to-Order',
      icon: ShoppingBag,
      moduleKey: 'crm_sales',
    },
    {
      id: 'hrms',
      label: 'HRMS & Workforce Capacity',
      icon: Users,
      badge: pendingPayrollCount > 0 ? pendingPayrollCount : undefined,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      moduleKey: 'hrms',
    },
    {
      id: 'finance',
      label: 'Financials & Gateways',
      icon: DollarSign,
      moduleKey: 'finance',
    },
  ];

  const governanceNav: NavItem[] = [
    {
      id: 'analytics',
      label: 'Real-Time Analytics & BI',
      icon: BarChart3,
      moduleKey: 'analytics',
    },
    {
      id: 'security',
      label: 'E2EE Security & Audit Log',
      icon: ShieldCheck,
      moduleKey: 'security',
    },
    {
      id: 'integrations',
      label: 'Google Cloud Sync',
      icon: CloudCog,
      moduleKey: 'integrations',
    },
  ];

  const aiArchitectureNav: NavItem[] = [
    {
      id: 'agentic_mesh',
      label: 'Agentic Mesh (EAAF)',
      icon: Bot,
      moduleKey: 'agentic_mesh',
    },
    {
      id: 'mcp_protocol',
      label: 'MCP Protocol Server',
      icon: Cpu,
      moduleKey: 'mcp_protocol',
    },
    {
      id: 'governance',
      label: 'EU AI Act & Compliance',
      icon: Scale,
      moduleKey: 'governance',
    },
  ];

  const renderNavList = (items: NavItem[], sectionTitle: string) => {
    // Filter unallowed items based on role so they are completely hidden instead of blurred/locked
    const allowedItems = items.filter(
      (item) =>
        currentRole === 'super_admin' ||
        item.id === 'dashboard' ||
        roleProfile.allowedModules.includes(item.moduleKey)
    );

    if (allowedItems.length === 0) return null;

    return (
      <div className="space-y-1">
        {!isCollapsed && (
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
            {sectionTitle}
          </div>
        )}
        {allowedItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center justify-between py-2 rounded-xl text-xs font-medium transition-all ${
                isCollapsed ? 'px-2.5 justify-center' : 'px-3'
              } ${
                isActive
                  ? 'bg-indigo-50 text-indigo-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className={`flex items-center gap-2.5 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                />
                {!isCollapsed && (
                  <span className="truncate whitespace-nowrap">{item.label}</span>
                )}
              </div>

              {!isCollapsed && item.badge !== undefined && (
                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                      isActive ? 'bg-white text-indigo-700 border-indigo-200' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-slate-200/90 flex flex-col justify-between shadow-[1px_0_4px_rgba(0,0,0,0.02)] transition-all duration-200 lg:translate-x-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Top Organization Header & Collapse Toggle */}
          <div className="p-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-2xs shrink-0">
                  ERP
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-900 text-xs tracking-tight truncate">
                        Enterprise Suite
                      </span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        PROD
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">Acme Global Corp</p>
                  </div>
                )}
              </div>

              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                  className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                >
                  {isCollapsed ? (
                    <PanelLeftOpen className="w-4 h-4" />
                  ) : (
                    <PanelLeftClose className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {/* Facility Selector Dropdown */}
            {!isCollapsed && (
              <div className="relative mt-2">
                <button
                  onClick={() => setShowFacilityDropdown(!showFacilityDropdown)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[11px] text-slate-700 font-medium transition-colors"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedFacility}</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                </button>

                {showFacilityDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 text-xs">
                    {facilities.map((f) => (
                      <button
                        key={f}
                        onClick={() => {
                          setSelectedFacility(f);
                          setShowFacilityDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center justify-between ${
                          selectedFacility === f ? 'font-semibold text-indigo-700 bg-indigo-50/50' : ''
                        }`}
                      >
                        <span className="truncate">{f}</span>
                        {selectedFacility === f && (
                          <CheckCircle2 className="w-3 h-3 text-indigo-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grouped Navigation Links */}
          <div className="p-3 space-y-4 overflow-y-auto flex-1">
            {renderNavList(operationsNav, 'Core Operations')}
            {renderNavList(governanceNav, 'Intelligence & Security')}
            {renderNavList(aiArchitectureNav, 'Agentic Mesh & MCP')}
          </div>
        </div>

        {/* Bottom Role & System Telemetry Status Card */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 shrink-0 space-y-2">
          {!isCollapsed ? (
            <>
              {/* Active RBAC Card */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-medium">RBAC Clearance</span>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono font-bold text-[9px]">
                    {currentRole.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-900 mt-1 truncate">
                  {roleProfile.title.split('(')[0]}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 mt-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Zero-Trust VPC (14ms)</span>
                </div>
              </div>

              {/* Action Buttons: Customize & Shortcuts */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  id="sidebar-customize-btn"
                  onClick={onOpenCustomizeModal}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 shadow-2xs transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Widgets</span>
                </button>

                <button
                  id="sidebar-shortcuts-btn"
                  onClick={onOpenShortcutsModal}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 shadow-2xs transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>Hotkeys (?)</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="VPC Active" />
              <button
                onClick={onOpenCustomizeModal}
                title="Customize Widgets"
                className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs"
              >
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
