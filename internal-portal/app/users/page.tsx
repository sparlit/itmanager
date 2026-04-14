"use client";
import React from 'react'

export default function ITUsers(){
  const [users, setUsers] = React.useState([])
  React.useEffect(()=>{
    fetch('/internal/api/users').then(r=>r.json()).then(setUsers)
  },[])
  return (
    <div style={{padding:40}}>
      <h1 className="mb-4">IT Staff</h1>
      <ul className="space-y-3">
        {users.map((u:any)=> (
          <li key={u.id} className="border rounded-lg p-3 flex justify-between">
            <div>
              <div className="font-semibold">{u.name}</div>
              <div className="text-sm text-slate-600">{u.email} • {u.role}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
