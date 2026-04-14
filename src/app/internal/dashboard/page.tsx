"use client";

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

export default function ITDashboard() {
  // Simple placeholder counts; replace with real data sources later
  const tickets = 7
  const assets = 42
  const staff = 8
  const services = 12

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">IT Department Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent>
            <div className="text-sm text-slate-600">Open Tickets</div>
            <div className="text-2xl font-bold">{tickets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-sm text-slate-600">Assets</div>
            <div className="text-2xl font-bold">{assets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-sm text-slate-600">IT Staff</div>
            <div className="text-2xl font-bold">{staff}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-sm text-slate-600">Internal Services</div>
            <div className="text-2xl font-bold">{services}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
