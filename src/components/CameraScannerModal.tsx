import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Camera,
  ScanLine,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Upload,
  Volume2,
  VolumeX,
  FlipHorizontal,
  MapPin,
  Plus,
  Minus,
  Sparkles,
  Search,
} from 'lucide-react';
import jsQR from 'jsqr';
import { InventoryItem, StockMovement } from '../types';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onAddStockMovement: (movement: Omit<StockMovement, 'id' | 'timestamp'>) => void;
  onSelectScannedItem: (item: InventoryItem) => void;
  onOpenAddNewSkuWithCode?: (skuCode: string) => void;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onAddStockMovement,
  onSelectScannedItem,
  onOpenAddNewSkuWithCode,
}) => {
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | 'unsupported'>('prompt');
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Scanned item state
  const [scannedRawCode, setScannedRawCode] = useState<string | null>(null);
  const [scannedItem, setScannedItem] = useState<InventoryItem | null>(null);
  const [scanActionSuccess, setScanActionSuccess] = useState<string | null>(null);

  // Quick adjustment in scanner
  const [quickAdjustmentQty, setQuickAdjustmentQty] = useState<number>(10);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synthesized audio feedback for authentic scanner experience
  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio context policy fallback
    }

    if (navigator.vibrate) {
      navigator.vibrate(80);
    }
  }, [soundEnabled]);

  // Stop video camera tracks
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  // Match scanned code against inventory
  const handleCodeDetected = useCallback(
    (codeText: string) => {
      const cleanCode = codeText.trim();
      setScannedRawCode(cleanCode);
      playBeep();

      let targetSku = cleanCode;

      // Check if payload is structured JSON from our QR generator
      try {
        const parsed = JSON.parse(cleanCode);
        if (parsed && typeof parsed === 'object') {
          if (parsed.sku) targetSku = String(parsed.sku).trim();
          else if (parsed.id) {
            const foundById = inventory.find((i) => i.id === parsed.id);
            if (foundById) {
              setScannedItem(foundById);
              setIsScanning(false);
              return;
            }
          }
        }
      } catch {
        // Raw string, continue to direct search
      }

      const match = inventory.find(
        (i) =>
          i.sku.toUpperCase() === targetSku.toUpperCase() ||
          i.id.toLowerCase() === targetSku.toLowerCase() ||
          i.name.toLowerCase() === targetSku.toLowerCase()
      );

      setScannedItem(match || null);
      setIsScanning(false);
    },
    [inventory, playBeep]
  );

  // Scan frame loop using canvas + jsQR
  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Run jsQR on frame
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleCodeDetected(code.data);
          return; // Stop animation loop once detected
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [handleCodeDetected]);

  // Start video camera stream
  const startCamera = useCallback(async () => {
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraPermission('unsupported');
      setCameraError('Camera access is not supported by your browser environment. You can use image upload or test simulations below.');
      return;
    }

    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraPermission('granted');
        setIsScanning(true);
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: unknown) {
      console.warn('Camera stream error:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('Permission') || errorMsg.includes('denied') || errorMsg.includes('NotAllowedError')) {
        setCameraPermission('denied');
        setCameraError('Camera access was declined or blocked by browser frame policy. Use the Image Upload or Demo Barcodes to test scanning.');
      } else {
        setCameraPermission('denied');
        setCameraError(`Unable to start camera feed: ${errorMsg}. You can upload a QR image or click a sample barcode.`);
      }
      setIsScanning(false);
    }
  }, [facingMode, scanFrame, stopCamera]);

  // Lifecycle when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setScannedRawCode(null);
      setScannedItem(null);
      setScanActionSuccess(null);
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Decode uploaded image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code && code.data) {
            handleCodeDetected(code.data);
          } else {
            setCameraError('No valid QR barcode found in the uploaded image. Please ensure the QR code is clearly visible and in focus.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Resume camera scanning for next item
  const handleScanAnother = () => {
    setScannedRawCode(null);
    setScannedItem(null);
    setScanActionSuccess(null);
    startCamera();
  };

  // Execute quick stock movement from scanner
  const handleExecuteQuickMovement = (type: 'inbound_receipt' | 'outbound_dispatch') => {
    if (!scannedItem) return;
    setIsProcessingAction(true);

    const qty = Math.max(1, quickAdjustmentQty);
    const refNum = `SCAN-${type === 'inbound_receipt' ? 'RCV' : 'DSP'}-${Math.floor(1000 + Math.random() * 9000)}`;

    onAddStockMovement({
      itemId: scannedItem.id,
      sku: scannedItem.sku,
      itemName: scannedItem.name,
      type,
      quantity: qty,
      origin: type === 'inbound_receipt' ? 'Dock / Supplier' : scannedItem.warehouseLocation,
      destination: type === 'inbound_receipt' ? scannedItem.warehouseLocation : 'Fulfillment Station',
      operator: 'Camera QR Scanner',
      referenceNumber: refNum,
    });

    const actionText =
      type === 'inbound_receipt'
        ? `Successfully received +${qty} units of ${scannedItem.sku} into ${scannedItem.warehouseLocation} (Ref: ${refNum})`
        : `Successfully dispatched -${qty} units of ${scannedItem.sku} for fulfillment (Ref: ${refNum})`;

    setScanActionSuccess(actionText);
    setIsProcessingAction(false);

    // Update the local view of the item
    setScannedItem((prev) => {
      if (!prev) return null;
      const delta = type === 'inbound_receipt' ? qty : -qty;
      const newStock = Math.max(0, prev.currentStock + delta);
      return {
        ...prev,
        currentStock: newStock,
        status: newStock <= prev.safetyStock ? 'critical' : newStock <= prev.reorderPoint ? 'low_stock' : 'optimal',
      };
    });
  };

  // Switch camera between front and back
  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 relative max-h-[92vh] overflow-y-auto my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Rapid Stock Scanner (Camera & QR)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                  Active Viewfinder
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Point device camera at any SKU QR barcode for instant stock audit, receipts, and dispatches.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-colors ${
                soundEnabled ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
              title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleToggleFacingMode}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
              title="Flip camera (Front / Back)"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* VIEW 1: Active Scanning Viewfinder */}
        {!scannedRawCode && (
          <div className="space-y-4 pt-4">
            {/* Viewfinder Canvas & Laser Animation */}
            <div className="relative w-full aspect-video sm:aspect-16/9 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Aiming Reticle Frame */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-56 h-56 border-2 border-indigo-500/80 rounded-2xl relative shadow-lg">
                  {/* Corner Accent Brackets */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg" />

                  {/* Animated Laser Scanning Beam */}
                  {isScanning && (
                    <div className="w-full h-0.5 bg-indigo-400 shadow-[0_0_12px_#818cf8] animate-pulse relative top-1/2 -translate-y-1/2" />
                  )}
                </div>
              </div>

              {/* Status Overlay */}
              <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-[11px] text-white font-medium border border-slate-700/80 flex items-center gap-1.5">
                  <ScanLine className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span>Align QR barcode within the reticle</span>
                </span>
              </div>
            </div>

            {/* Error or Permission Prompts */}
            {cameraError && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block">Camera Notice:</span>
                  <p className="mt-0.5 text-amber-800">{cameraError}</p>
                </div>
              </div>
            )}

            {/* Alternative Input Options: Upload Image or Quick Test Barcodes */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Alternative Capture & Rapid Test Modes</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-indigo-700 font-semibold border border-slate-200 shadow-2xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload QR Image</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div>
                <span className="text-slate-500 block mb-1.5">
                  One-click demo simulation (test scanner actions instantly without camera):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {inventory.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleCodeDetected(item.sku)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-700 text-[11px] font-mono border border-slate-200 transition-colors shadow-2xs"
                    >
                      {item.sku}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Scanned Item Detected & Action Center */}
        {scannedRawCode && (
          <div className="space-y-4 pt-4">
            {scannedItem ? (
              /* Item Found in Catalog */
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white border-2 border-indigo-500 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-xs font-bold">
                          {scannedItem.sku}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> SKU Recognized
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{scannedItem.name}</h3>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Current Stock</span>
                      <div className="text-xl font-bold font-mono text-slate-900">
                        {scannedItem.currentStock} <span className="text-xs font-normal text-slate-500">units</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-slate-500 text-[10px] block">Location</span>
                      <div className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{scannedItem.warehouseLocation}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-slate-500 text-[10px] block">Category</span>
                      <div className="font-semibold text-slate-900 mt-0.5">{scannedItem.category}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-slate-500 text-[10px] block">Reorder / Safety</span>
                      <div className="font-mono font-bold text-slate-900 mt-0.5">
                        {scannedItem.reorderPoint} / {scannedItem.safetyStock}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-slate-500 text-[10px] block">Unit Price / Cost</span>
                      <div className="font-mono font-bold text-slate-900 mt-0.5">
                        ${scannedItem.unitPrice.toFixed(2)} / ${scannedItem.unitCost.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Movement Action Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Rapid Stock Action Ledger
                      </h4>
                      <p className="text-xs text-slate-500">
                        Adjust physical count directly from the camera barcode terminal.
                      </p>
                    </div>

                    {/* Quantity Picker */}
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setQuickAdjustmentQty((q) => Math.max(1, q - 5))}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={quickAdjustmentQty}
                        onChange={(e) => setQuickAdjustmentQty(Math.max(1, Number(e.target.value)))}
                        className="w-14 text-center font-mono font-bold text-xs bg-transparent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuickAdjustmentQty((q) => q + 5)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      id="scanner-quick-receive-btn"
                      disabled={isProcessingAction}
                      onClick={() => handleExecuteQuickMovement('inbound_receipt')}
                      className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors text-xs"
                    >
                      <ArrowDownLeft className="w-4 h-4" />
                      <span>Receive Inbound (+{quickAdjustmentQty} Units)</span>
                    </button>

                    <button
                      type="button"
                      id="scanner-quick-dispatch-btn"
                      disabled={isProcessingAction || scannedItem.currentStock < quickAdjustmentQty}
                      onClick={() => handleExecuteQuickMovement('outbound_dispatch')}
                      className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors text-xs disabled:opacity-50"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Dispatch Outbound (-{quickAdjustmentQty} Units)</span>
                    </button>
                  </div>

                  {scanActionSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{scanActionSuccess}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectScannedItem(scannedItem);
                        onClose();
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Filter & Highlight in Inventory Catalog</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleScanAnother}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 shadow-2xs transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Scan Next Barcode</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Scanned Code NOT in catalog */
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-900">Unrecognized Barcode Detected</h3>
                  <div className="font-mono text-xs bg-white px-3 py-1.5 rounded-lg border border-amber-200 text-amber-950 inline-block mt-2">
                    {scannedRawCode}
                  </div>
                  <p className="text-xs text-amber-700 mt-2 max-w-md mx-auto">
                    This barcode is not currently registered in the central ERP inventory system. You can register it immediately as a new SKU item.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleScanAnother}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-amber-100/50 text-slate-700 text-xs font-semibold border border-amber-200 transition-colors"
                  >
                    Scan Another
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAddNewSkuWithCode) {
                        onOpenAddNewSkuWithCode(scannedRawCode);
                      }
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register as New SKU</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Camera feed processes locally via Web Crypto & ISO QR algorithms.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
