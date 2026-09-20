import React from 'react';
import {
  X,
  Keyboard,
  Command,
  CornerDownLeft,
  Search,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Global Command & Search',
      items: [
        { keys: ['⌘', 'K'], label: 'Open Enterprise Command Palette (or Ctrl + K)' },
        { keys: ['⌘', 'J'], label: 'Toggle Aura ERP Copilot AI Chatbot (or Ctrl + J)' },
        { keys: ['⌘', 'I'], label: 'Open AI Invoice & Bill Camera Scanner (or Ctrl + I)' },
        { keys: ['/'], label: 'Focus global search filter' },
        { keys: ['?'], label: 'Toggle this keyboard shortcut reference guide' },
        { keys: ['ESC'], label: 'Close active modal, drawer, or dropdown' },
      ],
    },
    {
      category: 'Module Quick Navigation',
      items: [
        { keys: ['G', 'D'], label: 'Jump to Executive Dashboard' },
        { keys: ['G', 'I'], label: 'Jump to Inventory & Stock Velocity' },
        { keys: ['G', 'H'], label: 'Jump to HRMS & Resource Allocation' },
        { keys: ['G', 'F'], label: 'Jump to Financials & Gateways' },
        { keys: ['G', 'A'], label: 'Jump to Real-Time Analytics & BI' },
        { keys: ['G', 'S'], label: 'Jump to E2EE Security & Audit Log' },
      ],
    },
    {
      category: 'Executive Cloud Actions',
      items: [
        { keys: ['Alt', 'S'], label: 'Export balance sheet to Google Sheets' },
        { keys: ['Alt', 'D'], label: 'Backup encrypted snapshot to Google Drive' },
        { keys: ['Alt', 'R'], label: 'Refresh real-time telemetry stream' },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200/60">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Enterprise Keyboard Shortcuts</h3>
              <p className="text-[11px] text-slate-500">Accelerate your workflow with power-user hotkeys</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {shortcuts.map((section) => (
            <div key={section.category} className="space-y-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {section.category}
              </h4>

              <div className="space-y-1.5">
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100/80 text-xs"
                  >
                    <span className="text-slate-700 font-medium">{item.label}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, i) => (
                        <kbd
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs font-mono font-semibold text-slate-800 text-[11px]"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero-Trust Enterprise Environment</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
