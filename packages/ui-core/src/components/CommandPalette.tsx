import React from 'react';

export const CommandPaletteSkeleton = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-slate-900/40 backdrop-blur-sm pointer-events-none opacity-0">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform scale-95 transition-all">
        <div className="flex items-center px-6 border-b">
          <span className="text-slate-400 mr-3">🔍</span>
          <input
            type="text"
            placeholder="Type a command or search departments..."
            className="w-full py-5 text-lg outline-none text-slate-900 placeholder:text-slate-400"
          />
          <kbd className="px-2 py-1 bg-slate-100 border rounded-md text-xs font-bold text-slate-500">ESC</kbd>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-3">Quick Navigation</div>
          <div className="space-y-1">
            {['Administration', 'Production', 'IT', 'Finance'].map(item => (
              <div key={item} className="flex items-center px-4 py-3 hover:bg-slate-50 rounded-xl cursor-pointer group">
                <div className="w-8 h-8 rounded-lg bg-slate-100 mr-4 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <span>→</span>
                </div>
                <span className="font-medium text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-3 border-t flex justify-between items-center">
          <div className="flex gap-4">
            <span className="text-xs text-slate-500"><kbd className="bg-white border px-1 rounded">↵</kbd> Select</span>
            <span className="text-xs text-slate-500"><kbd className="bg-white border px-1 rounded">↑↓</kbd> Navigate</span>
          </div>
          <span className="text-xs font-bold text-slate-400">PRISTINE HQ v1.0</span>
        </div>
      </div>
    </div>
  );
};
