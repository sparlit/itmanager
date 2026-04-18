"use client";

import React from 'react';

/**
 * VENDOR PORTAL (SUPPLY CHAIN EFFICIENCY)
 * Restricted access for detergent and consumable suppliers.
 */
export default function VendorPortal({ vendorName = "Qatar Chemical Industires" }) {
  const pendingPOs = [
    { id: "PO-4402", date: "2025-05-18", item: "Industrial Detergent", qty: "500L", status: "PENDING_ACK" },
    { id: "PO-4405", date: "2025-05-20", item: "Wire Hangers", qty: "10,000", status: "SHIPPED" }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#334155', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ backgroundColor: '#1E293B', color: '#fff', padding: '1.5rem 3rem', display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Supplier Portal: {vendorName}</h2>
        <div>Logged in as: Logistics_Contact</div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <section style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3>Pending Purchase Orders</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1.5rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #F1F5F9' }}>
                  <th style={{ padding: '1rem' }}>PO #</th>
                  <th style={{ padding: '1rem' }}>Item</th>
                  <th style={{ padding: '1rem' }}>Qty</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingPOs.map(po => (
                  <tr key={po.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{po.id}</td>
                    <td style={{ padding: '1rem' }}>{po.item}</td>
                    <td style={{ padding: '1rem' }}>{po.qty}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px',
                        backgroundColor: po.status === 'SHIPPED' ? '#ECFDF5' : '#FFF7ED',
                        color: po.status === 'SHIPPED' ? '#059669' : '#C2410C'
                      }}>{po.status}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Update Status</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h4>Upload Digital Invoice</h4>
              <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Upload PDF invoices for automatic Finance reconciliation.</p>
              <div style={{ border: '2px dashed #CBD5E1', padding: '2rem', textAlign: 'center', marginTop: '1rem' }}>
                Drag & Drop Files
              </div>
            </div>
            <div style={{ backgroundColor: '#1E293B', color: '#fff', padding: '1.5rem', borderRadius: '12px' }}>
              <h4>Supply Forecast</h4>
              <p style={{ fontSize: '0.8rem' }}>Predicted demand for June 2025: <strong>+15% increase</strong> in Detergent Alpha.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
