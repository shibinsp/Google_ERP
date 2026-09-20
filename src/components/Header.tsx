import React, { useState } from 'react';
import {
  ShieldCheck,
  Bell,
  Search,
  KeyRound,
  FileSpreadsheet,
  HardDrive,
  Mail,
  ChevronDown,
  Menu,
  X,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  Command,
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
  Camera,
  Bot,
  Sun,
  Moon,
  Building2,
} from 'lucide-react';
import { UserRole, NotificationAlert } from '../types';
import { ROLE_PROFILES } from '../data/initialData';
import { ActiveTab } from './Sidebar';
import { useEnterpriseOrg } from '../context/EnterpriseOrgContext';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  mfaVerified: boolean;
  onOpenMfaModal: () => void;
  onOpenCustomizeModal: () => void;
  onOpenGoogleModal: () => void;
  notifications: NotificationAlert[];
  onMarkNotificationRead: (id: string) => void;
  onSendGmailNotification: (notif: NotificationAlert) => void;
  googleConnected: boolean;
  userEmail?: string;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  onToggleMobileSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCommandPalette?: () => void;
  onOpenShortcutsModal?: () => void;
  onOpenChatbot?: () => void;
  onOpenInvoiceScanner?: () => void;
  activeTab?: ActiveTab;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  mfaVerified,
  onOpenMfaModal,
  onOpenCustomizeModal,
  onOpenGoogleModal,
  notifications,
  onMarkNotificationRead,
  onSendGmailNotification,
  googleConnected,
  userEmail,
  onToggleMobileSidebar,
  searchQuery,
  onSearchChange,
  onOpenCommandPalette,
  onOpenShortcutsModal,
  onOpenChatbot,
  onOpenInvoiceScanner,
  activeTab = 'dashboard',
  theme = 'light',
  onToggleTheme,
}) => {
  const { currentOrg, switchOrg, allOrgs } = useEnterpriseOrg();
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread' | 'critical'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;
  const roleProfile = ROLE_PROFILES[currentRole];

  // Breadcrumb label mapper
  const tabTitles: Record<ActiveTab, string> = {
    dashboard: 'Dashboard',
    inventory: 'Inventory',
    hrms: 'Human Resources',
    finance: 'Finance & Payments',
    analytics: 'Analytics & Reports',
    security: 'Security & Logs',
    integrations: 'Integrations',
    agentic_mesh: 'AI Agents',
    mcp_protocol: 'MCP Tools',
    governance: 'AI Governance',
    manufacturing: 'Manufacturing',
    crm_sales: 'Sales & CRM',
  };

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'unread') return !n.read;
    if (notifFilter === 'critical') return n.severity === 'critical';
    return true;
  });

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-100 border-b border-slate-200/80 dark:border-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Mobile Toggle & Breadcrumbs Pathway */}
          <div className="flex items-center gap-3">
            <button
              id="mobile-sidebar-toggle"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Branding */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-2xs">
                <span className="text-xs font-mono tracking-wider">ERP</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-xs">Enterprise Suite</span>
            </div>

            {/* Desktop Breadcrumb Hierarchy */}
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Enterprise</span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700">
                {tabTitles[activeTab]}
              </span>
              <span className="flex items-center gap-1 ml-2 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Sync (14ms)</span>
              </span>
            </div>
          </div>

          {/* Middle: Universal Search Bar triggering Command Palette */}
          <div className="flex-1 max-w-md hidden md:block">
            <div
              onClick={onOpenCommandPalette}
              className="relative cursor-pointer group"
            >
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              <input
                id="header-global-search"
                type="text"
                readOnly
                value={searchQuery}
                onClick={onOpenCommandPalette}
                placeholder="Search SKUs, staff, invoices, ledger actions..."
                className="w-full pl-9 pr-20 py-1.5 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none cursor-pointer transition-all shadow-2xs group-hover:border-slate-300 dark:group-hover:border-slate-600"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 shadow-2xs">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Controls Zone: Grouped into System Tools, AI & Cloud Actions, and Workspace & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sub-group 1: System Tools & Security */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Dark / Light Theme Toggle Button */}
              {onToggleTheme && (
                <button
                  id="header-theme-toggle-btn"
                  onClick={onToggleTheme}
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-2xs transition-colors"
                  aria-label="Toggle Theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              )}

              {/* Quick Command Palette Button for Mobile / Small Screens */}
              <button
                id="header-command-palette-btn"
                onClick={onOpenCommandPalette}
                title="Open Command Center (⌘K)"
                className="md:hidden p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors"
                aria-label="Command Palette"
              >
                <Command className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </button>

              {/* Keyboard Shortcuts Trigger Button */}
              <button
                id="header-shortcuts-btn"
                onClick={onOpenShortcutsModal}
                title="Keyboard Shortcuts Reference Guide (?)"
                className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs text-xs font-medium transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <kbd className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">?</kbd>
              </button>

              {/* MFA Security Status Pill */}
              <button
                id="header-mfa-btn"
                onClick={onOpenMfaModal}
                title="Multi-Factor Authentication & E2EE Vault Status"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors shadow-2xs ${
                  mfaVerified
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/80'
                    : 'bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100/70 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{mfaVerified ? 'MFA Verified' : 'MFA Required'}</span>
              </button>
            </div>

            {/* Vertical Divider */}
            <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-800 my-auto" />

            {/* Sub-group 2: AI & Cloud Integrations */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* AI Invoice Vision Scanner Button */}
              {onOpenInvoiceScanner && (
                <button
                  id="header-scan-invoice-btn"
                  onClick={onOpenInvoiceScanner}
                  title="Scan Invoice or Bill with Gemini AI Vision (⌘I)"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-300 text-xs font-medium shadow-2xs transition-all"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden lg:inline">Scan Bill</span>
                </button>
              )}

              {/* AI Copilot Chatbot Button */}
              {onOpenChatbot && (
                <button
                  id="header-ai-copilot-btn"
                  onClick={onOpenChatbot}
                  title="Open Aura ERP Copilot (⌘J)"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                  <span>AI Copilot</span>
                  <span className="hidden xl:inline px-1 py-0.2 rounded bg-indigo-500/60 text-[10px] font-mono text-indigo-100">
                    ⌘J
                  </span>
                </button>
              )}

              {/* Google Workspace Cloud Integrations Status */}
              <button
                id="header-google-workspace-btn"
                onClick={onOpenGoogleModal}
                title="Google Workspace (Sheets, Drive, Gmail) Integrations"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors shadow-2xs ${
                  googleConnected
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/70'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center -space-x-1">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <HardDrive className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <Mail className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                </div>
                <span className="hidden xl:inline">
                  {googleConnected ? 'Workspace Active' : 'Connect Cloud'}
                </span>
              </button>
            </div>

            {/* Vertical Divider */}
            <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-800 my-auto" />

            {/* Sub-group 3: Workspace Tools, Alerts & RBAC Profile */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Customize Dashboard Button */}
              <button
                id="header-customize-workspace-btn"
                onClick={onOpenCustomizeModal}
                title="Customize Role Workspace Widgets"
                className="p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white shadow-2xs transition-colors"
                aria-label="Customize Workspace"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

            {/* Notification Bell with Filterable Dropdown */}
            <div className="relative">
              <button
                id="header-notifications-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white shadow-2xs transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Enterprise Alerts</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-semibold">
                        {unreadCount} new
                      </span>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-medium">
                      <button
                        onClick={() => setNotifFilter('all')}
                        className={`px-2 py-0.5 rounded-md transition-colors ${
                          notifFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setNotifFilter('unread')}
                        className={`px-2 py-0.5 rounded-md transition-colors ${
                          notifFilter === 'unread' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        Unread
                      </button>
                      <button
                        onClick={() => setNotifFilter('critical')}
                        className={`px-2 py-0.5 rounded-md transition-colors ${
                          notifFilter === 'critical' ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 shadow-2xs font-semibold' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        Critical
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">No alerts matching filter</div>
                    ) : (
                      filteredNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 transition-colors ${
                            notif.read ? 'bg-white dark:bg-slate-900 opacity-80' : 'bg-slate-50/70 dark:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              {notif.severity === 'critical' ? (
                                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              ) : notif.severity === 'warning' ? (
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <h4 className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{notif.title}</h4>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 inline-block font-mono">{notif.timestamp}</span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1 shrink-0">
                              {!notif.read && (
                                <button
                                  onClick={() => onMarkNotificationRead(notif.id)}
                                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium"
                                >
                                  Dismiss
                                </button>
                              )}
                              {googleConnected && (
                                <button
                                  onClick={() => onSendGmailNotification(notif)}
                                  title="Dispatch alert directly through Gmail API"
                                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-[10px] font-medium border border-rose-200 dark:border-rose-800"
                                >
                                  <Mail className="w-2.5 h-2.5" />
                                  <span>Gmail</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-center">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Auto-triggered when stock drops below safety buffers or payroll batches require sign-off.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Multi-Tenant Organization Switcher */}
            <div className="relative">
              <button
                id="header-org-dropdown-btn"
                onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-left shadow-2xs transition-colors"
                title={`Active Enterprise Tenant: ${currentOrg.name}`}
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <div className="hidden xl:block text-left">
                  <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-[130px] leading-tight">
                    {currentOrg.name.split(' ')[0]} {currentOrg.division.split(' ')[0]}
                  </div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 leading-none truncate max-w-[130px] font-mono">
                    {currentOrg.currency} • {currentOrg.region.split('/')[0]}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showOrgDropdown && (
                <div className="absolute right-0 mt-2 w-84 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Enterprise Tenant Switcher
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-semibold">
                      SOC2 Tenant Isolation
                    </span>
                  </div>

                  <div className="p-1.5 space-y-1">
                    {allOrgs.map((org) => {
                      const isSelected = currentOrg.id === org.id;
                      return (
                        <button
                          key={org.id}
                          onClick={() => {
                            switchOrg(org.id);
                            setShowOrgDropdown(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-200 border border-indigo-200/80 dark:border-indigo-800 font-semibold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Building2
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-white truncate">{org.name}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{org.division}</div>
                            <div className="text-[9px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                              {org.region} • {org.complianceLevel}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Role-Based Access Control (RBAC) Switcher */}
            <div className="relative">
              <button
                id="header-role-dropdown-btn"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-left shadow-2xs transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-bold text-[10px] flex items-center justify-center tracking-wider shadow-2xs">
                  SP
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px] leading-tight">
                    Shibin P
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-none truncate max-w-[120px]">
                    {roleProfile.title.split('(')[0]}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                  {/* Real User Card Header */}
                  <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      SP
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                        <span>Shibin P</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-semibold border border-emerald-200 dark:border-emerald-800">
                          Active User
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">
                        {userEmail || 'shibinsp43@gmail.com'}
                      </div>
                    </div>
                  </div>

                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Switch Role Access
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono font-semibold">
                      Multi-Tenant RBAC
                    </span>
                  </div>

                  <div className="p-1 space-y-1">
                    {(Object.keys(ROLE_PROFILES) as UserRole[]).map((roleKey) => {
                      const profile = ROLE_PROFILES[roleKey];
                      const isSelected = currentRole === roleKey;
                      return (
                        <button
                          key={roleKey}
                          onClick={() => {
                            onRoleChange(roleKey);
                            setShowRoleDropdown(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-200 border border-indigo-200/80 dark:border-indigo-800 font-semibold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              isSelected ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                          />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{profile.title}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{profile.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Workspaces and navigation automatically adapt based on your selected role permissions.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
  );
};
