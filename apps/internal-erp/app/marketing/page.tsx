"use client";

import React from 'react';

/**
 * MARKETING DEPARTMENT PORTAL (CREATIVE EDITORIAL)
 * Managing campaigns and loyalty programs.
 */
export default function MarketingPortal() {
  return (
    <div style={{ backgroundColor: '#fff', color: '#D81B60', minHeight: '100vh', padding: '3rem', fontFamily: 'Playfair Display, serif' }}>
      <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#666', fontFamily: 'Inter, sans-serif' }}>Brand & Campaigns</div>
          <h1 style={{ fontSize: '3rem', margin: 0 }}>The Creative Engine</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Active Campaigns: 04</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.6, fontFamily: 'Inter, sans-serif' }}>Loyalty Users: 12,400</div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
        <section>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Current Campaigns</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: '#FCE4EC', padding: '2rem', borderRadius: '24px' }}>
              <h3 style={{ margin: 0 }}>Summer Fresh 15</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#880E4F' }}>15% off all dry cleaning services for residents of The Pearl.</p>
              <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>ROI: +22%</div>
            </div>
            <div style={{ background: '#F3E5F5', padding: '2rem', borderRadius: '24px' }}>
              <h3 style={{ margin: 0 }}>Eid Gifting</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#4A148C' }}>Buy 5, Get 1 Free Thobe Pressing vouchers.</p>
              <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>ROI: +18%</div>
            </div>
          </div>
        </section>

        <section style={{ borderLeft: '1px solid #eee', paddingLeft: '3rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Loyalty Engine</h3>
          <div style={{ background: '#fff', border: '1px solid #D81B60', padding: '1.5rem', borderRadius: '12px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Point Multiplier</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>2.5x</div>
            <p style={{ fontSize: '0.75rem' }}>Active for "Platinum Tier" corporate clients.</p>
            <button style={{ background: '#D81B60', color: '#fff', border: 'none', width: '100%', padding: '0.8rem', borderRadius: '8px', marginTop: '1rem', cursor: 'pointer' }}>Adjust Rewards</button>
          </div>
        </section>
      </div>
    </div>
  );
}
