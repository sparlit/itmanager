"use client";

import React from 'react';

/**
 * CUSTOMER SERVICE PORTAL (SERENE & HELPFUL)
 * Multi-channel support desk for Qatar residents.
 */
export default function CustomerServicePortal() {
  const tickets = [
    { id: "T-882", user: "Mohammed A.", channel: "WhatsApp", issue: "Reschedule Pickup", status: "URGENT" },
    { id: "T-884", user: "Fatima K.", channel: "Live Chat", issue: "Missing Item Found", status: "SOLVED" },
    { id: "T-885", user: "Sheraton Doha", channel: "B2B Dashboard", issue: "Bulk Invoice Query", status: "OPEN" }
  ];

  return (
    <div style={{ backgroundColor: '#E0F2F1', minHeight: '100vh', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: '#00695C', margin: 0 }}>Customer Happiness Hub</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ backgroundColor: '#fff', padding: '0.5rem 1rem', borderRadius: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            Agents Online: <strong>08</strong>
          </div>
          <div style={{ backgroundColor: '#fff', padding: '0.5rem 1rem', borderRadius: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            Avg Response: <strong>2.4m</strong>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
        <main style={{ background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#00695C' }}>Active Ticket Queue</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e0f2f1', color: '#888', fontSize: '0.8rem' }}>
                <th style={{ padding: '1rem' }}>ID</th>
                <th style={{ padding: '1rem' }}>Customer</th>
                <th style={{ padding: '1rem' }}>Channel</th>
                <th style={{ padding: '1rem' }}>Subject</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{t.id}</td>
                  <td style={{ padding: '1rem' }}>{t.user}</td>
                  <td style={{ padding: '1rem' }}>{t.channel}</td>
                  <td style={{ padding: '1rem' }}>{t.issue}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      backgroundColor: t.status === 'URGENT' ? '#FFEBEE' : '#E8F5E9',
                      color: t.status === 'URGENT' ? '#C62828' : '#2E7D32',
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold'
                    }}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>

        <aside>
          <div style={{ background: '#00695C', color: '#fff', padding: '1.5rem', borderRadius: '16px', marginBottom: '1rem' }}>
            <h4>AI_SENTIMENT_ANALYSIS</h4>
            <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>Global customer sentiment is <strong>94% POSITIVE</strong> today. No major delivery bottlenecks reported in Doha West.</p>
          </div>
          <button style={{ width: '100%', background: '#fff', border: '1px solid #00695C', color: '#00695C', padding: '1rem', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            Launch Live Chat Hub
          </button>
        </aside>
      </div>
    </div>
  );
}
