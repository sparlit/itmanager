"use client";

import React from 'react';

/**
 * PRODUCTION DEPARTMENT PORTAL (INDUSTRIAL MINIMALIST)
 * High-speed interface for factory floor scanning.
 */
export default function ProductionPortal() {
  return (
    <div style={{
      backgroundColor: '#f0f0f0',
      color: '#333',
      minHeight: '100vh',
      padding: '1rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <header style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #E67E22' }}>
        <h2 style={{ margin: 0 }}>FACTORY_FLOOR // PRODUCTION</h2>
        <div style={{ fontWeight: 'bold' }}>BATCH: #2025-05-20-A</div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>SCAN_INCOMING_ITEM</h3>
          <div style={{ height: '150px', border: '2px dashed #ccc', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999', marginBottom: '1rem' }}>
            [ WAITING FOR BARCODE / RFID SCAN ]
          </div>
          <input
            type="text"
            placeholder="Manual Entry ID..."
            style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>ACTIVE_WORKFLOW_QUEUE</h3>
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#fff9f4', border: '1px solid #ffe8d1', marginBottom: '0.5rem' }}>
              <span>#PRN-10022 [Men's Suit]</span>
              <span style={{ color: '#E67E22', fontWeight: 'bold' }}>WASHING</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#f4f9ff', border: '1px solid #d1e8ff', marginBottom: '0.5rem' }}>
              <span>#PRN-10025 [Silk Abaya]</span>
              <span style={{ color: '#2980B9', fontWeight: 'bold' }}>DRY_CLEANING</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#f4fff4', border: '1px solid #d1ffd1', marginBottom: '0.5rem' }}>
              <span>#PRN-10019 [Bed Linen]</span>
              <span style={{ color: '#27AE60', fontWeight: 'bold' }}>IRONING</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1rem', backgroundColor: '#333', color: '#fff', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
        STATION_ID: ST_04 | OPERATOR: AHMED_K | SHIFT: MORNING
      </div>
    </div>
  );
}
