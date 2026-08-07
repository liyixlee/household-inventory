import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Clock,
  CheckCircle2,
  ShoppingCart,
  Edit3,
  Trash2,
  Calendar,
  XCircle,
  Cpu,
  GitFork,
  Settings,
  ChevronRight,
  X,
  History,
  RotateCcw
} from 'lucide-react';
import { formatDate, getTodayString } from '../utils/inventoryUtils';
import { AlertItem } from '../types';

export const Alerts: React.FC = () => {
  const {
    alerts,
    resolveAlert,
    snoozeAlert,
    dismissAlert,
    expiryWarningDays,
    setExpiryWarningDays,
    runSystemEvaluation
  } = useInventory();

  // Active Alert Resolution Modal State
  const [activeResolutionAlert, setActiveResolutionAlert] = useState<AlertItem | null>(null);

  // Form states for resolution modal
  const [resolveQtyInput, setResolveQtyInput] = useState<number>(1);
  const [resolveDateInput, setResolveDateInput] = useState<string>('');
  const [snoozeDaysInput, setSnoozeDaysInput] = useState<number>(3);

  // Active Tab: Open vs Resolved History
  const [viewTab, setViewTab] = useState<'open' | 'resolved'>('open');

  const openAlerts = alerts.filter(a => a.status === 'open');
  const snoozedAlerts = alerts.filter(a => a.status === 'snoozed');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  const handleOpenResolution = (alert: AlertItem) => {
    setActiveResolutionAlert(alert);
    setResolveQtyInput(alert.currentQuantity || 1);
    setResolveDateInput(getTodayString());
  };

  const handleExecuteResolution = (
    actionType: 'shopping_list' | 'update_qty' | 'discard' | 'extend_expiry' | 'snooze' | 'dismiss'
  ) => {
    if (!activeResolutionAlert) return;

    resolveAlert(activeResolutionAlert.id, actionType, {
      newQty: resolveQtyInput,
      newExpiryDate: resolveDateInput,
      snoozeDays: snoozeDaysInput
    });

    setActiveResolutionAlert(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-red-950 text-red-400 border border-red-800">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">System Stock & Expiry Alerts</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluated automatically on every quantity change and daily system sweeps
              </p>
            </div>
          </div>
        </div>

        {/* Configurable Expiry Warning Threshold */}
        <div className="flex items-center space-x-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <Settings className="w-4 h-4 text-purple-400 shrink-0" />
          <div className="text-xs">
            <span className="text-slate-400 block font-semibold">Expiry Warning Window:</span>
            <div className="flex items-center space-x-1 mt-0.5">
              {[3, 7, 14, 30].map(days => (
                <button
                  key={days}
                  onClick={() => setExpiryWarningDays(days)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                    expiryWarningDays === days
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Open Alerts vs Resolved History */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewTab('open')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewTab === 'open'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Open Alerts ({openAlerts.length})</span>
          </button>

          <button
            onClick={() => setViewTab('resolved')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewTab === 'resolved'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Resolved Log ({resolvedAlerts.length})</span>
          </button>
        </div>

        <button
          onClick={runSystemEvaluation}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold shadow-xs border border-purple-500"
          title="Purple System Action: Force system evaluation"
        >
          <Cpu className="w-3.5 h-3.5 text-purple-200" />
          <span>Run System Sweep</span>
        </button>
      </div>

      {/* Snoozed Banner */}
      {snoozedAlerts.length > 0 && viewTab === 'open' && (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{snoozedAlerts.length} alert(s) currently snoozed</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Auto-reactivates on expiry date</span>
        </div>
      )}

      {/* OPEN ALERTS LIST */}
      {viewTab === 'open' && (
        <div className="space-y-3">
          {openAlerts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">All Alerts Clear!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No active stock shortages or expiring items detected.
              </p>
            </div>
          ) : (
            openAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-all shadow-md ${
                  alert.severity === 'red'
                    ? 'bg-red-950/30 border-red-600/60 text-red-100'
                    : 'bg-amber-950/30 border-amber-500/60 text-amber-100'
                }`}
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      alert.severity === 'red'
                        ? 'bg-red-600 text-white'
                        : 'bg-amber-500 text-slate-950 font-bold'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-white">
                        {alert.itemName}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-950 border border-slate-800 text-slate-300">
                        {alert.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-400">
                        {alert.type === 'stock' ? 'Stock Alert' : 'Expiry Alert'}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-200">{alert.message}</p>
                    <p className="text-[10px] text-slate-400">
                      Triggered: {new Date(alert.timestamp).toLocaleString()} • Location: {alert.storageLocation}
                    </p>
                  </div>
                </div>

                {/* Response Action Button (Amber Decision Point) */}
                <button
                  onClick={() => handleOpenResolution(alert)}
                  className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md border border-amber-300 transition-all active:scale-95 shrink-0"
                  title="Amber Decision Point: Open alert resolution choices"
                >
                  <GitFork className="w-4 h-4" />
                  <span>Choose Resolution</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* RESOLVED ALERTS HISTORY LOG */}
      {viewTab === 'resolved' && (
        <div className="space-y-2">
          {resolvedAlerts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
              No resolved alerts history yet.
            </div>
          ) : (
            resolvedAlerts.map(alert => (
              <div
                key={alert.id}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs opacity-80"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white">{alert.itemName}</span>
                    <span className="text-[11px] text-slate-400 ml-2">({alert.message})</span>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                      {alert.resolutionAction || 'Resolved'}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleDateString() : ''}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* AMBER DECISION MODAL: ALERT RESOLUTION OPTIONS */}
      {activeResolutionAlert && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
                  <GitFork className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Amber Decision Point
                  </span>
                  <h3 className="text-base font-extrabold text-white">
                    Resolve Alert: {activeResolutionAlert.itemName}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveResolutionAlert(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              {activeResolutionAlert.message}
            </div>

            {/* Resolution Options */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Select Resolution Action:
              </span>

              {/* Action 1: Add to Shopping List */}
              <button
                type="button"
                onClick={() => handleExecuteResolution('shopping_list')}
                className="w-full p-3.5 rounded-xl bg-blue-900/40 hover:bg-blue-900/70 border border-blue-500 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-bold text-xs text-blue-200 group-hover:text-white">
                      Add Item to Shopping List
                    </div>
                    <div className="text-[11px] text-blue-300/80">
                      Creates restock task in Shopping List
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-400" />
              </button>

              {/* Action 2: Update Quantity Directly */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-xs text-slate-200">
                  Update Quantity Directly
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    value={resolveQtyInput}
                    onChange={e => setResolveQtyInput(Math.max(0, Number(e.target.value)))}
                    className="w-24 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleExecuteResolution('update_qty')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    Save & Resolve
                  </button>
                </div>
              </div>

              {/* Action 3: Expiry specific actions */}
              {activeResolutionAlert.type === 'expiry' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleExecuteResolution('discard')}
                    className="w-full p-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-left transition-all flex items-center space-x-3 text-red-200 text-xs font-bold"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span>Mark Batch as Discarded / Removed</span>
                  </button>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="font-bold text-xs text-slate-200">
                      Extend / Update Expiry Date
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={resolveDateInput}
                        onChange={e => setResolveDateInput(e.target.value)}
                        className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleExecuteResolution('extend_expiry')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Extend Date
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Action 4: Snooze & Dismiss */}
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleExecuteResolution('snooze')}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
                >
                  Snooze ({snoozeDaysInput} days)
                </button>

                <button
                  type="button"
                  onClick={() => handleExecuteResolution('dismiss')}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
                >
                  Dismiss Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
