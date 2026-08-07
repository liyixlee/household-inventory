import React from 'react';
import { useInventory } from '../context/InventoryContext';
import {
  Search,
  Filter,
  Package,
  PlusCircle,
  ShoppingCart,
  CheckSquare,
  Square,
  ChevronRight,
  Clock,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  MousePointer
} from 'lucide-react';
import {
  getItemTotalQuantity,
  getItemStatus,
  formatDate,
  getEarliestExpiryDate,
  getDaysUntilExpiry
} from '../utils/inventoryUtils';
import { Category, StorageLocation, StockStatus } from '../types';

export const InventoryList: React.FC = () => {
  const {
    items,
    filters,
    setFilters,
    resetFilters,
    navigateTo,
    selectedInventoryItemIds,
    toggleItemSelection,
    selectAllItems,
    clearItemSelection,
    addMultipleToShoppingList,
    expiryWarningDays
  } = useInventory();

  // Categories & Storage Locations list
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

  // Filtering & Sorting Logic
  const filteredItems = items.filter(item => {
    // Search Filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchLoc = item.storageLocation.toLowerCase().includes(q);
      const matchBarcode = item.barcode ? item.barcode.toLowerCase().includes(q) : false;
      if (!matchName && !matchCat && !matchLoc && !matchBarcode) return false;
    }

    // Category Filter
    if (filters.category !== 'all' && item.category !== filters.category) {
      return false;
    }

    // Location Filter
    if (filters.location !== 'all' && item.storageLocation !== filters.location) {
      return false;
    }

    // Status Filter
    if (filters.status !== 'all') {
      const itemStatus = getItemStatus(item, expiryWarningDays);
      if (itemStatus !== filters.status) return false;
    }

    return true;
  });

  // Sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (filters.sortBy === 'name') {
      return filters.sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (filters.sortBy === 'quantity') {
      const qtyA = getItemTotalQuantity(a);
      const qtyB = getItemTotalQuantity(b);
      return filters.sortOrder === 'asc' ? qtyA - qtyB : qtyB - qtyA;
    }
    if (filters.sortBy === 'location') {
      return a.storageLocation.localeCompare(b.storageLocation);
    }
    if (filters.sortBy === 'expiry') {
      const expA = getEarliestExpiryDate(a) || '9999-12-31';
      const expB = getEarliestExpiryDate(b) || '9999-12-31';
      return filters.sortOrder === 'asc'
        ? expA.localeCompare(expB)
        : expB.localeCompare(expA);
    }
    return 0;
  });

  const allVisibleSelected =
    sortedItems.length > 0 &&
    sortedItems.every(i => selectedInventoryItemIds.includes(i.id));

  const handleSelectAllToggle = () => {
    if (allVisibleSelected) {
      clearItemSelection();
    } else {
      selectAllItems(sortedItems.map(i => i.id));
    }
  };

  const getStatusBadge = (status: StockStatus, earliestExpiry: string | null) => {
    switch (status) {
      case 'out_of_stock':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-xs">
            <XCircle className="w-3.5 h-3.5" />
            <span>Out of Stock</span>
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Expired</span>
          </span>
        );
      case 'low_stock':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock</span>
          </span>
        );
      case 'expiring_soon':
        const daysLeft = earliestExpiry ? getDaysUntilExpiry(earliestExpiry) : 0;
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>Expiring ({daysLeft === 0 ? 'Today' : `${daysLeft}d`})</span>
          </span>
        );
      case 'in_stock':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>In Stock</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-400" />
            <span>Inventory Master List</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing {sortedItems.length} of {items.length} total item(s)
          </p>
        </div>

        <button
          onClick={() => navigateTo('add_edit_item')}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md border border-blue-400 transition-all active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search items by name, category, or location..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={filters.category}
            onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Location Dropdown */}
          <select
            value={filters.location}
            onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Locations</option>
            {locations.map(l => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            title="Reset all search & filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Sorting options bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            <span>Sort By:</span>
            {(['name', 'quantity', 'expiry', 'location'] as const).map(sortKey => (
              <button
                key={sortKey}
                onClick={() =>
                  setFilters(prev => ({
                    ...prev,
                    sortBy: sortKey,
                    sortOrder:
                      prev.sortBy === sortKey && prev.sortOrder === 'asc' ? 'desc' : 'asc'
                  }))
                }
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-colors ${
                  filters.sortBy === sortKey
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {sortKey}{' '}
                {filters.sortBy === sortKey ? (filters.sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
            ))}
          </div>

          <button
            onClick={handleSelectAllToggle}
            className="flex items-center space-x-1 text-xs font-bold text-blue-400 hover:text-blue-300"
          >
            {allVisibleSelected ? (
              <CheckSquare className="w-4 h-4 text-blue-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>{allVisibleSelected ? 'Deselect All' : 'Select All Visible'}</span>
          </button>
        </div>
      </div>

      {/* Floating Bulk Action Bar for Multi-Select */}
      {selectedInventoryItemIds.length > 0 && (
        <div className="sticky top-28 z-20 bg-blue-900 border-2 border-blue-500 p-3 rounded-2xl shadow-xl flex items-center justify-between text-white animate-in slide-in-from-top-2">
          <div className="flex items-center space-x-2 text-xs font-bold">
            <MousePointer className="w-4 h-4 text-blue-300" />
            <span>{selectedInventoryItemIds.length} item(s) selected</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => addMultipleToShoppingList(selectedInventoryItemIds)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md border border-blue-400 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Shopping List</span>
            </button>

            <button
              onClick={clearItemSelection}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Inventory List Items Grid / Table */}
      {sortedItems.length === 0 ? (
        /* Empty State */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No items match your search/filters</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try resetting your filters or search terms to view all inventory items.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md border border-blue-400 transition-all"
          >
            Clear Filters & Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedItems.map(item => {
            const totalQty = getItemTotalQuantity(item);
            const status = getItemStatus(item, expiryWarningDays);
            const earliestExpiry = getEarliestExpiryDate(item);
            const isSelected = selectedInventoryItemIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`bg-slate-900 border rounded-2xl p-4 transition-all hover:border-slate-600 relative flex flex-col justify-between shadow-md ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-950/20'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  {/* Top Header: Select Checkbox, Status Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleItemSelection(item.id);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                      title="Select for bulk actions"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-600" />
                      )}
                    </button>

                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {getStatusBadge(status, earliestExpiry)}
                    </div>
                  </div>

                  {/* Title & Category */}
                  <button
                    onClick={() => navigateTo('item_details', item.id)}
                    className="text-left w-full group"
                  >
                    <h3 className="text-base font-extrabold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {item.category}
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{item.storageLocation}</span>
                      </span>
                      {item.barcode && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-500/40 text-blue-300 font-mono text-[10px] font-semibold flex items-center space-x-1" title={`Barcode: ${item.barcode}`}>
                          <span>UPC: {item.barcode}</span>
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Quantity & Batches Summary */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        Total In Stock
                      </div>
                      <div className="text-lg font-black text-white">
                        {totalQty}{' '}
                        <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                        Threshold
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-300">
                        {item.lowStockThreshold} {item.unit}
                      </div>
                    </div>
                  </div>

                  {/* Expiry Info */}
                  <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Earliest Expiry:</span>
                    </span>
                    <span className="font-semibold text-slate-200">
                      {item.hasExpiry ? formatDate(earliestExpiry || undefined) : 'No expiry'}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {item.batches.length} batch{item.batches.length !== 1 ? 'es' : ''}
                  </span>

                  <button
                    onClick={() => navigateTo('item_details', item.id)}
                    className="flex items-center space-x-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>View & Manage</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
