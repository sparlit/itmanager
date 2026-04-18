"use client";

import React from 'react';

/**
 * IT DEPARTMENT PORTAL (SCI-FI THEME)
 */
export default function ITPortal() {
  const stats = [
    { label: "Server Load", value: "24%", color: "#00FF41" },
    { label: "Active Nodes", value: "12/12", color: "#00FF41" },
    { label: "Database Ping", value: "14ms", color: "#00FF41" },
    { label: "Security Status", value: "OPTIMAL", color: "#00FF41" }
  ];

  return (
    <div style={{
      backgroundColor: '#000',
      color: '#00FF41',
      minHeight: '100vh',
      fontFamily: 'monospace',
      padding: '2rem'
    }}>
      <header style={{ borderBottom: '1px solid #00FF41', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>[ DEPT_IT // CORE_MONITOR ]</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
        {stats.map(s => (
          <div key={s.label} style={{ border: '1px solid #00FF41', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{s.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ border: '1px solid #00FF41', padding: '1.5rem' }}>
          <h3>SYSTEM_LOGS</h3>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, height: '300px', overflowY: 'auto' }}>
            <p>[12:04:01] AUTH_SUCCESS: USER_743_ADMIN</p>
            <p>[12:05:22] DB_SYNC_COMPLETED: QATAR_MAIN_CLUSTER</p>
            <p>[12:08:44] BACKUP_INITIATED: WEEKLY_SNAPSHOT_02</p>
            <p>[12:15:00] API_KEY_ROTATED: QPAY_SECURE_V3</p>
            <p style={{ color: '#fff' }}>_</p>
          </div>
        </div>

        <div style={{ border: '1px solid #00FF41', padding: '1.5rem' }}>
          <h3>QUICK_ACTIONS</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '1rem' }}><button style={{ background: 'transparent', color: '#00FF41', border: '1px solid #00FF41', width: '100%', padding: '0.5rem', cursor: 'pointer' }}>REBOOT_MODULE_BUS</button></li>
            <li style={{ marginBottom: '1rem' }}><button style={{ background: 'transparent', color: '#00FF41', border: '1px solid #00FF41', width: '100%', padding: '0.5rem', cursor: 'pointer' }}>FLUSH_REDIS_CACHE</button></li>
            <li style={{ marginBottom: '1rem' }}><button style={{ background: 'transparent', color: '#00FF41', border: '1px solid #00FF41', width: '100%', padding: '0.5rem', cursor: 'pointer' }}>INIT_SECURITY_SCAN</button></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
