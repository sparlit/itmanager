"use client";

import React from 'react';

/**
 * TRANSPORT DEPARTMENT PORTAL (LOGISTICS THEME)
 */
export default function TransportPortal() {
  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      color: '#F1C40F',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#F1C40F' }}>Transport & Logistics Dashboard</h1>
        <div style={{ backgroundColor: '#333', padding: '0.5rem 1rem', borderRadius: '4px' }}>
          Status: <span style={{ color: '#2ecc71' }}>ONLINE</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
        <aside style={{ backgroundColor: '#262626', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>Pending Pickups</h3>
          <div style={{ marginTop: '1rem' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ backgroundColor: '#333', padding: '1rem', marginBottom: '1rem', borderLeft: '4px solid #F1C40F' }}>
                <div style={{ fontWeight: 'bold' }}>Order #PRN-100{i}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Zone 66, St 840, Bld 12</div>
                <button style={{ marginTop: '0.5rem', background: '#F1C40F', color: '#000', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>Assign Driver</button>
              </div>
            ))}
          </div>
        </aside>

        <main style={{ backgroundColor: '#262626', borderRadius: '8px', padding: '1.5rem', height: '600px', display: 'flex', flexDirection: 'column' }}>
          <h3>Route Optimization (Qatar North/South)</h3>
          <div style={{ flex: 1, backgroundColor: '#111', marginTop: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#444' }}>
            [ OSM REAL-TIME FLEET TRACKING MAP LOADED HERE ]
          </div>
        </main>
      </div>
    </div>
  );
}
