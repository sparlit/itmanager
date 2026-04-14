"use client";
import React from 'react'

export default function ITDashboard(){
  return (
    <div>
      <header className="bg-slate-800 text-white p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold">IT Internal Portal</h2>
          <nav className="space-x-4 text-sm">
            <a href="/internal/dashboard" className="underline">Dashboard</a>
            <a href="/internal/it-services" className="underline">Services</a>
            <a href="/internal/tickets" className="underline">Tickets</a>
            <a href="/internal/assets" className="underline">Assets</a>
            <a href="/internal/users" className="underline">Users</a>
          </nav>
        </div>
      </header>
      <main className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <a href="/internal/tickets" className="block p-4 border rounded-lg bg-white hover:bg-slate-50">Tickets</a>
          <a href="/internal/assets" className="block p-4 border rounded-lg bg-white hover:bg-slate-50">Assets</a>
          <a href="/internal/it-services" className="block p-4 border rounded-lg bg-white hover:bg-slate-50">IT Services</a>
          <a href="/internal/users" className="block p-4 border rounded-lg bg-white hover:bg-slate-50">Users</a>
        </div>
        <div style={{padding:40}}>
          <p>Overview</p>
        </div>
      </main>
    </div>
  )
}
