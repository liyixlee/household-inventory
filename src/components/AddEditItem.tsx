import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import {
  Package,
  ArrowLeft,
  Save,
  AlertTriangle,
  CheckCircle2,
  GitFork,
  Cpu,
  Layers,
  MapPin,
  Calendar,
  Layers3,
  HelpCircle,
  Barcode,
  Scan
} from 'lucide-react';
import { Category, StorageLocation, Unit, InventoryItem } from '../types';
import { BarcodeScannerModal } from './BarcodeScannerModal';

export const AddEditItem: React.FC = () => {
  const {
    items,
    editingItemId,
    addItem,
    updateItem,
    addBatchToItem,
    navigateTo,
    addToast
  } = useInventory();

  const isEditMode = Boolean(editingItemId);
  const editingItem = items.find(i => i.id === editingItemId);

  // Form Fields State
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState<Category>('Pantry');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<Unit>('pcs');
  const [storageLocation, setStorageLocation] = useState<StorageLocation>('Pantry Shelf');
  const [hasExpiry, setHasExpiry] = useState<boolean>(true);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(2);
  const [notes, setNotes] = useState<string>('');

  // Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Validation Error State
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Duplicate Check Modal State
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateMatch, setDuplicateMatch] = useState<InventoryItem | null>(null);

  const categories: Category[] = [
    'Pantry',
    'Fridge',
    'Freezer',
    'Beverages',
    'Household',
    'Personal Care',
    'Medicine',
    'Cleaning',
    'Other'
  ];

  const locations: StorageLocation[] = [
    'Pantry Shelf',
    'Refrigerator',
    'Freezer',
    'Medicine Cabinet',
    'Cleaning Closet',
    'Bathroom Shelf',
    'Countertop',
    'Garage Storage'
  ];

  const units: Unit[] = ['pcs', 'pack', 'box', 'can', 'bottle', 'kg', 'g', 'L', 'ml', 'carton', 'bag'];

  // Populate form if in Edit mode or if pending barcode scan from quick action
  useEffect(() => {
    if (isEditMode && editingItem) {
      setName(editingItem.name);
      setBarcode(editingItem.barcode || '');
      setCategory(editingItem.category);
      setUnit(editingItem.unit);
      setStorageLocation(editingItem.storageLocation);
      setHasExpiry(editingItem.hasExpiry);
      setLowStockThreshold(editingItem.lowStockThreshold);
      setNotes(editingItem.notes || '');

      // Get initial qty from total batches
      const total = editingItem.batches.reduce((sum, b) => sum + b.quantity, 0);
      setQuantity(total);

      if (editingItem.batches.length > 0 && editingItem.batches[0].expiryDate) {
        setExpiryDate(editingItem.batches[0].expiryDate);
      }
    } else {
      // Check if navigated with a scanned barcode
      const pending = localStorage.getItem('pending_barcode_scan');
      if (pending) {
        try {
          const parsed = JSON.parse(pending);
          if (parsed.barcode) setBarcode(parsed.barcode);
          if (parsed.name) setName(parsed.name);
          addToast('blue', 'User Action', `Pre-filled scanned barcode ${parsed.barcode}`);
        } catch (e) {}
        localStorage.removeItem('pending_barcode_scan');
      }
    }
  }, [editingItemId, isEditMode, editingItem]);

  // Handle Barcode Scan Callback
  const handleBarcodeScanned = (scannedCode: string) => {
    setBarcode(scannedCode);
    addToast('blue', 'User Action', `Scanned barcode: ${scannedCode}`);

    // Check if another item already uses this barcode
    const matchByBarcode = items.find(
      i => i.id !== editingItemId && i.barcode && i.barcode.trim() === scannedCode.trim()
    );
    if (matchByBarcode) {
      addToast(
        'amber',
        'Decision Point',
        `Note: Barcode ${scannedCode} is already assigned to "${matchByBarcode.name}".`
      );
    }
  };

  // Validation check function
  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Item name is required.';
    }

    if (quantity < 0 || isNaN(quantity)) {
      errs.quantity = 'Quantity must be 0 or greater.';
    }

    if (lowStockThreshold < 0 || isNaN(lowStockThreshold)) {
      errs.lowStockThreshold = 'Low-stock threshold must be 0 or greater.';
    }

    if (hasExpiry && !expiryDate && !isEditMode) {
      errs.expiryDate = 'Expiry date is required when expiry tracking is enabled.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast('red', 'Validation Error', 'Please fix inline errors before saving.');
      return;
    }

    if (isEditMode && editingItemId) {
      // Update existing item metadata
      updateItem(editingItemId, {
        name: name.trim(),
        barcode: barcode.trim() || undefined,
        category,
        unit,
        storageLocation,
        hasExpiry,
        lowStockThreshold,
        notes
      });
      navigateTo('item_details', editingItemId);
      return;
    }

    // Step 2: System duplicate check
    const normalizedName = name.trim().toLowerCase();
    const existing = items.find(i => i.name.trim().toLowerCase() === normalizedName);

    if (existing) {
      setDuplicateMatch(existing);
      setDuplicateModalOpen(true);
      return;
    }

    // Save as new item
    const result = addItem(
      {
        name: name.trim(),
        barcode: barcode.trim() || undefined,
        category,
        unit,
        storageLocation,
        hasExpiry,
        lowStockThreshold,
        notes
      },
      {
        quantity,
        expiryDate: hasExpiry ? expiryDate : undefined
      }
    );

    if (result.success && result.itemId) {
      navigateTo('inventory');
    }
  };

  // Duplicate Choice Handler: New Batch vs Update Existing
  const handleDuplicateChoice = (choice: 'new_batch' | 'update_existing') => {
    if (!duplicateMatch) return;

    if (choice === 'new_batch') {
      addBatchToItem(duplicateMatch.id, {
        quantity,
        expiryDate: hasExpiry ? expiryDate : undefined,
        notes: notes ? `New Batch: ${notes}` : 'Added as new batch'
      });
      setDuplicateModalOpen(false);
      navigateTo('item_details', duplicateMatch.id);
    } else {
      setDuplicateModalOpen(false);
      navigateTo('item_details', duplicateMatch.id);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white">
        <button
          onClick={() => navigateTo('inventory')}
          className="flex items-center space-x-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>Cancel & Back</span>
        </button>

        <h2 className="text-lg font-extrabold flex items-center space-x-2">
          <Package className="w-5 h-5 text-blue-400" />
          <span>{isEditMode ? 'Edit Item Details' : 'Add New Inventory Item'}</span>
        </h2>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6 shadow-xl">
        {/* Step 1: Item Name (with auto duplicate check) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
            Step 1: Item Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => {
              setName(e.target.value);
              if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
            }}
            placeholder="e.g. Organic Whole Milk, Canned Tomatoes, Ibuprofen"
            className={`w-full px-4 py-2.5 bg-slate-950 border rounded-xl text-sm font-semibold text-white focus:outline-none ${
              errors.name ? 'border-red-500 ring-2 ring-red-500/30' : 'border-slate-700 focus:ring-2 focus:ring-blue-500'
            }`}
          />
          {errors.name && (
            <p className="text-xs text-red-400 font-bold mt-1.5 flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{errors.name}</span>
            </p>
          )}

          <div className="mt-2 p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/40 text-purple-200 text-xs flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              <strong>Purple = System Action:</strong> System automatically checks if item already exists and prompts duplicate resolution.
            </span>
          </div>
        </div>

        {/* Step 2: Barcode (UPC / EAN) with Camera Scan Button */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Barcode className="w-4 h-4 text-blue-400" />
              <span>Barcode / UPC / EAN (Optional)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">Scannable SKU</span>
          </label>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              placeholder="e.g. 012000001291"
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md border border-blue-400 flex items-center space-x-1.5 transition-all active:scale-95 shrink-0"
              title="Open camera or photo scanner"
            >
              <Scan className="w-4 h-4" />
              <span>Scan Barcode</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Scan or type barcode to enable instant lookup & check-in from the header scanner!
          </p>
        </div>

        {/* Step 3: Category & Unit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as Category)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Unit of Measure <span className="text-red-400">*</span>
            </label>
            <select
              value={unit}
              onChange={e => setUnit(e.target.value as Unit)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {units.map(u => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 4 & 5: Quantity & Storage Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Quantity ({unit}) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={e => {
                setQuantity(Number(e.target.value));
                if (errors.quantity) setErrors(prev => ({ ...prev, quantity: '' }));
              }}
              className={`w-full px-4 py-2.5 bg-slate-950 border rounded-xl text-sm font-bold text-white focus:outline-none ${
                errors.quantity ? 'border-red-500' : 'border-slate-700 focus:ring-2 focus:ring-blue-500'
              }`}
            />
            {errors.quantity && <p className="text-xs text-red-400 mt-1">{errors.quantity}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Storage Location <span className="text-red-400">*</span>
            </label>
            <select
              value={storageLocation}
              onChange={e => setStorageLocation(e.target.value as StorageLocation)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {locations.map(l => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 6: Decision "Does it expire?" */}
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GitFork className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-amber-200 uppercase tracking-wider block">
                  Amber Decision Point: Does this item expire?
                </span>
                <span className="text-[11px] text-amber-300/80">
                  Select whether to track expiry dates & generate expiry alerts.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setHasExpiry(!hasExpiry)}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                hasExpiry
                  ? 'bg-amber-500 text-slate-950 border border-amber-300 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {hasExpiry ? 'YES (Expires)' : 'NO (No Expiry)'}
            </button>
          </div>

          {hasExpiry && !isEditMode && (
            <div className="pt-2 border-t border-amber-500/30">
              <label className="block text-xs font-bold text-amber-200 mb-1">
                Batch Expiry Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={e => {
                  setExpiryDate(e.target.value);
                  if (errors.expiryDate) setErrors(prev => ({ ...prev, expiryDate: '' }));
                }}
                className={`w-full px-4 py-2 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none ${
                  errors.expiryDate ? 'border-red-500' : 'border-amber-500/50 focus:ring-2 focus:ring-amber-500'
                }`}
              />
              {errors.expiryDate && (
                <p className="text-xs text-red-400 font-bold mt-1 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{errors.expiryDate}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Step 7: Low Stock Threshold */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
            Low-Stock Warning Threshold ({unit}) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            min="0"
            value={lowStockThreshold}
            onChange={e => {
              setLowStockThreshold(Number(e.target.value));
              if (errors.lowStockThreshold) setErrors(prev => ({ ...prev, lowStockThreshold: '' }));
            }}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            When total quantity drops to or below this threshold, a low-stock alert will trigger automatically.
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
            Notes / Details (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Preferred brand, shelf location, special usage notes"
            className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigateTo('inventory')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Cancel
          </button>

          {/* Blue User Action: Save Button */}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md border border-blue-400 transition-all flex items-center space-x-2 active:scale-95"
            title="User Action: Save item to inventory"
          >
            <Save className="w-4 h-4" />
            <span>{isEditMode ? 'Update Item Details' : 'Save New Item'}</span>
          </button>
        </div>
      </form>

      {/* AMBER DECISION MODAL: DUPLICATE ITEM CHECK */}
      {duplicateModalOpen && duplicateMatch && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center space-x-3 text-amber-400 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
                <GitFork className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Amber Decision Point
                </span>
                <h3 className="text-lg font-black text-white">Item Already Exists!</h3>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              An item named <strong className="text-white">"{duplicateMatch.name}"</strong> already exists in your inventory with total quantity <strong className="text-amber-400">{duplicateMatch.batches.reduce((s, b) => s + b.quantity, 0)} {duplicateMatch.unit}</strong>.
            </div>

            <p className="text-xs text-slate-200">
              How would you like to handle this addition?
            </p>

            <div className="space-y-3">
              {/* Choice A: Add as new batch */}
              <button
                type="button"
                onClick={() => handleDuplicateChoice('new_batch')}
                className="w-full p-4 rounded-xl bg-amber-950/40 hover:bg-amber-950 border border-amber-500 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-amber-200 group-hover:text-amber-100">
                    Option A: Add as New Expiry Batch
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-bold">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-amber-300/80 mt-1">
                  Keeps as a separate batch entry ({quantity} {unit}, expiry: {expiryDate || 'None'}) under "{duplicateMatch.name}". Supports tracking multiple expiry dates!
                </p>
              </button>

              {/* Choice B: Go to Update Quantity */}
              <button
                type="button"
                onClick={() => handleDuplicateChoice('update_existing')}
                className="w-full p-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-left transition-all group"
              >
                <div className="font-bold text-sm text-slate-200 group-hover:text-white">
                  Option B: View & Edit Existing Item Quantity
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Navigates directly to "{duplicateMatch.name}" details view to adjust total quantity manually.
                </p>
              </button>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setDuplicateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScanned}
        title="Scan Item Barcode"
        subtitle="Point camera at product barcode to auto-fill barcode field"
      />
    </div>
  );
};
