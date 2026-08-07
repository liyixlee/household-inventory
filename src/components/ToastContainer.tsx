import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { MousePointer, Cpu, GitFork, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useInventory();

  if (!toasts.length) return null;

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'blue':
        return {
          bg: 'bg-blue-900/95 border-blue-500 text-blue-100',
          icon: MousePointer,
          badge: 'bg-blue-600 text-white',
          label: 'User Action'
        };
      case 'purple':
        return {
          bg: 'bg-purple-900/95 border-purple-500 text-purple-100',
          icon: Cpu,
          badge: 'bg-purple-600 text-white',
          label: 'System Action'
        };
      case 'amber':
        return {
          bg: 'bg-amber-900/95 border-amber-500 text-amber-100',
          icon: GitFork,
          badge: 'bg-amber-500 text-slate-950 font-bold',
          label: 'Decision Point'
        };
      case 'red':
        return {
          bg: 'bg-red-900/95 border-red-500 text-red-100',
          icon: AlertTriangle,
          badge: 'bg-red-600 text-white',
          label: 'Alert / Error'
        };
      case 'green':
      default:
        return {
          bg: 'bg-emerald-900/95 border-emerald-500 text-emerald-100',
          icon: CheckCircle2,
          badge: 'bg-emerald-600 text-white',
          label: 'Success'
        };
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map(toast => {
        const style = getToastStyles(toast.type);
        const Icon = style.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start space-x-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${style.bg}`}
          >
            <div className="p-1.5 rounded-lg bg-black/20 shrink-0">
              <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${style.badge}`}>
                  {style.label}
                </span>
                <span className="text-[10px] text-slate-300">{toast.timestamp}</span>
              </div>
              <p className="text-xs font-bold text-white mt-1 leading-tight">{toast.title}</p>
              {toast.description && (
                <p className="text-[11px] text-slate-200 mt-0.5 leading-snug">{toast.description}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
