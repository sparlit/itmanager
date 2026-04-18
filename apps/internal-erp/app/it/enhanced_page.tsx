"use client";

import React, { useState } from 'react';

/**
 * IT PORTAL ENHANCEMENTS (V5.0)
 * Includes Asset Management and Sandbox Practice Mode.
 */
export default function ITPortalEnhanced() {
  const [sandboxMode, setSandboxMode] = useState(false);
  const itAssets = [
    { id: "SRV-01", type: "Server", status: "ONLINE", location: "Doha Data Center" },
    { id: "RTR-02", type: "Router", status: "ONLINE", location: "West Bay Branch" },
    { id: "TAB-44", type: "Driver Tablet", status: "OFFLINE", location: "In Transit" }
  ];

  return (
    <div style={{
      backgroundColor: sandboxMode ? '#1e1e2e' : '#000',
      color: sandboxMode ? '#fab387' : '#00FF41',
      minHeight: '100vh', padding: '2rem', fontFamily: 'monospace'
    }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid currentColor' }}>
        <h1>{sandboxMode ? "[ SANDBOX_PRACTICE_ENV ]" : "[ DEPT_IT // CORE_SYSTEM ]"}</h1>
        <button
          onClick={() => setSandboxMode(!sandboxMode)}
          style={{ background: 'currentColor', color: '#000', border: 'none', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer' }}
        >
          TOGGLE_SANDBOX
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <section>
          <h3>IT_ASSET_REGISTER (RFID_SYNC)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid currentColor', opacity: 0.6 }}>
                <th>Asset_ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Current_Loc</th>
              </tr>
            </thead>
            <tbody>
              {itAssets.map(asset => (
                <tr key={asset.id}>
                  <td style={{ padding: '0.8rem 0' }}>{asset.id}</td>
                  <td>{asset.type}</td>
                  <td>{asset.status}</td>
                  <td>{asset.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <aside style={{ border: '1px solid currentColor', padding: '1.5rem' }}>
          <h3>BACKUP_INTEGRITY (PITR)</h3>
          <div style={{ fontSize: '0.8rem' }}>
            <p>Last Snapshot: 2025-05-20 23:59:58</p>
            <p>WAL Log Stream: ACTIVE</p>
            <p>MinIO Connectivity: OPTIMAL</p>
            <button style={{ width: '100%', marginTop: '1rem', background: 'transparent', border: '1px solid currentColor', color: 'currentColor', padding: '0.5rem' }}>REVERIFY_BACKUPS</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
