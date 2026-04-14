"use client";
import React, { useEffect, useState } from 'react'

type Ticket = { id: string; title: string; status: string; priority: string }

export default function ITTickets(){
  const [tickets, setTickets] = useState<Ticket[]>([])
  useEffect(() => {
    fetch('/internal/api/tickets')
      .then(res => res.json())
      .then((data: Ticket[]) => setTickets(data))
  }, [])
  return (
    <div style={{padding:40}}>
      <h1 className="mb-4">IT Tickets</h1>
      <ul className="space-y-3">
        {tickets.map((t)=> (
          <li key={t.id} className="border rounded-lg p-3 flex justify-between items-center">
            <div>
              <div className="font-semibold">{t.title}</div>
              <div className="text-sm text-slate-600">{t.id} • Priority: {t.priority}</div>
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
