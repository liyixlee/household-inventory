import React, { useState } from 'react';
import { MousePointer, Cpu, GitFork, AlertTriangle, CheckCircle2, ChevronUp, ChevronDown, Info } from 'lucide-react';

export const StickyLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const legendItems = [
    {
      color: 'bg-blue-600 border-blue-500 text-blue-100',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
      dotColor: 'bg-blue-500',
      label: 'Blue = User Action',
      icon: MousePointer,
      description: 'Buttons, manual forms, filters & explicit user interactions'
    },
    {
      color: 'bg-purple-600 border-purple-500 text-purple-100',
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
      dotColor: 'bg-purple-500',
      label: 'Purple = System Action',
      icon: Cpu,
      description: 'Automated duplicate checks, threshold re-evaluations & auto-add logic'
    },
    {
      color: 'bg-amber-500 border-amber-400 text-amber-950',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      dotColor: 'bg-amber-500',
      label: 'Yellow/Amber = Decision Point',
      icon: GitFork,
      description: 'Choice prompts: "New batch vs update?", "Sync inventory on purchase?", "Does it expire?"'
    },
    {
      color: 'bg-red-600 border-red-500 text-red-100',
      badgeBg: 'bg-red-100 text-red-800 border-red-300',
      dotColor: 'bg-red-500',
      label: 'Red = Error / Alert',
      icon: AlertTriangle,
      description: 'Validation blocks, Out of Stock, Expired items & urgent system alerts'
    },
    {
      color: 'bg-emerald-600 border-emerald-500 text-emerald-100',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      dotColor: 'bg-emerald-500',
      label: 'Green = Success',
      icon: CheckCircle2,
      description: 'Confirmations, "Inventory updated", healthy stock & resolved alerts'
    }
  ];

  return (
    <div className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center justify-center p-1 rounded bg-slate-800 text-slate-300">
              <Info className="w-4 h-4 text-blue-400" />
            </span>
            <span className="text-xs font-semibold tracking-wide uppercase text-slate-300">
              Sticky Color-Coded Action Legend
            </span>
            <span className="hidden sm:inline-block text-[11px] text-slate-400">
              (Applied consistently across every screen)
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
            title="Toggle legend expansion"
          >
            <span>{isExpanded ? 'Hide Details' : 'Show Legend Key'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Legend Pills */}
        {isExpanded && (
          <div className="mt-2.5 pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 pb-1">
            {legendItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-start space-x-2 p-2 rounded-lg border text-xs shadow-xs transition-transform hover:scale-[1.01] ${item.color}`}
                >
                  <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="font-bold tracking-tight text-[11px] leading-tight">
                      {item.label}
                    </div>
                    <div className="text-[10px] opacity-90 leading-tight mt-0.5 line-clamp-2">
                      {item.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
