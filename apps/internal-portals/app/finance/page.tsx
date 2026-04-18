"use client";

import React from 'react';

/**
 * FINANCE DEPARTMENT PORTAL (AUDIT THEME)
 */
export default function FinancePortal() {
  return (
    <div style={{
      backgroundColor: '#f4f7f6',
      color: '#1b5e20',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: '"Inter", sans-serif'
    }}>
      <header style={{ borderBottom: '2px solid #1b5e20', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Finance & Audit Control</h1>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Balance: 1,240,500 QAR</div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h4 style={{ color: '#666', margin: 0 }}>Daily Revenue</h4>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>42,300 QAR</div>
          <div style={{ color: '#2e7d32', fontSize: '0.8rem' }}>↑ 12% from yesterday</div>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h4 style={{ color: '#666', margin: 0 }}>Pending Invoices</h4>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>18</div>
          <div style={{ color: '#c62828', fontSize: '0.8rem' }}>Total: 125,000 QAR</div>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h4 style={{ color: '#666', margin: 0 }}>QPay Sync Status</h4>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2e7d32' }}>ACTIVE</div>
          <div style={{ color: '#666', fontSize: '0.8rem' }}>Last Sync: 5 mins ago</div>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3>Recent Corporate Transactions</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '1rem' }}>Date</th>
              <th style={{ padding: '1rem' }}>Client</th>
              <th style={{ padding: '1rem' }}>Service</th>
              <th style={{ padding: '1rem' }}>Amount</th>
              <th style={{ padding: '1rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f9f9f9' }}>
              <td style={{ padding: '1rem' }}>2025-05-20</td>
              <td style={{ padding: '1rem' }}>Sheraton Grand Doha</td>
              <td style={{ padding: '1rem' }}>Linen Bulk Wash</td>
              <td style={{ padding: '1rem' }}>15,200 QAR</td>
              <td style={{ padding: '1rem', color: '#2e7d32' }}>PAID</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f9f9f9' }}>
              <td style={{ padding: '1rem' }}>2025-05-19</td>
              <td style={{ padding: '1rem' }}>Hamad Hospital</td>
              <td style={{ padding: '1rem' }}>Uniform Sanitization</td>
              <td style={{ padding: '1rem' }}>28,000 QAR</td>
              <td style={{ padding: '1rem', color: '#f9a825' }}>PENDING</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
