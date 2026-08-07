import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import {
  ShoppingCart,
  PlusCircle,
  CheckCircle2,
  Trash2,
  Star,
  GitFork,
  ArrowUpRight,
  Package,
  Calendar,
  Layers,
  MapPin,
  X,
  Check,
  RotateCcw
} from 'lucide-react';
import { Category, StorageLocation, Unit, ShoppingListItem } from '../types';
import { getTodayString, getFutureDateString } from '../utils/inventoryUtils';

export const ShoppingList: React.FC = () => {
  const {
    shoppingList,
    addToShoppingList,
    removeFromShoppingList,
    toggleShoppingItemPriority,
    updateShoppingItemQty,
    markShoppingItemPurchased,
    clearCompletedShoppingItems
  } = useInventory();

  // Manual Item Add State
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCategory, setManualCategory] = useState<Category>('Pantry');
  const [manualQty, setManualQty] = useState<number>(1);
  const [manualUnit, setManualUnit] = useState<Unit>('pcs');
  const [manualPriority, setManualPriority] = useState<boolean>(false);
  const [manualLocation, setManualLocation] = useState<StorageLocation>('Pantry Shelf');

  // Purchase Decision Modal State
  const [purchasingItem, setPurchasingItem] = useState<ShoppingListItem | null>(null);
  const [purchasedQtyInput, setPurchasedQtyInput] = useState<number>(1);
  const [purchasedExpiryInput, setPurchasedExpiryInput] = useState<string>('');
  const [enableExpiryDate, setEnableExpiryDate] = useState<boolean>(false);

  const activeItems = shoppingList.filter(s => !s.purchased);
  const completedItems = shoppingList.filter(s => s.purchased);

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

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    addToShoppingList({
      name: manualName.trim(),
      category: manualCategory,
      quantityNeeded: Math.max(1, manualQty),
      unit: manualUnit,
      isPriority: manualPriority,
      targetStorageLocation: manualLocation,
      notes: 'Added manually to shopping list'
    });

    setManualName('');
    setIsManualAddOpen(false);
  };

  const handleOpenPurchaseModal = (item: ShoppingListItem) => {
    setPurchasingItem(item);
    setPurchasedQtyInput(item.quantityNeeded);
    setPurchasedExpiryInput(getFutureDateString(30));
    setEnableExpiryDate(item.category === 'Fridge' || item.category === 'Pantry' || item.category === 'Medicine');
  };

  const handleExecutePurchase = (syncWithInventory: boolean) => {
    if (!purchasingItem) return;

    markShoppingItemPurchased(purchasingItem.id, syncWithInventory, {
      quantity: Math.max(1, purchasedQtyInput),
      expiryDate: enableExpiryDate ? purchasedExpiryInput : undefined
    });

    setPurchasingItem(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-blue-600 text-white shadow-md">
              <ShoppingCart className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Household Shopping List</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeItems.length} active item(s) to buy • Auto-synced from stock alerts
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Blue User Action: Add Item Manually */}
          <button
            onClick={() => setIsManualAddOpen(!isManualAddOpen)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md border border-blue-400 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Item to List</span>
          </button>

          {completedItems.length > 0 && (
            <button
              onClick={clearCompletedShoppingItems}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Clear Completed ({completedItems.length})
            </button>
          )}
        </div>
      </div>

      {/* Manual Item Add Form */}
      {isManualAddOpen && (
        <form
          onSubmit={handleManualAddSubmit}
          className="bg-slate-900 border border-blue-500/60 p-5 rounded-2xl text-white space-y-4 shadow-xl animate-in zoom-in-95"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-extrabold text-sm flex items-center space-x-2">
              <PlusCircle className="w-4 h-4 text-blue-400" />
              <span>Manual Shopping List Entry</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsManualAddOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Item Name
              </label>
              <input
                type="text"
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                placeholder="e.g. Olive Oil, Paper Towels, Eggs"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={manualCategory}
                onChange={e => setManualCategory(e.target.value as Category)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Quantity Needed
              </label>
              <input
                type="number"
                min="1"
                value={manualQty}
                onChange={e => setManualQty(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Unit
              </label>
              <select
                value={manualUnit}
                onChange={e => setManualUnit(e.target.value as Unit)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {units.map(u => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Target Storage Location
              </label>
              <select
                value={manualLocation}
                onChange={e => setManualLocation(e.target.value as StorageLocation)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {locations.map(l => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setManualPriority(!manualPriority)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                manualPriority
                  ? 'bg-amber-500 text-slate-950 border border-amber-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Mark High Priority</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md border border-blue-400"
            >
              Add to Shopping List
            </button>
          </div>
        </form>
      )}

      {/* ACTIVE SHOPPING ITEMS LIST */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
          <ShoppingCart className="w-4 h-4 text-blue-400" />
          <span>Items to Purchase ({activeItems.length})</span>
        </h3>

        {activeItems.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Your Shopping List is Empty!</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Add items manually or multi-select items from your Inventory List.
            </p>
          </div>
        ) : (
          activeItems.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-all shadow-md ${
                item.isPriority
                  ? 'bg-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/30'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-start space-x-3.5 min-w-0">
                {/* Priority Toggle */}
                <button
                  onClick={() => toggleShoppingItemPriority(item.id)}
                  className={`p-2 rounded-xl shrink-0 transition-colors ${
                    item.isPriority
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-500 hover:text-amber-400'
                  }`}
                  title="Toggle Priority"
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-sm text-white">{item.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-950 border border-slate-800 text-slate-300">
                      {item.category}
                    </span>
                    {item.addedFromAlert && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900/80 text-purple-200 border border-purple-500/50">
                        Auto-added from Alert
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px]">
                    {item.targetStorageLocation && (
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>Target: {item.targetStorageLocation}</span>
                      </span>
                    )}
                    {item.notes && <span className="italic">"{item.notes}"</span>}
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Purchase Trigger */}
              <div className="flex items-center space-x-3 shrink-0 self-end md:self-center">
                <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Qty:</span>
                  <input
                    type="number"
                    min="1"
                    value={item.quantityNeeded}
                    onChange={e => updateShoppingItemQty(item.id, Number(e.target.value))}
                    className="w-14 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-center text-xs font-bold text-white"
                  />
                  <span className="text-xs text-slate-400 font-medium px-1">{item.unit}</span>
                </div>

                {/* Mark as Purchased (Blue User Action -> Triggers Amber Decision Modal) */}
                <button
                  onClick={() => handleOpenPurchaseModal(item)}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md border border-blue-400 transition-all active:scale-95"
                  title="User Action: Mark as purchased & choose inventory sync decision"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark Purchased</span>
                </button>

                <button
                  onClick={() => removeFromShoppingList(item.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Remove from list"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* COMPLETED PURCHASES SECTION */}
      {completedItems.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Completed Purchases ({completedItems.length})</span>
          </h3>

          <div className="space-y-2 opacity-70">
            {completedItems.map(item => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-300"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="line-through">{item.name}</span>
                  <span className="text-slate-500">
                    ({item.quantityNeeded} {item.unit})
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">Purchased</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AMBER DECISION MODAL: "UPDATE INVENTORY ON PURCHASE?" */}
      {purchasingItem && (
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
                <h3 className="text-lg font-black text-white">Update Inventory Stock?</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              You marked <strong className="text-white">"{purchasingItem.name}"</strong> as purchased. Would you like to automatically synchronize and add this stock to your main inventory database?
            </p>

            {/* Input fields for purchase sync */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Purchased Quantity ({purchasingItem.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={purchasedQtyInput}
                  onChange={e => setPurchasedQtyInput(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-300">Include Batch Expiry Date?</span>
                <button
                  type="button"
                  onClick={() => setEnableExpiryDate(!enableExpiryDate)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    enableExpiryDate ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {enableExpiryDate ? 'Yes' : 'No'}
                </button>
              </div>

              {enableExpiryDate && (
                <div>
                  <label className="block text-xs font-bold text-amber-200 mb-1">
                    Batch Expiry Date
                  </label>
                  <input
                    type="date"
                    value={purchasedExpiryInput}
                    onChange={e => setPurchasedExpiryInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              )}
            </div>

            {/* Choice Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => handleExecutePurchase(true)}
                className="w-full p-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md border border-emerald-400 text-left transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-sm font-black">YES: Update Inventory Stock</div>
                  <div className="text-[11px] text-emerald-100/80 font-normal">
                    Adds {purchasedQtyInput} {purchasingItem.unit} to inventory batch and resolves any active low-stock alerts.
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-white" />
              </button>

              <button
                type="button"
                onClick={() => handleExecutePurchase(false)}
                className="w-full p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-left transition-all text-xs text-slate-300"
              >
                <div className="font-bold text-white">NO / SKIP: Mark Completed Only</div>
                <div className="text-[11px] text-slate-400">
                  Marks item completed on shopping list without altering inventory database.
                </div>
              </button>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setPurchasingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
