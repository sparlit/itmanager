"use client";
import React from 'react'
import Link from 'next/link'

export default function ITLanding(){
  return (
    <div style={{padding:40}}>
      <h1 className="text-2xl font-bold mb-6">IT Internal Portal</h1>
      <p className="text-slate-600 mb-6">Navigate to core IT modules</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/internal/dashboard" className="block p-4 border rounded-lg hover:bg-slate-50">
          Tickets / Dashboard
        </Link>
        <Link href="/internal/it-services" className="block p-4 border rounded-lg hover:bg-slate-50">
          IT Services
        </Link>
        <Link href="/internal/assets" className="block p-4 border rounded-lg hover:bg-slate-50">
          Assets
        </Link>
        <Link href="/internal/users" className="block p-4 border rounded-lg hover:bg-slate-50">
          Users
        </Link>
      </div>
    </div>
  )
}
