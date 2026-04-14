"use client";
import React from 'react'

export default function ITTicketsIndex(){
  const items = [
    { id: 'T-001', title: 'Network outage', status: 'Open', priority: 'High' },
    { id: 'T-002', title: 'Printer not working', status: 'In Progress', priority: 'Medium' },
  ]
  return (
    <div style={{padding:40}}>
      <h1 className="mb-4">IT Tickets</h1>
      <ul className="space-y-3">
        {items.map((t)=> (
          <li key={t.id} className="border rounded-lg p-3 flex justify-between items-center">
            <div>
              <div className="font-semibold">{t.title}</div>
              <div className="text-sm text-slate-600">{t.id} • {t.priority}</div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${t.status==='Open'?'bg-yellow-200':'bg-blue-200'}`}>
              {t.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
