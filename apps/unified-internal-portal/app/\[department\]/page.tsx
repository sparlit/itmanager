import React from 'react';
import { PORTAL_CONFIG } from '../../config/portals';
import AdministrationView from './AdminView';

export default function DepartmentPage({ params }: { params: { department: string } }) {
  const { department } = params;
  const config = PORTAL_CONFIG.find(p => p.id === department);

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-4xl font-bold text-slate-900">Department Not Found</h1>
        <p className="text-slate-500 mt-2">The department "{department}" does not exist in the registry.</p>
      </div>
    );
  }

  // Specific view overrides
  if (department === 'administration') {
    return <AdministrationView />;
  }

  // Default Generic Dashboard for other departments
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight capitalize">{config.name} Dashboard</h1>
          <p className="text-slate-500">Real-time operational overview for the {config.name} department.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">Generate Report</button>
          <button className="px-4 py-2 border rounded-lg text-sm font-medium bg-white">Settings</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <StatCard title="Total Transactions" value="1,284" change="+12%" trend="up" />
        <StatCard title="Active Requests" value="42" change="-5%" trend="down" />
        <StatCard title="Staff on Duty" value="18" change="0%" trend="neutral" />
        <StatCard title="SLA Compliance" value="98.2%" change="+0.4%" trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 py-3 border-b last:border-0">
                <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Task completed by Sarah Johnson</p>
                  <p className="text-xs text-slate-500">24 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold mb-4">Departmental Queue</h3>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium">Ticket #10{i} - Urgent Request</span>
                <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-bold">PENDING</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, trend }: { title: string, value: string, change: string, trend: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <h3 className="text-2xl font-bold">{value}</h3>
        <span className={`text-xs font-bold ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-500'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}
