"use client";

import React, { useState } from 'react';

/**
 * INTERNAL DEPARTMENT MESSENGER (WebSocket-Ready)
 * Enables real-time coordination between Transport, Production, and Admin.
 */
export const InternalMessenger = ({ currentDept = "TRANSPORT" }) => {
  const [messages, setMessages] = useState([
    { from: "FACTORY", text: "Batch #SH-220 is delayed by 10 mins.", time: "12:01" },
    { from: "ADMIN", text: "Please use Station 04 for urgent items.", time: "12:05" }
  ]);

  return (
    <div style={{
      width: '350px', height: '500px', backgroundColor: '#fff',
      borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      <header style={{ backgroundColor: '#1A365D', color: '#fff', padding: '1rem', fontWeight: 'bold' }}>
        Inter-Dept Messenger [{currentDept}]
      </header>

      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: '#f8fafc' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#1A365D' }}>{m.from} <span style={{ opacity: 0.5 }}>{m.time}</span></div>
            <div style={{ background: '#fff', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '4px', fontSize: '0.9rem' }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid #eee' }}>
        <input
          placeholder="Broadcast to all departments..."
          style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>
    </div>
  );
};
