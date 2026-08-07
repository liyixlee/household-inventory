import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import {
  Package,
  ArrowLeft,
  Edit3,
  Trash2,
  PlusCircle,
  ShoppingCart,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  X,
  Layers,
  Sparkles,
  GitFork,
  Barcode
} from 'lucide-react';
import {
  getItemTotalQuantity,
  getItemStatus,
  formatDate,
  getDaysUntilExpiry,
  getTodayString
} from '../utils/inventoryUtils';

export const ItemDetails: React.FC = () => {
  const {
    selectedItemId,
    items,
    navigateTo,
    openEditItem,
    updateItemQuantity,
    addBatchToItem,
    deleteBatch,
    deleteItem,
    addToShoppingList,
    expiryWarningDays
  } = useInventory();

  const item = items.find(i => i.id === selectedItemId);

  // Modal State for Edit Quantity
  const [isEditQtyModalOpen, setIsEditQtyModalOpen] = useState(false);
  const [newTotalQtyInput, setNewTotalQtyInput] = useState<number>(0);

  // Modal State for Adding New Batch
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [batchQtyInput, setBatchQtyInput] = useState<number>(1);
  const [batchExpiryInput, setBatchExpiryInput] = useState<string>('');
  const [batchNotesInput, setBatchNotesInput] = useState<string>('');

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!item) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-white">
        <Package className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">No Item Selected</h3>
        <p className="text-xs text-slate-400 mt-1">Please select an item from the Inventory List.</p>
        <button
          onClick={() => navigateTo('inventory')}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
        >
          Return to Inventory List
        </button>
      </div>
    );
  }

  const totalQty = getItemTotalQuantity(item);
  const status = getItemStatus(item, expiryWarningDays);

  const handleOpenEditQty = () => {
    setNewTotalQtyInput(totalQty);
    setIsEditQtyModalOpen(true);
  };

  const handleSaveQty = () => {
    updateItemQuantity(item.id, Number(newTotalQtyInput));
    setIsEditQtyModalOpen(false);
  };

  const handleOpenAddBatch = () => {
    setBatchQtyInput(1);
    setBatchExpiryInput('');
    setBatchNotesInput('');
    setIsAddBatchModalOpen(true);
  };

  const handleSaveNewBatch = () => {
    addBatchToItem(item.id, {
      quantity: Number(batchQtyInput),
      expiryDate: item.hasExpiry ? batchExpiryInput : undefined,
      notes: batchNotesInput
    });
    setIsAddBatchModalOpen(false);
  };

  const handleAddToShopping = () => {
    addToShoppingList({
      itemId: item.id,
      name: item.name,
      category: item.category,
      quantityNeeded: Math.max(1, item.lowStockThreshold || 1),
      unit: item.unit,
      isPriority: totalQty === 0,
      targetStorageLocation: item.storageLocation,
      notes: 'Added from Item Details view'
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Back Button & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <button
          onClick={() => navigateTo('inventory')}
          className="flex items-center space-x-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>Back to Inventory List</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Blue User Action: Add to Shopping List */}
          <button
            onClick={handleAddToShopping}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md border border-blue-400 transition-all active:scale-95"
            title="User Action: Add item to shopping list"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Shopping List</span>
          </button>

          {/* Blue User Action: Edit Item */}
          <button
            onClick={() => openEditItem(item.id)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
            title="User Action: Edit item specs"
          >
            <Edit3 className="w-4 h-4 text-blue-400" />
            <span>Edit Item</span>
          </button>

          {/* Red Action: Delete Item */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 text-xs font-bold border border-red-800 transition-all"
            title="Red Action: Delete item"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Item Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
                {item.category}
              </span>

              {status === 'out_of_stock' && (
                <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-xs font-bold shadow-xs">
                  Out of Stock
                </span>
              )}
              {status === 'expired' && (
                <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-xs font-bold shadow-xs">
                  Expired
                </span>
              )}
              {status === 'low_stock' && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-bold shadow-xs">
                  Low Stock
                </span>
              )}
              {status === 'expiring_soon' && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-bold shadow-xs">
                  Expiring Soon
                </span>
              )}
              {status === 'in_stock' && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
                  In Stock
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{item.name}</h1>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
              <span className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Storage Location: <strong className="text-slate-200">{item.storageLocation}</strong></span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Expiry Tracking: <strong className="text-slate-200">{item.hasExpiry ? 'Enabled' : 'Disabled'}</strong></span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Barcode className="w-4 h-4 text-blue-400" />
                <span>Barcode: <strong className="text-slate-200 font-mono">{item.barcode || 'None attached'}</strong></span>
              </span>
            </div>

            {item.notes && (
              <p className="text-xs text-slate-300 mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 max-w-xl">
                Note: {item.notes}
              </p>
            )}
          </div>

          {/* Big Quantity Widget & Edit Qty Button */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col items-center justify-center min-w-[220px] text-center shadow-inner shrink-0">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Total Quantity
            </span>
            <div className="text-4xl font-black text-white my-1">
              {totalQty}{' '}
              <span className="text-sm font-normal text-slate-400">{item.unit}</span>
            </div>
            <div className="text-xs text-slate-400 font-mono mb-3">
              Low Threshold: {item.lowStockThreshold} {item.unit}
            </div>

            <button
              onClick={handleOpenEditQty}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md border border-blue-400 transition-all active:scale-95 flex items-center justify-center space-x-1.5"
              title="Blue User Action: Adjust quantity directly"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Quantity</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expiry Batches Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <span>Inventory Batches ({item.batches.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Supports multiple batches with separate expiry dates & quantities
            </p>
          </div>

          <button
            onClick={handleOpenAddBatch}
            className="flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md border border-blue-400 transition-all shrink-0"
            title="User Action: Add new expiry batch"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Batch</span>
          </button>
        </div>

        {/* Batches Table / Cards */}
        <div className="mt-4 space-y-3">
          {item.batches.length === 0 ? (
            <div className="text-center py-8 bg-slate-950 rounded-xl border border-dashed border-slate-800 text-slate-400 text-xs">
              No active batches. Click "Add New Batch" to add stock with expiry date.
            </div>
          ) : (
            item.batches.map((batch, index) => {
              const daysLeft = batch.expiryDate ? getDaysUntilExpiry(batch.expiryDate) : null;
              let batchBadge = null;

              if (daysLeft !== null) {
                if (daysLeft < 0) {
                  batchBadge = (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                      Expired ({Math.abs(daysLeft)}d ago)
                    </span>
                  );
                } else if (daysLeft <= expiryWarningDays) {
                  batchBadge = (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                      Expiring in {daysLeft === 0 ? 'Today' : `${daysLeft} days`}
                    </span>
                  );
                } else {
                  batchBadge = (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                      Good ({daysLeft}d left)
                    </span>
                  );
                }
              }

              return (
                <div
                  key={batch.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-blue-400 font-mono">
                        Batch #{index + 1}
                      </span>
                      {batchBadge}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-slate-300">
                      <span>
                        Quantity:{' '}
                        <strong className="text-white">
                          {batch.quantity} {item.unit}
                        </strong>
                      </span>

                      {item.hasExpiry && (
                        <span>
                          Expiry Date:{' '}
                          <strong className="text-white">
                            {formatDate(batch.expiryDate)}
                          </strong>
                        </span>
                      )}

                      <span className="text-slate-500">
                        Added: {formatDate(batch.addedDate)}
                      </span>
                    </div>

                    {batch.notes && (
                      <div className="text-[11px] text-slate-400 italic">
                        Notes: {batch.notes}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteBatch(item.id, batch.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900 transition-colors shrink-0 self-end sm:self-center"
                    title="Delete this batch"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* EDIT QUANTITY MODAL */}
      {isEditQtyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <span>Edit Quantity: {item.name}</span>
              </h3>
              <button
                onClick={() => setIsEditQtyModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Enter the new total quantity. System will automatically re-evaluate low-stock thresholds and update stock alerts.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">
                New Total Quantity ({item.unit})
              </label>
              <input
                type="number"
                min="0"
                value={newTotalQtyInput}
                onChange={e => setNewTotalQtyInput(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/50 text-purple-200 text-xs">
              <span className="font-bold">Purple = System Action:</span> On save, system rechecks low-stock threshold ({item.lowStockThreshold} {item.unit}) and triggers alerts if required.
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsEditQtyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveQty}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md border border-blue-400 flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Quantity</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD BATCH MODAL */}
      {isAddBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-blue-400" />
                <span>Add Expiry Batch: {item.name}</span>
              </h3>
              <button
                onClick={() => setIsAddBatchModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">
                  Batch Quantity ({item.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={batchQtyInput}
                  onChange={e => setBatchQtyInput(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                />
              </div>

              {item.hasExpiry && (
                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={batchExpiryInput}
                    onChange={e => setBatchExpiryInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-300">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={batchNotesInput}
                  onChange={e => setBatchNotesInput(e.target.value)}
                  placeholder="e.g. Bought at Costco, top shelf"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsAddBatchModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveNewBatch}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md border border-blue-400 flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Batch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-extrabold text-lg">Delete Item?</h3>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete <strong className="text-white">"{item.name}"</strong>? This will also remove all associated expiry batches and alerts.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  deleteItem(item.id);
                  setShowDeleteConfirm(false);
                  navigateTo('inventory');
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md border border-red-400"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
