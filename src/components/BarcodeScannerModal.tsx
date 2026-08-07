import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  Camera,
  X,
  Upload,
  Keyboard,
  RefreshCw,
  AlertCircle,
  Scan,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
  subtitle?: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'Scan Item Barcode',
  subtitle = 'Point camera at any product barcode, upload an image, or type code manually'
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [manualCode, setManualCode] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'barcode-scanner-video-element';

  // Sample quick test barcodes for demonstration
  const sampleBarcodes = [
    { code: '012000001291', name: 'Whole Milk 2%' },
    { code: '041220001004', name: 'Large Brown Eggs' },
    { code: '078742351829', name: 'Crushed Tomatoes' },
    { code: '037000123456', name: 'Olive Oil' },
    { code: '030573016420', name: 'Ibuprofen' }
  ];

  // Stop scanner safely
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Scanner cleanup:', err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  // Start Camera Scanning
  const startCamera = async (cameraId?: string) => {
    setCameraError(null);
    await stopScanner();

    try {
      // Get cameras list first if not fetched
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        const targetCamId = cameraId || devices[0].id;
        setSelectedCameraId(targetCamId);

        const html5Qrcode = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.QR_CODE
          ],
          verbose: false
        });

        scannerRef.current = html5Qrcode;

        await html5Qrcode.start(
          targetCamId,
          {
            fps: 10,
            qrbox: { width: 260, height: 160 },
            aspectRatio: 1.5
          },
          (decodedText) => {
            // On Success Scan
            handleSuccessfulScan(decodedText);
          },
          () => {
            // Ignore frame decode errors while searching
          }
        );

        setIsScanning(true);
      } else {
        setCameraError('No video input camera devices detected on this device.');
      }
    } catch (err: any) {
      console.error('Camera init error:', err);
      setCameraError(
        err?.message || 'Unable to access camera. Please check permissions or try uploading a photo / manual entry.'
      );
    }
  };

  const handleSuccessfulScan = async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;
    await stopScanner();
    onScan(cleanCode);
    onClose();
  };

  // Handle Image File Upload Barcode Scan
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setIsProcessingFile(true);

    try {
      const html5Qrcode = new Html5Qrcode('barcode-file-temp-element');
      const decodedResult = await html5Qrcode.scanFile(file, true);
      html5Qrcode.clear();
      setIsProcessingFile(false);
      handleSuccessfulScan(decodedResult);
    } catch (err) {
      setIsProcessingFile(false);
      setFileError('Could not detect a clear barcode in this image. Please try another photo or enter code manually.');
    }
  };

  // Switch camera tab lifecycle
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      // Delay slightly for modal DOM mount
      const timer = setTimeout(() => {
        startCamera();
      }, 200);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setManualCode('');
      setCameraError(null);
      setFileError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white leading-tight">{title}</h3>
              <p className="text-[11px] text-slate-400">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'camera'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
              activeTab === 'manual'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Manual Code</span>
          </button>
        </div>

        {/* Main Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-slate-200 text-xs">
          {/* CAMERA TAB */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              {cameras.length > 1 && (
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Select Camera:</span>
                  <select
                    value={selectedCameraId}
                    onChange={e => {
                      setSelectedCameraId(e.target.value);
                      startCamera(e.target.value);
                    }}
                    className="bg-slate-950 border border-slate-700 text-white text-xs px-2.5 py-1 rounded-lg"
                  >
                    {cameras.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.label || `Camera ${c.id.substring(0, 5)}...`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Video Scanner Container */}
              <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden min-h-[220px] flex items-center justify-center">
                <div id={scannerContainerId} className="w-full max-w-sm overflow-hidden" />

                {/* Laser Overlay Animation when scanning */}
                {isScanning && !cameraError && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-36 border-2 border-blue-400 rounded-lg relative shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_red] animate-pulse" />
                      <div className="absolute inset-x-0 bottom-2 text-center text-[10px] font-bold text-blue-300 bg-slate-950/70 py-0.5 px-2 rounded mx-auto w-fit">
                        Align barcode within frame
                      </div>
                    </div>
                  </div>
                )}

                {cameraError && (
                  <div className="p-6 text-center space-y-3">
                    <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                    <p className="text-amber-200 font-semibold">{cameraError}</p>
                    <p className="text-slate-400 text-[11px]">
                      You can use the <strong>Upload Photo</strong> or <strong>Manual Code</strong> tabs above instead!
                    </p>
                    <button
                      onClick={() => startCamera(selectedCameraId)}
                      className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs inline-flex items-center space-x-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Camera</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* UPLOAD PHOTO TAB */}
          {activeTab === 'upload' && (
            <div className="space-y-4 text-center py-4">
              <div id="barcode-file-temp-element" className="hidden" />

              <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-6 bg-slate-950/60 transition-colors">
                <Upload className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-white">Upload Barcode Photo</h4>
                <p className="text-slate-400 text-[11px] mt-1 mb-4">
                  Select or drop an image file (JPG, PNG, WEBP) containing a product barcode
                </p>

                <label className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs cursor-pointer shadow-md transition-all active:scale-95">
                  <Upload className="w-4 h-4" />
                  <span>Choose Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {isProcessingFile && (
                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-200 text-xs flex items-center justify-center space-x-2 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Scanning uploaded image for barcode...</span>
                </div>
              )}

              {fileError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center space-x-2 text-left">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}
            </div>
          )}

          {/* MANUAL CODE ENTRY TAB */}
          {activeTab === 'manual' && (
            <div className="space-y-4 py-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Enter Barcode / UPC / EAN Digits
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value)}
                    placeholder="e.g. 012000001291"
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl font-mono text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && manualCode.trim()) {
                        handleSuccessfulScan(manualCode);
                      }
                    }}
                  />
                  <button
                    onClick={() => manualCode.trim() && handleSuccessfulScan(manualCode)}
                    disabled={!manualCode.trim()}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-md border border-blue-400 transition-all flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Demo Test Barcodes */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-bold text-slate-300 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Quick Demo Test Barcodes:</span>
              </span>
              <span>Click to test scan</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {sampleBarcodes.map(b => (
                <button
                  key={b.code}
                  type="button"
                  onClick={() => handleSuccessfulScan(b.code)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-900/60 hover:border-blue-500 border border-slate-700 text-slate-200 text-[11px] font-mono transition-colors flex items-center space-x-1.5"
                  title={`Click to test scanning barcode for ${b.name}`}
                >
                  <span className="text-blue-400 font-bold">{b.name}:</span>
                  <span>{b.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-right">
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
