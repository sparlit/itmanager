"use client";

import React from 'react';

/**
 * PROCUREMENT & CONSUMABLES PORTAL
 * Managing detergents, chemicals, and hangers for the factory.
 */
export default function ProcurementPortal() {
  const inventory = [
    { item: "Industrial Detergent (Alpha)", stock: "140L", min: "200L", status: "LOW" },
    { item: "Eco-Softener (Blue)", stock: "450L", min: "100L", status: "OK" },
    { item: "Wire Hangers (Standard)", stock: "12,000", min: "5,000", status: "OK" },
    { item: "Perchloroethylene (Dry Clean)", stock: "15L", min: "50L", status: "CRITICAL" }
  ];

  return (
    <div style={{ backgroundColor: '#fff', color: '#333', minHeight: '100vh', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ borderBottom: '2px solid #D35400', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ color: '#D35400', margin: 0 }}>Procurement & Inventory</h1>
        <button style={{ background: '#D35400', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>Create Purchase Order</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        {inventory.map(item => (
          <div key={item.item} style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '12px', backgroundColor: item.status === 'OK' ? '#f0fff4' : '#fff5f5' }}>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>{item.item}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{item.stock}</div>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 'bold',
              color: item.status === 'OK' ? '#27AE60' : '#C0392B'
            }}>
              STATUS: {item.status} (Min: {item.min})
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#f9f9f9', padding: '2rem', borderRadius: '12px' }}>
        <h3>AI_PREDICTIVE_RESTOCK_AGENT</h3>
        <p style={{ color: '#666' }}>Based on current order volume and upcoming <strong>Eid Al-Adha</strong> peak, the system recommends restocking <strong>Industrial Detergent</strong> by May 25th.</p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <button style={{ border: '1px solid #D35400', color: '#D35400', background: 'none', padding: '0.5rem 1rem', borderRadius: '4px' }}>View Usage Forecast</button>
          <button style={{ border: '1px solid #D35400', color: '#D35400', background: 'none', padding: '0.5rem 1rem', borderRadius: '4px' }}>Manage Suppliers</button>
        </div>
      </div>
    </div>
  );
}
