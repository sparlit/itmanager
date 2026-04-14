"use client";

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { IT_SERVICES } from '@/data/it-services'
import { Briefcase } from 'lucide-react'

export default function ITServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">IT Services Catalogue</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {IT_SERVICES.map((svc) => (
          <Card key={svc.id} className="h-full border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Briefcase className="w-6 h-6 text-sky-600" />
                <div>
                  <div className="text-sm font-semibold">{svc.title}</div>
                  <div className="text-xs text-slate-500">{svc.price}</div>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-2">{svc.description}</p>
              <ul className="text-sm text-slate-600 space-y-1">
                {(svc.features || []).map((f, i) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
