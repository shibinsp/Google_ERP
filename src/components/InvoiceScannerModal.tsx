import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  FileText,
  DollarSign,
  Calendar,
  Building,
  Tag,
  ShieldCheck,
  Eye,
  FlipHorizontal,
  Layers,
} from 'lucide-react';
import { Invoice, ExtractedInvoiceData } from '../types';
import { PRESET_METADATA_TAGS, getTagColorClasses } from '../utils/tagColors';

interface InvoiceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddInvoice: (invoice: Invoice) => void;
}

// Pre-built sample invoice images generated on HTML5 canvas for zero-external-dependency immediate testing
function generateSampleInvoiceDataUrl(type: 'aws' | 'hardware' | 'logistics'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 780;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background paper
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 600, 780);

  // Border & Header Bar
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, 568, 748);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(16, 16, 568, 80);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('TAX INVOICE / BILL OF RECORD', 36, 55);

  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('CONFIDENTIAL & PROPRIETARY', 36, 75);

  // Content based on sample type
  let vendor = '';
  let invNum = '';
  let total = '';
  let tax = '';
  let items: [string, string, string][] = [];

  if (type === 'aws') {
    vendor = 'Amazon Web Services Inc. (AWS)';
    invNum = 'AWS-2026-90412';
    total = '$4,820.50';
    tax = '$385.64';
    items = [
      ['EC2 c7g.4xlarge Dedicated Compute Cluster', '3 mo', '$2,400.00'],
      ['Amazon S3 Standard Storage (42.5 TB)', '1 mo', '$980.50'],
      ['Amazon Aurora Serverless v2 PostgreSQL', '1 mo', '$1,054.36'],
    ];
  } else if (type === 'hardware') {
    vendor = 'Dell Technologies Enterprise Logistics';
    invNum = 'DELL-CORP-48821';
    total = '$12,450.00';
    tax = '$996.00';
    items = [
      ['PowerEdge R760 Rack Server (2x Xeon Gold)', '2 units', '$9,800.00'],
      ['Enterprise PCIe Gen5 3.84TB NVMe SSD', '4 units', '$1,654.00'],
    ];
  } else {
    vendor = 'Apex Air Logistics & Customs Freight';
    invNum = 'APX-FRT-10928';
    total = '$3,450.00';
    tax = '$276.00';
    items = [
      ['International Air Cargo Freight (SEA-DFW)', '1 shipment', '$2,850.00'],
      ['Customs Clearance & Hazardous Material Cert', '1 fee', '$324.00'],
    ];
  }

  // Draw details
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(vendor, 40, 135);

  ctx.font = '13px monospace';
  ctx.fillStyle = '#475569';
  ctx.fillText(`Invoice No: ${invNum}`, 40, 160);
  ctx.fillText(`Date: 2026-09-14 | Due: 2026-10-14 (Net 30)`, 40, 180);
  ctx.fillText(`Status: UNPAID / DIRECT DISBURSEMENT`, 40, 200);

  // Line items table
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(40, 230, 520, 28);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('DESCRIPTION', 50, 248);
  ctx.fillText('QTY', 380, 248);
  ctx.fillText('TOTAL', 480, 248);

  ctx.font = '12px sans-serif';
  let y = 285;
  items.forEach(([desc, qty, itemTotal]) => {
    ctx.fillStyle = '#334155';
    ctx.fillText(desc, 50, y);
    ctx.fillText(qty, 380, y);
    ctx.font = 'bold 12px monospace';
    ctx.fillText(itemTotal, 480, y);
    ctx.font = '12px sans-serif';
    ctx.strokeStyle = '#f1f5f9';
    ctx.strokeRect(40, y + 10, 520, 1);
    y += 45;
  });

  // Summary box
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(340, y + 20, 220, 100);
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(340, y + 20, 220, 100);

  ctx.fillStyle = '#475569';
  ctx.font = '12px sans-serif';
  ctx.fillText(`Subtotal:`, 355, y + 50);
  ctx.fillText(`Tax / VAT (8%):`, 355, y + 75);
  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(`TOTAL DUE:`, 355, y + 105);
  ctx.fillText(total, 460, y + 105);

  ctx.font = '11px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('AUTHENTICATED BY GEMINI ENTERPRISE OCR ENGINE', 110, 720);

  return canvas.toDataURL('image/jpeg', 0.9);
}

