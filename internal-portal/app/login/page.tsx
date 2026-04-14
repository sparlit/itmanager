"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ITLogin() {
  const router = useRouter();
  const [role, setRole] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = () => {
    document.cookie = 'it_auth=true; path=/';
    document.cookie = `it_role=${role}; path=/`;
    router.push('/internal/dashboard');
  };

  return (
    <div style={{padding:40, maxWidth:420, margin:'0 auto'}}>
      <h1 className="mb-4 text-xl font-semibold">IT Portal Login</h1>
      <div className="mb-3">
        <label>Username</label>
        <input className="w-full border rounded px-2 py-1" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Username"/>
      </div>
      <div className="mb-3">
        <label>Password</label>
        <input type="password" className="w-full border rounded px-2 py-1" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password"/>
      </div>
      <div className="mb-3">
        <label>Role</label>
        <select className="w-full border rounded px-2 py-1" value={role} onChange={(e)=>setRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="tech">Tech</option>
        </select>
      </div>
      <button className="w-full bg-blue-600 text-white rounded px-4 py-2" onClick={login}>Login</button>
    </div>
  );
}
