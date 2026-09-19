import React, { useState, useEffect, useId } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  QrCode,
  Layers,
  MapPin,
  Building,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import QRCode from 'qrcode';
import { InventoryItem } from '../types';

interface SkuQrCodeModalProps {
  item: InventoryItem | null;
  allItems: InventoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectSku: (item: InventoryItem) => void;
}

export const SkuQrCodeModal: React.FC<SkuQrCodeModalProps> = ({
  item,
  allItems,
  isOpen,
  onClose,
  onSelectSku,
}) => {
  const [activeMode, setActiveMode] = useState<'single' | 'batch'>('single');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [batchQrUrls, setBatchQrUrls] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [labelSize, setLabelSize] = useState<'standard' | 'compact'>('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const skuSelectId = useId();

  // Generate QR code for the selected single item
  useEffect(() => {
    if (!item) return;

    let isMounted = true;
    setIsGenerating(true);

    const payload = JSON.stringify({
      erp: 'EnterpriseERP',
      sku: item.sku,
      id: item.id,
      name: item.name,
      loc: item.warehouseLocation,
      cat: item.category,
      min: item.reorderPoint,
      sup: item.supplier,
    });

    QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 256,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
        setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [item]);

  // Generate QR codes for all items when switching to batch mode
  useEffect(() => {
    if (activeMode !== 'batch' || allItems.length === 0) return;

    let isMounted = true;
    const generateBatch = async () => {
      const urls: Record<string, string> = {};
      for (const it of allItems) {
        try {
          const payload = JSON.stringify({
            erp: 'EnterpriseERP',
            sku: it.sku,
            id: it.id,
            name: it.name,
            loc: it.warehouseLocation,
            cat: it.category,
          });
          const url = await QRCode.toDataURL(payload, {
            errorCorrectionLevel: 'M',
            margin: 1,
            width: 180,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
          });
          urls[it.id] = url;
        } catch (e) {
          console.error(`Failed generating QR for ${it.sku}`, e);
        }
      }
      if (isMounted) {
        setBatchQrUrls(urls);
      }
    };

    generateBatch();

    return () => {
      isMounted = false;
    };
  }, [activeMode, allItems]);

  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyPayload = () => {
    const payload = JSON.stringify({
      erp: 'EnterpriseERP',
      sku: item.sku,
      id: item.id,
      name: item.name,
      loc: item.warehouseLocation,
      cat: item.category,
      min: item.reorderPoint,
      sup: item.supplier,
    });
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${item.sku}-QR-label.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto my-6">
        {/* Header (hidden in print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Printable SKU QR Barcode Generator</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  ISO/IEC 18004
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Generate high-density industrial 2D barcode labels for warehouse racks, bins, and packaging.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveMode('single')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeMode === 'single'
                    ? 'bg-white text-indigo-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Single SKU
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('batch')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeMode === 'batch'
                    ? 'bg-white text-indigo-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Batch Sheet ({allItems.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar Controls (hidden in print) */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          {activeMode === 'single' ? (
            <div className="flex items-center gap-2">
              <label htmlFor={skuSelectId} className="text-slate-500 font-medium">
                Active SKU:
              </label>
              <select
                id={skuSelectId}
                value={item.id}
                onChange={(e) => {
                  const target = allItems.find((i) => i.id === e.target.value);
                  if (target) onSelectSku(target);
                }}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {allItems.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.sku} - {it.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-slate-600 font-medium">
              Generating printable label stickers for all <strong>{allItems.length} inventory items</strong>.
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setLabelSize('standard')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  labelSize === 'standard' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Standard (Avery 5163)
              </button>
              <button
                type="button"
                onClick={() => setLabelSize('compact')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  labelSize === 'compact' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Compact (Bin Tag)
              </button>
            </div>

            {activeMode === 'single' && (
              <button
                type="button"
                onClick={handleCopyPayload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                title="Copy raw encoded JSON string"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Payload'}</span>
              </button>
            )}

            {activeMode === 'single' && (
              <button
                type="button"
                onClick={handleDownloadPng}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                title="Download barcode PNG asset"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG Asset</span>
              </button>
            )}

            <button
              type="button"
              id="print-qr-labels-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print {activeMode === 'single' ? 'Label' : 'All Labels'}</span>
            </button>
          </div>
        </div>

        {/* PRINTABLE AREA: This container is targeted by @media print */}
        <div id="printable-labels-area" className="mt-2">
          {activeMode === 'single' ? (
            /* Single Label Preview */
            <div className="flex justify-center p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
              <div
                className={`bg-white border-2 border-slate-900 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center gap-5 page-break-inside-avoid ${
                  labelSize === 'standard' ? 'max-w-md w-full' : 'max-w-sm w-full'
                }`}
              >
                {/* High Resolution QR Image */}
                <div className="shrink-0 flex flex-col items-center bg-white p-2 border border-slate-200 rounded-lg">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR Code for ${item.sku}`}
                      className="w-36 h-36 object-contain"
                    />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center bg-slate-100 text-slate-400 text-xs font-mono">
                      Generating...
                    </div>
                  )}
                  <span className="text-[10px] font-mono text-slate-600 font-semibold tracking-wider mt-1">
                    SCAN TO AUDIT
                  </span>
                </div>

                {/* Industrial Label Typography & Spec Details */}
                <div className="flex-1 min-w-0 space-y-2 text-left">
                  <div className="border-b-2 border-slate-900 pb-1.5">
                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider font-mono">
                      ENTERPRISE ASSET TAG
                    </div>
                    <div className="text-xl font-extrabold font-mono text-slate-950 tracking-tight">
                      {item.sku}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                      {item.name}
                    </div>
                    <div className="text-[10px] font-medium text-slate-600 mt-0.5">
                      Category: <span className="font-semibold text-slate-800">{item.category}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-slate-50 border border-slate-200 space-y-1 text-[10px]">
                    <div className="flex items-center gap-1 text-slate-700">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="font-mono font-bold truncate">{item.warehouseLocation}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Supplier: {item.supplier}</span>
                    </div>
                    <div className="flex items-center justify-between font-mono pt-1 border-t border-slate-200">
                      <span>Stock: <strong className="text-slate-900">{item.currentStock}</strong></span>
                      <span>Min Safe: <strong className="text-slate-900">{item.safetyStock}</strong></span>
                      <span>Reorder: <strong className="text-slate-900">{item.reorderPoint}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-600 font-mono pt-0.5">
                    <span>Batch: 2026-Q3</span>
                    <span>Verified: OK</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Batch Sheet Grid Preview */
            <div className="space-y-4">
              <div className="text-xs text-slate-500 text-center no-print">
                Formatted as 2-column sticker layout (compatible with standard thermal label printers and letter stock):
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allItems.map((it) => {
                  const url = batchQrUrls[it.id];
                  return (
                    <div
                      key={it.id}
                      className="bg-white border-2 border-slate-900 rounded-xl p-4 flex items-center gap-4 page-break-inside-avoid shadow-2xs"
                    >
                      <div className="shrink-0 flex flex-col items-center bg-white p-1 border border-slate-200 rounded-lg">
                        {url ? (
                          <img
                            src={url}
                            alt={`QR for ${it.sku}`}
                            className="w-24 h-24 object-contain"
                          />
                        ) : (
                          <div className="w-24 h-24 flex items-center justify-center bg-slate-100 text-slate-400 text-[10px] font-mono">
                            ...
                          </div>
                        )}
                        <span className="text-[8px] font-mono text-slate-600 font-semibold mt-0.5">
                          SCAN SKU
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1 text-left text-xs">
                        <div className="border-b border-slate-900 pb-1">
                          <div className="text-[9px] font-bold text-slate-600 font-mono">ASSET TAG</div>
                          <div className="text-sm font-extrabold font-mono text-slate-950 truncate">
                            {it.sku}
                          </div>
                        </div>

                        <div className="text-[11px] font-bold text-slate-900 truncate">{it.name}</div>
                        <div className="text-[9px] text-slate-600 truncate">
                          Loc: <strong className="font-mono text-slate-800">{it.warehouseLocation}</strong>
                        </div>
                        <div className="text-[9px] font-mono text-slate-600 flex justify-between">
                          <span>Stock: <strong>{it.currentStock}</strong></span>
                          <span>Reorder: <strong>{it.reorderPoint}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Guidance (hidden in print) */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 no-print">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Device camera can instantly scan these QR codes using the <strong>Scan SKU Barcode</strong> button.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
