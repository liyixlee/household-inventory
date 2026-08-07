import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { InventoryItem } from '../types';
import { getItemTotalQuantity, getItemStatus } from '../utils/inventoryUtils';
import {
  Barcode,
  Package,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  X,
  MapPin,
  Calendar,
  Layers,
  PlusCircle,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface QuickBarcodeScanModalProps {
  isOpen: boolean;
  scannedCode: string | null;
  onClose: () => void;
  onRescan: () => void;
}

interface OpenFoodFactsProduct {
  product_name?: string;
  brands?: string;
  categories?: string;
  quantity?: string;
}

export const QuickBarcodeScanModal: React.FC<QuickBarcodeScanModalProps> = ({
  isOpen,
  scannedCode,
  onClose,
  onRescan
}) => {
  const {
    items,
    updateItemQuantity,
    addToShoppingList,
    navigateTo,
    openEditItem,
    addToast,
    expiryWarningDays
  } = useInventory();

  const [externalProduct, setExternalProduct] = useState<OpenFoodFactsProduct | null>(null);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);

  // Search local inventory for matching item
  const matchedItem: InventoryItem | undefined = scannedCode
    ? items.find(
        i =>
          (i.barcode && i.barcode.trim() === scannedCode.trim()) ||
          i.name.toLowerCase().includes(scannedCode.toLowerCase())
      )
    : undefined;

  // Fetch Open Food Facts info if not matched in local inventory
  useEffect(() => {
    if (isOpen && scannedCode && !matchedItem) {
      setIsLoadingExternal(true);
      setExternalProduct(null);

      fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(scannedCode)}.json`)
        ? fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(scannedCode)}.json`)
            .then(res => res.json())
            .then(data => {
              setIsLoadingExternal(false);
              if (data.status === 1 && data.product) {
                setExternalProduct({
                  product_name: data.product.product_name || data.product.product_name_en,
                  brands: data.product.brands,
                  categories: data.product.categories,
                  quantity: data.product.quantity
                });
              }
            })
            .catch(() => {
              setIsLoadingExternal(false);
            })
        : setIsLoadingExternal(false);
    }
  }, [isOpen, scannedCode, matchedItem]);

  if (!isOpen || !scannedCode) return null;

  const currentTotal = matchedItem ? getItemTotalQuantity(matchedItem) : 0;
  const stockStatus = matchedItem ? getItemStatus(matchedItem, expiryWarningDays) : 'out_of_stock';

  const handleQuickAddQty = () => {
    if (!matchedItem) return;
    updateItemQuantity(matchedItem.id, currentTotal + 1);
    addToast('green', 'Success Action', `Increased stock of "${matchedItem.name}" to ${currentTotal + 1}.`);
  };

  const handleQuickSubQty = () => {
    if (!matchedItem || currentTotal <= 0) return;
    updateItemQuantity(matchedItem.id, currentTotal - 1);
    addToast('amber', 'User Action', `Decreased stock of "${matchedItem.name}" to ${currentTotal - 1}.`);
  };

  const handleAddToShopping = () => {
    if (!matchedItem) return;
    addToShoppingList({
      itemId: matchedItem.id,
      name: matchedItem.name,
      category: matchedItem.category,
      quantityNeeded: Math.max(1, matchedItem.lowStockThreshold || 1),
      unit: matchedItem.unit,
      targetStorageLocation: matchedItem.storageLocation,
      notes: 'Added via quick barcode scan action'
    });
  };

  const handleCreateNewItemWithBarcode = () => {
    onClose();
    // Navigate to add item with prefilled barcode (and optional product name)
    navigateTo('add_edit_item');
    // Save draft barcode in localStorage so AddEditItem can consume it
    localStorage.setItem(
      'pending_barcode_scan',
      JSON.stringify({
        barcode: scannedCode,
        name: externalProduct?.product_name || (externalProduct?.brands ? `${externalProduct.brands} Product` : '')
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
      <div className="bg-slate-900 border-2 border-blue-500/80 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                Barcode Scan Result
              </span>
              <h3 className="text-base font-extrabold text-white font-mono flex items-center space-x-2">
                <span>Code:</span>
                <span className="text-blue-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {scannedCode}
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MATCHED ITEM CASE */}
        {matchedItem ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-800 text-slate-300">
                    {matchedItem.category}
                  </span>
                  <h4 className="text-lg font-black text-white mt-1">{matchedItem.name}</h4>
                </div>

                {stockStatus === 'in_stock' && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold">
                    In Stock ({currentTotal} {matchedItem.unit})
                  </span>
                )}
                {stockStatus === 'low_stock' && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-bold">
                    Low Stock ({currentTotal} {matchedItem.unit})
                  </span>
                )}
                {(stockStatus === 'out_of_stock' || stockStatus === 'expired') && (
                  <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
                    {stockStatus === 'expired' ? 'Expired' : 'Out of Stock'} ({currentTotal} {matchedItem.unit})
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>{matchedItem.storageLocation}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>{matchedItem.batches.length} Batch(es)</span>
                </span>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Quick Actions for Scanned Item:
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleQuickAddQty}
                  className="p-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-200 font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>+1 Check-In Stock</span>
                </button>

                <button
                  onClick={handleQuickSubQty}
                  disabled={currentTotal <= 0}
                  className="p-3 rounded-xl bg-amber-950/60 hover:bg-amber-900 disabled:opacity-40 border border-amber-500/60 text-amber-200 font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <Minus className="w-4 h-4 text-amber-400" />
                  <span>-1 Consume Stock</span>
                </button>

                <button
                  onClick={handleAddToShopping}
                  className="p-3 rounded-xl bg-blue-950/60 hover:bg-blue-900 border border-blue-500/60 text-blue-200 font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4 text-blue-400" />
                  <span>Add to Shopping List</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    navigateTo('item_details', matchedItem.id);
                  }}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-2 transition-all"
                >
                  <Package className="w-4 h-4 text-slate-400" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* UNMATCHED BARCODE CASE */
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/50 text-amber-200 text-xs space-y-2">
              <div className="flex items-center space-x-2 font-bold text-sm text-amber-300">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Barcode Not in Local Inventory</span>
              </div>
              <p>No item currently in your household inventory matches this barcode.</p>
            </div>

            {/* External Product Lookup Info */}
            {isLoadingExternal ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span>Looking up commercial product databases...</span>
              </div>
            ) : externalProduct?.product_name ? (
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/40 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 text-blue-300 font-bold">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Detected Commercial Product Details:</span>
                </div>
                <div className="text-white text-sm font-bold">{externalProduct.product_name}</div>
                {externalProduct.brands && (
                  <div className="text-slate-300 text-[11px]">Brand: {externalProduct.brands}</div>
                )}
              </div>
            ) : null}

            <button
              onClick={handleCreateNewItemWithBarcode}
              className="w-full p-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md border border-blue-400 transition-all flex items-center justify-between group active:scale-95"
            >
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-white" />
                <div className="text-left">
                  <div className="font-extrabold text-sm">Add New Item with this Barcode</div>
                  <div className="text-[11px] text-blue-200 font-normal">
                    Pre-fills barcode {scannedCode} in new item setup
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onRescan();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center space-x-1.5"
          >
            <Barcode className="w-4 h-4 text-blue-400" />
            <span>Scan Another Barcode</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
