"use client";
import React, { useEffect, useState } from 'react'

type Asset = { id: string; name: string; type: string; status: string; location?: string }

export default function ITAssets(){
  const [assets, setAssets] = useState<Asset[]>([])
  useEffect(() => {
    fetch('/internal/api/assets')
      .then(r => r.json())
      .then((data: Asset[]) => setAssets(data))
  }, [])
  return (
    <div style={{padding:40}}>
      <h1 className="mb-4">IT Assets</h1>
      <ul className="space-y-3">
        {assets.map(a => (
          <li key={a.id} className="border rounded-lg p-3 flex justify-between">
            <div>
              <div className="font-semibold">{a.name}</div>
              <div className="text-sm text-slate-600">{a.type} • {a.status}</div>
            </div>
            <span className="text-xs text-slate-500">{a.location ?? 'Unknown'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
