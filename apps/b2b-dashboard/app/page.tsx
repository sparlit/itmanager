"use client";

import React from 'react';

/**
 * B2B CORPORATE CLIENT DASHBOARD
 * White-labeled for high-volume partners (e.g. Hotels)
 */
export default function B2BDashboard({ clientName = "Sheraton Doha" }) {
  const metrics = [
    { label: "Active Orders", value: "14", trend: "Normal" },
    { label: "kg Cleaned (MTD)", value: "1,240 kg", trend: "+12%" },
    { label: "Current Balance", value: "4,200 QAR", trend: "Due in 5 days" }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', color: '#1e293b', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar (Corporate Neutral) */}
      <nav style={{ width: '250px', position: 'fixed', height: '100%', borderRight: '1px solid #e2e8f0', padding: '2rem' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '3rem', color: '#1A365D' }}>PRISTINE_B2B</div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '10px 0', color: '#1A365D', fontWeight: 'bold' }}>Dashboard</li>
          <li style={{ padding: '10px 0', opacity: 0.6 }}>Order History</li>
          <li style={{ padding: '10px 0', opacity: 0.6 }}>Statements & Invoices</li>
          <li style={{ padding: '10px 0', opacity: 0.6 }}>Contract Details</li>
          <li style={{ padding: '10px 0', opacity: 0.6 }}>Support Hub</li>
        </ul>
      </nav>

      <main style={{ marginLeft: '250px', padding: '3rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
          <h1>Welcome, {clientName}</h1>
          <button style={{ backgroundColor: '#1A365D', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Request Urgent Pickup
          </button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '4rem' }}>
          {metrics.map(m => (
            <div key={m.label} style={{ padding: '2rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '0.5rem' }}>{m.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1A365D' }}>{m.value}</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#27AE60' }}>{m.trend}</div>
            </div>
          ))}
        </div>

        <section style={{ backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '12px' }}>
          <h3>Recent Garment Status</h3>
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
              <span>Batch #SH-220 (Uniforms)</span>
              <span style={{ color: '#E67E22', fontWeight: 'bold' }}>IN_PRODUCTION</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
              <span>Batch #SH-218 (Linens)</span>
              <span style={{ color: '#27AE60', fontWeight: 'bold' }}>DELIVERED</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