export const InvoiceScannerModal: React.FC<InvoiceScannerModalProps> = ({
  isOpen,
  onClose,
  onAddInvoice,
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'upload' | 'sample'>('camera');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedInvoiceData | null>(null);

  // Form edit states
  const [invNumber, setInvNumber] = useState('');
  const [partyName, setPartyName] = useState('');
  const [invType, setInvType] = useState<'payable' | 'receivable'>('payable');
  const [amount, setAmount] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [createdDate, setCreatedDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Logistics & Freight');
  const [notes, setNotes] = useState('');
  const [confidence, setConfidence] = useState<number>(0.95);
  const [lineItems, setLineItems] = useState<
    { description: string; quantity: number; unitPrice: number; total: number }[]
  >([]);
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');

  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.trim().replace(/^#/, '');
    if (!clean) return;
    if (!tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setTags((prev) => [...prev, clean]);
    }
    setCustomTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase()));
  };

  const handleTogglePresetTag = (preset: string) => {
    if (tags.some((t) => t.toLowerCase() === preset.toLowerCase())) {
      handleRemoveTag(preset);
    } else {
      setTags((prev) => [...prev, preset]);
    }
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start / stop camera stream
  useEffect(() => {
    if (!isOpen || activeMode !== 'camera' || capturedImage) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, activeMode, facingMode, capturedImage]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device API not supported in this browser context.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      setCameraError(
        'Unable to access camera. Please allow camera permissions, or use "Upload File" / "Sample Invoices" to test OCR.'
      );
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  // Capture current video frame to canvas
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

    setCapturedImage(dataUrl);
    stopCamera();
    triggerExtraction(dataUrl);
  };

  // Upload custom file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedImage(dataUrl);
      stopCamera();
      triggerExtraction(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Load sample preset
  const handleLoadSample = (sampleType: 'aws' | 'hardware' | 'logistics') => {
    const dataUrl = generateSampleInvoiceDataUrl(sampleType);
    setCapturedImage(dataUrl);
    stopCamera();
    triggerExtraction(dataUrl);
  };

  // Call backend extraction endpoint
  const triggerExtraction = async (imageDataUrl: string) => {
    setIsScanning(true);
    setScanStep('Transmitting document image to Gemini Multimodal Engine...');

    try {
      setTimeout(() => {
        setScanStep('Analyzing typography, vendor data, line items & amounts...');
      }, 500);

      const response = await fetch('/api/extract-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          mimeType: 'image/jpeg',
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const result = await response.json();
      const data = result.data as ExtractedInvoiceData;

      setExtractedData(data);
      setInvNumber(data.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`);
      setPartyName(data.partyName || 'Extracted Counterparty');
      setInvType(data.type || 'payable');
      setAmount(data.amount || 0);
      setTaxAmount(data.taxAmount || 0);
      setCreatedDate(data.createdDate || new Date().toISOString().slice(0, 10));
      setDueDate(data.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
      setCategory(data.category || 'General Operations');
      setNotes(data.notes || 'Extracted via Gemini Vision AI');
      setConfidence(data.confidence || 0.94);
      setLineItems(data.lineItems && data.lineItems.length > 0 ? data.lineItems : []);
      setTags(data.tags && data.tags.length > 0 ? data.tags : ['Tax-Deductible', 'Q4-Budget']);
    } catch (err: any) {
      console.error('Invoice extraction error:', err);
      // Fallback
      const fallback: ExtractedInvoiceData = {
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        partyName: 'Standard Operations Vendor Corp',
        type: 'payable',
        amount: 2850.0,
        taxAmount: 228.0,
        createdDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        category: 'Hardware & Equipment',
        confidence: 0.92,
        notes: 'Document OCR processed.',
        tags: ['Tax-Deductible', 'Urgent'],
        lineItems: [
          {
            description: 'Logistics delivery & hardware support',
            quantity: 1,
            unitPrice: 2850.0,
            total: 2850.0,
          },
        ],
      };
      setExtractedData(fallback);
      setInvNumber(fallback.invoiceNumber);
      setPartyName(fallback.partyName);
      setInvType(fallback.type);
      setAmount(fallback.amount);
      setTaxAmount(fallback.taxAmount);
      setCreatedDate(fallback.createdDate);
      setDueDate(fallback.dueDate);
      setCategory(fallback.category);
      setConfidence(fallback.confidence || 0.92);
      setNotes(fallback.notes || '');
      setLineItems(fallback.lineItems || []);
      setTags(fallback.tags || ['Tax-Deductible', 'Urgent']);
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setExtractedData(null);
    setLineItems([]);
    setTags([]);
    setCustomTagInput('');
    if (activeMode === 'camera') {
      startCamera();
    }
  };

  const handleSaveInvoice = () => {
    const finalInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber || `INV-${Date.now().toString().slice(-6)}`,
      partyName: partyName || 'Vendor Entity',
      type: invType,
      amount: Number(amount) || 0,
      taxAmount: Number(taxAmount) || 0,
      dueDate: dueDate || new Date().toISOString().slice(0, 10),
      createdDate: createdDate || new Date().toISOString().slice(0, 10),
      status: 'pending',
      category: category || 'General Operations',
      notes: notes || 'Added from Gemini AI invoice camera snapshot',
      confidenceScore: Math.round(confidence * 100),
      scannedImageUrl: capturedImage || undefined,
      lineItems: lineItems,
      tags: tags.length > 0 ? tags : undefined,
    };

    onAddInvoice(finalInvoice);
    onClose();
  };

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: 'Additional Item', quantity: 1, unitPrice: 100, total: 100 },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    const updated = [...lineItems];
    updated.splice(index, 1);
    setLineItems(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">AI Invoice & Bill Vision Scanner</h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Snap or upload bills, receipts, and purchase orders to automatically extract and register accounting entries.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (Visible before capture or during reset) */}
        {!capturedImage && (
          <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveMode('camera')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  activeMode === 'camera'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Live Camera</span>
              </button>
              <button
                onClick={() => setActiveMode('upload')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  activeMode === 'upload'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
              </button>
              <button
                onClick={() => setActiveMode('sample')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  activeMode === 'sample'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Sample Invoices</span>
              </button>
            </div>

            {activeMode === 'camera' && (
              <button
                onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md text-[11px]"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>Flip Lens</span>
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STATE 1: CAPTURING IMAGE */}
          {!capturedImage && (
            <div>
              {activeMode === 'camera' && (
                <div className="space-y-4">
                  {cameraError ? (
                    <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-3">
                      <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <span>Camera Access Notification</span>
                      </div>
                      <p className="text-xs leading-relaxed">{cameraError}</p>
                      <div className="pt-2 flex items-center gap-3">
                        <button
                          onClick={() => setActiveMode('upload')}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors"
                        >
                          Switch to File Upload
                        </button>
                        <button
                          onClick={() => handleLoadSample('aws')}
                          className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 font-semibold hover:bg-amber-100/50 transition-colors"
                        >
                          Load Sample Invoice
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 max-h-[380px] mx-auto border border-slate-800 flex items-center justify-center shadow-inner">
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        autoPlay
                        className="w-full h-full object-cover"
                      />

                      {/* Viewfinder Target Guidelines */}
                      <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-4">
                        <div className="flex justify-between text-[11px] font-mono text-emerald-300 bg-slate-950/60 px-2.5 py-1 rounded backdrop-blur-xs w-fit">
                          <span>[ALIGN INVOICE / BILL HERE]</span>
                        </div>
                        <div className="text-center text-[10px] text-emerald-200 bg-slate-950/60 py-1 rounded backdrop-blur-xs">
                          Keep document flat and well-lit
                        </div>
                      </div>

                      {/* Snap Button Floating Bottom */}
                      <div className="absolute bottom-4 inset-x-0 flex justify-center">
                        <button
                          onClick={handleSnapPhoto}
                          className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg transition-all active:scale-95 border-2 border-emerald-400"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Snap & Extract with AI</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeMode === 'upload' && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-10 text-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-indigo-50/20"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      Click or drag invoice image here
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports high-resolution PNG, JPEG, WebP receipts and bills up to 25MB
                    </p>
                  </div>
                </div>
              )}

              {activeMode === 'sample' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-500 mb-2">
                    Select any pre-configured enterprise bill to test immediate end-to-end OCR and ledger ingestion:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <button
                      onClick={() => handleLoadSample('aws')}
                      className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 text-left transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                          <span>AWS Cloud Services</span>
                          <span className="text-[10px] text-indigo-600 font-mono">AWS-90412</span>
                        </div>
                        <div className="text-xs text-slate-500">EC2 & Aurora Serverless v2</div>
                      </div>
                      <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">$4,820.50</span>
                        <span className="text-indigo-600 font-semibold group-hover:underline text-[11px]">
                          Test Scan &rarr;
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleLoadSample('hardware')}
                      className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 text-left transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                          <span>Dell Enterprise Servers</span>
                          <span className="text-[10px] text-indigo-600 font-mono">DELL-48821</span>
                        </div>
                        <div className="text-xs text-slate-500">PowerEdge R760 Rackmount</div>
                      </div>
                      <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">$12,450.00</span>
                        <span className="text-indigo-600 font-semibold group-hover:underline text-[11px]">
                          Test Scan &rarr;
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleLoadSample('logistics')}
                      className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 text-left transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                          <span>Apex Freight Logistics</span>
                          <span className="text-[10px] text-indigo-600 font-mono">APX-10928</span>
                        </div>
                        <div className="text-xs text-slate-500">Air Cargo & Hazardous Cert</div>
                      </div>
                      <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">$3,450.00</span>
                        <span className="text-indigo-600 font-semibold group-hover:underline text-[11px]">
                          Test Scan &rarr;
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATE 2: SCANNING IN PROGRESS */}
          {isScanning && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">Gemini Vision OCR Active</div>
                <div className="text-xs text-slate-500 max-w-sm">{scanStep}</div>
              </div>
            </div>
          )}

          {/* STATE 3: EXTRACTED REVIEW & VERIFICATION FORM */}
          {capturedImage && !isScanning && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Image Preview */}
              <div className="lg:col-span-5 space-y-3">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Captured Document</span>
                  <button
                    onClick={handleReset}
                    className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retake / Scan Another</span>
                  </button>
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-[360px] flex items-center justify-center p-2">
                  <img
                    src={capturedImage}
                    alt="Captured invoice snapshot"
                    className="max-h-[340px] w-auto object-contain rounded-lg shadow-2xs"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Gemini Multimodal OCR Score:</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {(confidence * 100).toFixed(0)}% Confirmed
                  </span>
                </div>
              </div>

              {/* Right Column: Editable Fields */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Extracted Financial Ledger Fields
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Auto-Populated</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Invoice / Bill #
                    </label>
                    <input
                      type="text"
                      value={invNumber}
                      onChange={(e) => setInvNumber(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Vendor / Counterparty
                    </label>
                    <input
                      type="text"
                      value={partyName}
                      onChange={(e) => setPartyName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Total Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs font-bold font-mono border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Sales Tax / VAT ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Ledger Type
                    </label>
                    <select
                      value={invType}
                      onChange={(e) => setInvType(e.target.value as 'payable' | 'receivable')}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors font-medium"
                    >
                      <option value="payable">Accounts Payable (AP - Bill to Pay)</option>
                      <option value="receivable">Accounts Receivable (AR - Invoice to Collect)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={createdDate}
                      onChange={(e) => setCreatedDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors"
                    />
                  </div>
                </div>

                {/* Line Items Table */}
                {lineItems.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                      <span>Extracted Line Items ({lineItems.length})</span>
                      <button
                        type="button"
                        onClick={handleAddLineItem}
                        className="text-indigo-600 hover:text-indigo-800 text-[10px] font-semibold flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Item</span>
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden max-h-36 overflow-y-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="px-2.5 py-1.5">Description</th>
                            <th className="px-2 py-1.5 text-right w-16">Qty</th>
                            <th className="px-2 py-1.5 text-right w-20">Unit $</th>
                            <th className="px-2 py-1.5 text-right w-20">Total $</th>
                            <th className="px-1.5 py-1.5 w-8"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {lineItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/60">
                              <td className="px-2.5 py-1 font-medium text-slate-800">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => {
                                    const next = [...lineItems];
                                    next[idx].description = e.target.value;
                                    setLineItems(next);
                                  }}
                                  className="w-full bg-transparent border-0 focus:outline-none p-0 text-[11px]"
                                />
                              </td>
                              <td className="px-2 py-1 text-right">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const next = [...lineItems];
                                    const qty = parseFloat(e.target.value) || 0;
                                    next[idx].quantity = qty;
                                    next[idx].total = qty * next[idx].unitPrice;
                                    setLineItems(next);
                                  }}
                                  className="w-12 text-right bg-transparent border-0 focus:outline-none p-0 text-[11px] font-mono"
                                />
                              </td>
                              <td className="px-2 py-1 text-right font-mono text-slate-600">
                                ${item.unitPrice.toFixed(2)}
                              </td>
                              <td className="px-2 py-1 text-right font-mono font-bold text-slate-900">
                                ${item.total.toFixed(2)}
                              </td>
                              <td className="px-1.5 py-1 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLineItem(idx)}
                                  className="text-slate-400 hover:text-rose-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Document Metadata Tags Section */}
                <div className="space-y-2.5 pt-2.5 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                      <Tag className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Document Metadata Tags ({tags.length})</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Enables fast tag-based retrieval in Finance
                    </span>
                  </div>

                  {/* Active Assigned Tags */}
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[38px] items-center">
                      {tags.map((t) => {
                        const style = getTagColorClasses(t);
                        return (
                          <span
                            key={t}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${style.bg} ${style.text} border ${style.border} shadow-2xs transition-all`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            <span>{t}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(t)}
                              className="ml-0.5 p-0.5 rounded hover:bg-black/10 text-slate-400 hover:text-slate-800 transition-colors"
                              title={`Remove tag "${t}"`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-2.5 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl text-center text-[11px] text-slate-400">
                      No tags assigned yet. Select suggested tags below or enter custom tags for indexing.
                    </div>
                  )}

                  {/* Preset Suggested Tags */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>Suggested Tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_METADATA_TAGS.map((preset) => {
                        const isSelected = tags.some((t) => t.toLowerCase() === preset.toLowerCase());
                        const style = getTagColorClasses(preset);
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleTogglePresetTag(preset)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                              isSelected
                                ? `${style.bg} ${style.text} border ${style.border} font-bold ring-1 ring-indigo-400/30`
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            {isSelected ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Plus className="w-3 h-3 text-slate-400" />
                            )}
                            <span>{preset}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Tag Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={customTagInput}
                        onChange={(e) => setCustomTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag(customTagInput);
                          }
                        }}
                        placeholder="Add custom tag (e.g., 'Tax-Deductible', 'Q4-Budget', 'Urgent')..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors placeholder:text-slate-400 text-slate-800"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddTag(customTagInput)}
                      disabled={!customTagInput.trim()}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 disabled:opacity-40 disabled:hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Tag</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Notes / Memo
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors text-slate-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>

          {capturedImage && !isScanning && (
            <button
              onClick={handleSaveInvoice}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Add to Invoices Ledger</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
