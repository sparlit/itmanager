"use client";
import React from 'react'
import { PRICE_LIST } from '../../../src/data/price-list'

export default function CustomerServices(){
  // Build a simple, grouped catalog from PRICE_LIST
  const groups = {}
  PRICE_LIST.forEach((it) => {
    if (!groups[it.group]) groups[it.group] = []
    if (Number(it.price) > 0 || typeof it.price === 'string') groups[it.group].push(it)
  })

  return (
    <div style={{padding:40}}>
      <h1 className="text-2xl font-bold text-slate-900 mb-4 text-center">Service Catalog</h1>
      {Object.keys(groups).map((g) => (
        <section key={g} className="mb-6 border rounded-lg p-4">
          <div className="text-sm font-semibold mb-2" style={{color:'var(--theme-color, #2563eb)'}}>
            {g}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {groups[g].sort((a,b)=> a.name.localeCompare(b.name) || (a.price > b.price ? 1 : -1)).map((item, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded bg-sky-600 text-white flex items-center justify-center">{/* icon placeholder */}</span>
                  <span className="font-semibold text-sm">{item.name}</span>
                </div>
                <div className="text-xs text-slate-600 mb-1">{item.serviceType || 'Service'}</div>
                <div className="text-sm font-bold" style={{ color: '#0ea5e9' }}>{typeof item.price === 'string' ? item.price : Number(item.price).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
