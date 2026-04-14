"use client";
import React from 'react'
import { IT_SERVICES } from '../../../src/data/it-services'
import { Card, CardContent } from '../../../src/components/ui/card'

export default function ITServicesPage(){
  return (
    <div style={{padding:40}}>
      <h1 className="mb-6 text-2xl font-bold">IT Internal Services Catalogue</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {IT_SERVICES.map((s) => (
          <Card key={s.id} className="h-full border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-white">{/* icon placeholder */}</div>
                <div>
                  <div className="text-sm font-semibold">{s.title}</div>
                  <div className="text-xs text-slate-500">{s.price}</div>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-2">{s.description}</p>
              <ul className="text-sm text-slate-600 space-y-1">
                {(s.features || []).map((f, i) => (
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
