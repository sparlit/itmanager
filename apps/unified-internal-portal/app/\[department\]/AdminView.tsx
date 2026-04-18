import React from 'react';
import { KPIGrid, AuditTimeline } from './administration/components/AdminWidgets';

export default function AdministrationView() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Command Center</h1>
        <p className="text-slate-500 text-lg mt-1">Executive oversight and global system orchestration.</p>
      </header>

      <KPIGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <AuditTimeline />
          <div className="bg-slate-900 rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-4">AI Insight: Operational Bottleneck</h3>
            <p className="text-slate-400 leading-relaxed">
              Logistics data indicates a 15-minute delay in Zone 4 (West Bay) due to traffic congestion.
              Recommendation: Reroute Drivers 04 and 09 via Al Corniche St.
            </p>
            <button className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors">
              Execute Reroute
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <h3 className="font-bold mb-4">Department Status</h3>
            <div className="space-y-4">
              {['Production', 'Transport', 'Finance', 'IT'].map(dept => (
                <div key={dept} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{dept}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-600">ONLINE</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-6 shadow-sm border-amber-100 bg-amber-50/30">
            <h3 className="font-bold text-amber-900 mb-2">Security Alert</h3>
            <p className="text-sm text-amber-700">
              Unusual login attempt detected from IP 192.168.1.45 for User: Admin-02.
            </p>
            <button className="mt-4 w-full py-2 bg-amber-900 text-white rounded-lg text-xs font-black">
              INVESTIGATE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
