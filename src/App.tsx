import React from 'react';
import { InventoryProvider } from './context/InventoryContext';
import { StickyLegend } from './components/StickyLegend';
import { Navbar } from './components/Navbar';
import { AppContent } from './components/AppContent';
import { DisqusComments } from './components/DisqusComments';
import { ToastContainer } from './components/ToastContainer';

export default function App() {
  return (
    <InventoryProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
        {/* Sticky Color-Coded Legend across every screen */}
        <StickyLegend />

        {/* Global App Header Navbar */}
        <Navbar />

        {/* Main Application Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-6 pb-12">
          <AppContent />
          <DisqusComments />
        </main>

        {/* Toast Notifications Overlay */}
        <ToastContainer />

        {/* Global Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <strong className="text-slate-300">Household Inventory Management System</strong> • Multi-Batch Expiry & Stock Tracker
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /><span>User</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /><span>System</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /><span>Decision</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /><span>Alert</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /><span>Success</span></span>
            </div>
          </div>
        </footer>
      </div>
    </InventoryProvider>
  );
}
