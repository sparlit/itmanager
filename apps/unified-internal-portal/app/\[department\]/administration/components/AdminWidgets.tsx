import React from 'react';

export const KPIGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[
      { label: 'Total Revenue', value: 'QAR 2.4M', change: '+14%', trend: 'up' },
      { label: 'Customer Acquisition', value: '1,240', change: '+8%', trend: 'up' },
      { label: 'Operating Margin', value: '22.5%', change: '-2%', trend: 'down' },
      { label: 'SLA Achievement', value: '99.1%', change: '+0.5%', trend: 'up' },
    ].map((kpi) => (
      <div key={kpi.label} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
        <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">{kpi.label}</p>
        <div className="flex items-baseline justify-between mt-2">
          <h3 className="text-2xl font-black text-slate-900">{kpi.value}</h3>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${kpi.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {kpi.change}
          </span>
        </div>
      </div>
    ))}
  </div>
);

export const AuditTimeline = () => (
  <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
      <h3 className="font-bold text-slate-900">Global Operational Audit</h3>
      <button className="text-sm font-bold text-blue-600 hover:text-blue-800">View Full Log</button>
    </div>
    <div className="divide-y">
      {[
        { event: 'Production Cycle Completed', dept: 'Production', time: '4m ago', user: 'Auto-System' },
        { event: 'Inventory Restock Order Placed', dept: 'Procurement', time: '12m ago', user: 'A. Al-Thani' },
        { event: 'New B2B Contract Signed', dept: 'Sales', time: '45m ago', user: 'M. Rashid' },
        { event: 'System Health Check', dept: 'IT', time: '1h ago', user: 'Guardian Agent' },
      ].map((log, i) => (
        <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <div>
              <p className="font-bold text-slate-900">{log.event}</p>
              <p className="text-xs text-slate-500">{log.dept} • {log.user}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">{log.time}</span>
        </div>
      ))}
    </div>
  </div>
);
