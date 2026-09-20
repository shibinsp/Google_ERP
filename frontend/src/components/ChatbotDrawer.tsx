import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  Camera,
  ArrowRight,
  TrendingUp,
  Package,
  DollarSign,
  Users,
  ShieldCheck,
  Bot,
  User,
  ExternalLink,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import {
  ChatMessage,
  InventoryItem,
  FinancialMetric,
  Invoice,
  Employee,
  PayrollRecord,
  UserRole,
} from '../types';
import { erpApi } from '../services/api';

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  metrics: FinancialMetric;
  invoices: Invoice[];
  employees: Employee[];
  payroll: PayrollRecord[];
  currentRole: UserRole;
  onNavigateTab: (tab: string) => void;
  onOpenInvoiceScanner: () => void;
}

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  isOpen,
  onClose,
  inventory,
  metrics,
  invoices,
  employees,
  payroll,
  currentRole,
  onNavigateTab,
  onOpenInvoiceScanner,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Hello! I am **Aura ERP Copilot**, your enterprise intelligence assistant powered by Gemini.

I have full visibility into your **${inventory.length} inventory SKUs**, **$${(metrics.cashOnHand / 1000000).toFixed(2)}M in cash reserves**, **${invoices.length} ledger invoices**, and active personnel.

How can I help you today? You can select a quick prompt below or type any question.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { label: 'Check Low Stock SKUs', actionType: 'filter', target: 'inventory' },
        { label: 'Review Treasury Runway', actionType: 'navigate', target: 'finance' },
        { label: 'Scan New Invoice / Bill', actionType: 'scan_invoice' },
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'What is our liquid cash balance & burn runway?',
    'Which SKUs are below safety reorder threshold?',
    'Summarize pending accounts payable invoices',
    'How is staff capacity and payroll trending?',
  ];

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsLoading(true);

    try {
      // Calculate real-time context
      const lowStockItems = inventory.filter((i) => i.currentStock <= i.reorderPoint);
      const inventoryValuation = inventory.reduce((acc, i) => acc + i.currentStock * i.unitPrice, 0);
      const pendingInvoices = invoices.filter((i) => i.status === 'pending');
      const pendingTotal = pendingInvoices.reduce((acc, i) => acc + i.amount, 0);
      const pendingPayroll = payroll.filter((p) => p.status === 'pending_approval' || p.status === 'draft');

      const erpContext = {
        currentRole,
        totalInventoryCount: inventory.length,
        inventoryValuation: inventoryValuation.toLocaleString(),
        lowStockCount: lowStockItems.length,
        lowStockSkus: lowStockItems.map((i) => `${i.sku} (${i.currentStock} left, min: ${i.reorderPoint})`).join(', '),
        cashOnHand: metrics.cashOnHand,
        grossMargin: metrics.grossProfitMargin,
        monthlyNetIncome: metrics.netIncomeMonthly,
        pendingInvoicesCount: pendingInvoices.length,
        pendingInvoicesTotal: pendingTotal.toLocaleString(),
        employeeCount: employees.length,
        pendingPayrollCount: pendingPayroll.length,
        avgTurnoverRatio: 8.4,
        avgDsi: 43.5,
      };

      let text = '';
      let actions: ChatMessage['actions'] = [];

      try {
        const copilotRes = await erpApi.copilotChat(query.trim(), erpContext);
        text = copilotRes.response;

        if (copilotRes.suggested_followups && copilotRes.suggested_followups.length > 0) {
          actions = copilotRes.suggested_followups.map((f) => ({
            label: f,
            actionType: 'filter',
            target: f.toLowerCase().includes('finance')
              ? 'finance'
              : f.toLowerCase().includes('inventory')
              ? 'inventory'
              : f.toLowerCase().includes('mesh')
              ? 'agentic_mesh'
              : undefined,
          }));
        }
      } catch {
        // Fallback to Express /api/chat endpoint
        const payloadMessages = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: payloadMessages,
            erpContext,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();
        text = data.reply || 'No response received.';
      }

      const lower = text.toLowerCase();
      if (lower.includes('invoice') || lower.includes('bill') || lower.includes('scan')) {
        actions.push({ label: 'Scan an Invoice / Bill', actionType: 'scan_invoice' });
      }
      if (lower.includes('inventory') || lower.includes('stock') || lower.includes('sku')) {
        actions.push({ label: 'Open Inventory Manager', actionType: 'navigate', target: 'inventory' });
      }
      if (lower.includes('finance') || lower.includes('cash') || lower.includes('margin')) {
        actions.push({ label: 'Open Treasury Dashboard', actionType: 'navigate', target: 'finance' });
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: actions.length > 0 ? actions : undefined,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          'I encountered a network difficulty contacting the AI service. You can still check your balances directly in the Finance or Inventory tabs.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: NonNullable<ChatMessage['actions']>[number]) => {
    if (action.actionType === 'scan_invoice') {
      onOpenInvoiceScanner();
    } else if (action.actionType === 'navigate' && action.target) {
      onNavigateTab(action.target);
    } else if (action.actionType === 'filter' && action.target) {
      onNavigateTab(action.target);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: 'Chat history cleared. How can I assist you with enterprise operations?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Helper to format simple markdown bold and bullet lines cleanly
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold replacer: **bold text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const lineContent = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-700 leading-relaxed my-0.5">
            {lineContent}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs text-slate-700 leading-relaxed my-1">
          {lineContent}
        </p>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 flex flex-col shadow-2xl bg-white border border-slate-200 overflow-hidden ${
        isExpanded
          ? 'inset-3 sm:inset-6 sm:max-w-3xl sm:mx-auto rounded-2xl'
          : 'bottom-4 right-4 sm:right-6 w-[94vw] sm:w-[440px] h-[600px] max-h-[85vh] rounded-2xl'
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold tracking-tight">Aura ERP Copilot</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-mono">Gemini 3.8</span>
            </div>
            <p className="text-[10px] text-slate-400">Enterprise Context Synchronized</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearChat}
            title="Clear Chat History"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Restore Size' : 'Expand View'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            id="chatbot-close-btn"
            onClick={onClose}
            title="Close Assistant"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start gap-2 max-w-[88%]">
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`p-3 rounded-2xl shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div>{renderFormattedText(msg.content)}</div>
                )}

                {/* Optional suggested action buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {msg.actions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleActionClick(act)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold border border-indigo-200/80 transition-colors"
                      >
                        {act.actionType === 'scan_invoice' && <Camera className="w-3 h-3 text-indigo-600" />}
                        {act.actionType === 'navigate' && <ChevronRight className="w-3 h-3 text-indigo-600" />}
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <span className="text-[9px] text-slate-400 mt-1 px-8">{msg.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs py-2 px-1">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-slate-200 p-2.5 rounded-2xl rounded-bl-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] text-slate-500 font-medium">Analyzing ERP telemetry...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
          <span>Ask:</span>
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            disabled={isLoading}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200/80 transition-colors disabled:opacity-50 shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={onOpenInvoiceScanner}
            title="Scan invoice or bill image"
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-colors shrink-0"
          >
            <Camera className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything about inventory, cash, invoices, payroll..."
            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors text-slate-900 placeholder-slate-400"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all disabled:opacity-40 shrink-0 shadow-2xs active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
          <span>Enterprise privacy protected. Real-time ERP grounding.</span>
          <span className="font-mono">Press ⌘J to toggle</span>
        </div>
      </div>
    </div>
  );
};
