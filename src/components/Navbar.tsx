import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import {
  LayoutDashboard,
  Package,
  FileText,
  PlusCircle,
  Bell,
  ShoppingCart,
  Cpu,
  Boxes,
  Barcode
} from 'lucide-react';
import { ScreenName } from '../types';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { QuickBarcodeScanModal } from './QuickBarcodeScanModal';

export const Navbar: React.FC = () => {
  const {
    currentScreen,
    navigateTo,
    selectedItemId,
    alerts,
    shoppingList,
    runSystemEvaluation
  } = useInventory();

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedResultCode, setScannedResultCode] = useState<string | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  const openAlertsCount = alerts.filter(a => a.status === 'open').length;
  const urgentAlertsCount = alerts.filter(a => a.status === 'open' && a.severity === 'red').length;
  const activeShoppingCount = shoppingList.filter(s => !s.purchased).length;

  const handleBarcodeScanned = (code: string) => {
    setScannedResultCode(code);
    setIsResultModalOpen(true);
  };

  const navItems: {
    id: ScreenName;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
    disabled?: boolean;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory List', icon: Package },
    {
      id: 'item_details',
      label: 'Item Details',
      icon: FileText,
      disabled: !selectedItemId
    },
    { id: 'add_edit_item', label: 'Add Item', icon: PlusCircle },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      badge: openAlertsCount,
      badgeColor: urgentAlertsCount > 0 ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-950'
    },
    {
      id: 'shopping_list',
      label: 'Shopping List',
      icon: ShoppingCart,
      badge: activeShoppingCount,
      badgeColor: 'bg-blue-600 text-white'
    }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white shadow-lg sticky top-[37px] sm:top-[41px] z-30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateTo('dashboard')}
            className="flex items-center space-x-2.5 text-left group focus:outline-hidden"
          >
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md group-hover:bg-blue-500 transition-colors">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">
                Household Inventory
              </h1>
              <span className="text-[11px] text-slate-400 font-medium">
                Batch & Expiry Tracker
              </span>
            </div>
          </button>

          {/* System Evaluation Button - Mobile */}
          <button
            onClick={runSystemEvaluation}
            className="md:hidden flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold shadow-xs border border-purple-500"
            title="System Action: Re-evaluate stock & expiry thresholds"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Check</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            const isDisabled = item.disabled;

            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && navigateTo(item.id)}
                disabled={isDisabled}
                className={`relative flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  isDisabled
                    ? 'opacity-40 cursor-not-allowed text-slate-500'
                    : isActive
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full border border-slate-900 ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Scan Barcode Quick Action Button */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 ml-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md border border-blue-400 transition-all shrink-0 active:scale-95"
            title="Scan product barcode with camera or photo"
          >
            <Barcode className="w-4 h-4 text-blue-100" />
            <span className="hidden sm:inline">Scan Barcode</span>
            <span className="sm:hidden">Scan</span>
          </button>

          {/* System Evaluation Button - Desktop */}
          <button
            onClick={runSystemEvaluation}
            className="hidden md:flex items-center space-x-1.5 px-3 py-2 ml-1 rounded-lg bg-purple-700 hover:bg-purple-600 text-purple-100 text-xs font-semibold shadow-xs border border-purple-500 transition-colors shrink-0"
            title="Purple = System Action: Run automated stock & expiry evaluation sweep"
          >
            <Cpu className="w-4 h-4 text-purple-200 animate-pulse" />
            <span>System Sweep</span>
          </button>
        </nav>
      </div>

      {/* Global Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScanned}
      />

      {/* Quick Barcode Result Modal */}
      <QuickBarcodeScanModal
        isOpen={isResultModalOpen}
        scannedCode={scannedResultCode}
        onClose={() => setIsResultModalOpen(false)}
        onRescan={() => {
          setIsResultModalOpen(false);
          setIsScannerOpen(true);
        }}
      />
    </header>
  );
};
