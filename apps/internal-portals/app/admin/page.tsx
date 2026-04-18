"use client";

import React from 'react';

/**
 * ADMINISTRATION PORTAL (EXECUTIVE THEME)
 */
export default function AdminPortal() {
  return (
    <div style={{
      backgroundColor: '#F4F7F6',
      color: '#2C3E50',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #2C3E50', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Global Administration Control</h1>
        <div>Admin ID: PRN_001</div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <section style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3>System Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Public Portal Status</span>
              <span style={{ color: '#27AE60', fontWeight: 'bold' }}>ONLINE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Maintenance Mode</span>
              <span style={{ color: '#E74C3C', fontWeight: 'bold' }}>OFF</span>
            </div>
            <button style={{ background: '#2C3E50', color: '#fff', padding: '0.5rem', border: 'none', borderRadius: '4px' }}>Global Config Update</button>
          </div>
        </section>

        <section style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3>User Role Management</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                <th>User</th>
                <th>Department</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ahmed K.</td>
                <td>Production</td>
                <td>Manager</td>
              </tr>
              <tr>
                <td>Sarah L.</td>
                <td>Finance</td>
                <td>Editor</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
