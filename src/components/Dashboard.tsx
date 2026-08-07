import React from 'react';
import { useInventory } from '../context/InventoryContext';
import {
  Package,
  AlertOctagon,
  AlertTriangle,
  Clock,
  XCircle,
  ShoppingCart,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Cpu,
  Layers,
  ChevronRight,
  MousePointer,
  GitFork,
  CheckCircle2
} from 'lucide-react';
import { getItemTotalQuantity, getItemStatus } from '../utils/inventoryUtils';

export const Dashboard: React.FC = () => {
  const {
    items,
    alerts,
    shoppingList,
    navigateTo,
    setFilters,
    expiryWarningDays,
    runSystemEvaluation
  } = useInventory();

  // Compute metric counts
  const totalItemsCount = items.length;

  let lowStockCount = 0;
  let outOfStockCount = 0;
  let expiringSoonCount = 0;
  let expiredCount = 0;

  items.forEach(item => {
    const status = getItemStatus(item, expiryWarningDays);
    if (status === 'out_of_stock') outOfStockCount++;
    else if (status === 'low_stock') lowStockCount++;
    else if (status === 'expiring_soon') expiringSoonCount++;
    else if (status === 'expired') expiredCount++;
  });

  const activeShoppingCount = shoppingList.filter(s => !s.purchased).length;
  const openAlerts = alerts.filter(a => a.status === 'open');

  const handleTileClick = (filterStatus: string, screen: 'inventory' | 'shopping_list' = 'inventory') => {
    if (screen === 'shopping_list') {
      navigateTo('shopping_list');
    } else {
      setFilters(prev => ({
        ...prev,
        status: filterStatus,
        category: 'all',
        location: 'all',
        search: ''
      }));
      navigateTo('inventory');
    }
  };

  const dashboardTiles = [
    {
      id: 'total',
      title: 'Total Items',
      count: totalItemsCount,
      subtitle: 'Tracked in inventory',
      icon: Package,
      tileBg: 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-white',
      badgeBg: 'bg-blue-600 text-white',
      filterStatus: 'all',
      screen: 'inventory' as const
    },
    {
      id: 'low_stock',
      title: 'Low Stock',
      count: lowStockCount,
      subtitle: 'Below threshold',
      icon: AlertTriangle,
      tileBg: 'bg-slate-900 hover:bg-slate-800 border-amber-500/40 text-amber-300',
      badgeBg: 'bg-amber-500 text-slate-950 font-bold',
      filterStatus: 'low_stock',
      screen: 'inventory' as const
    },
    {
      id: 'out_of_stock',
      title: 'Out of Stock',
      count: outOfStockCount,
      subtitle: 'Quantity is 0',
      icon: AlertOctagon,
      tileBg: 'bg-slate-900 hover:bg-slate-800 border-red-500/50 text-red-400',
      badgeBg: 'bg-red-600 text-white',
      filterStatus: 'out_of_stock',
      screen: 'inventory' as const
    },
    {
      id: 'expiring_soon',
      title: 'Expiring Soon',
      count: expiringSoonCount,
      subtitle: `Within ${expiryWarningDays} days`,
      icon: Clock,
      tileBg: 'bg-slate-900 hover:bg-slate-800 border-amber-500/40 text-amber-300',
      badgeBg: 'bg-amber-500 text-slate-950 font-bold',
      filterStatus: 'expiring_soon',
      screen: 'inventory' as const
    },
    {
      id: 'expired',
      title: 'Expired',
      count: expiredCount,
      subtitle: 'Passed expiry date',
      icon: XCircle,
      tileBg: 'bg-slate-900 hover:bg-slate-800 border-red-500/50 text-red-400',
      badgeBg: 'bg-red-600 text-white',
      filterStatus: 'expired',
      screen: 'inventory' as const
    },
    {
      id: 'shopping_list',
      title: 'Shopping List',
      count: activeShoppingCount,
      subtitle: 'Active items to buy',
      icon: ShoppingCart,
      tileBg: 'bg-slate-900 hover:bg-slate-800 border-blue-500/40 text-blue-300',
      badgeBg: 'bg-blue-600 text-white',
      filterStatus: 'all',
      screen: 'shopping_list' as const
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Household Command Center</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Inventory Overview
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Tap any metric tile below to view filtered items. Stock and expiry statuses update automatically with every quantity change.
            </p>
          </div>

          {/* User Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigateTo('add_edit_item')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md border border-blue-400 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Item</span>
            </button>

            <button
              onClick={runSystemEvaluation}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-purple-100 font-bold text-xs shadow-md border border-purple-500 transition-all active:scale-95"
            >
              <Cpu className="w-4 h-4 text-purple-200" />
              <span>System Evaluation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Tiles Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <MousePointer className="w-4 h-4 text-blue-400" />
            <span>Interactive Status Tiles (Tap to Filter)</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {dashboardTiles.map(tile => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile.filterStatus, tile.screen)}
                className={`flex flex-col justify-between p-4 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-95 shadow-sm group ${tile.tileBg}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`p-2 rounded-lg ${tile.badgeBg}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {tile.count}
                  </div>
                  <div className="text-xs font-bold text-slate-200 mt-0.5">
                    {tile.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {tile.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dashboard Section: Active Alerts + Quick Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active System Alerts Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-lg bg-red-950 text-red-400 border border-red-800">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-white">Active System Alerts</h3>
                  <p className="text-xs text-slate-400">
                    Auto-generated from low stock thresholds & expiry batch monitoring
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigateTo('alerts')}
                className="flex items-center space-x-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                <span>View All ({openAlerts.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Alert List Preview */}
            <div className="mt-4 space-y-2.5">
              {openAlerts.length === 0 ? (
                <div className="text-center py-8 bg-slate-950/60 rounded-xl border border-dashed border-slate-800">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-200">No active alerts!</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    All items are stocked and within safe expiry ranges.
                  </p>
                </div>
              ) : (
                openAlerts.slice(0, 4).map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                      alert.severity === 'red'
                        ? 'bg-red-950/40 border-red-600/50 text-red-200'
                        : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span
                        className={`p-1.5 rounded-md shrink-0 ${
                          alert.severity === 'red' ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">{alert.itemName}</div>
                        <div className="text-[11px] opacity-90 truncate">{alert.message}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigateTo('alerts')}
                      className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold transition-all shadow-xs"
                      title="Yellow/Amber = Decision Point: Choose alert resolution"
                    >
                      Resolve
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {openAlerts.length > 4 && (
            <div className="mt-4 pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
              + {openAlerts.length - 4} more active alerts waiting on resolution
            </div>
          )}
        </div>

        {/* Quick Category Summary Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <span className="p-2 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-base text-white">Categories</h3>
                <p className="text-xs text-slate-400">Browse items by category</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {['Pantry', 'Fridge', 'Freezer', 'Household', 'Medicine', 'Cleaning'].map(cat => {
                const count = items.filter(i => i.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        category: cat,
                        status: 'all',
                        location: 'all',
                        search: ''
                      }));
                      navigateTo('inventory');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-200 transition-colors group"
                  >
                    <span className="font-semibold">{cat}</span>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 text-[11px] font-mono border border-slate-700">
                        {count} item{count !== 1 ? 's' : ''}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <button
              onClick={() => {
                setFilters(prev => ({ ...prev, category: 'all', status: 'all', location: 'all', search: '' }));
                navigateTo('inventory');
              }}
              className="text-xs font-bold text-blue-400 hover:text-blue-300"
            >
              Browse Full Inventory →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
