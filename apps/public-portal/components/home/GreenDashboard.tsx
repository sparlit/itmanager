"use client";

import React from 'react';
import { EsgService } from '../../../../packages/logic/esg/esg-service';

/**
 * PUBLIC SUSTAINABILITY DASHBOARD
 * Displays real-time environmental impact to the customer.
 */
export const GreenDashboard = ({ totalWeightCleaned = 150 }) => {
  const metrics = EsgService.calculateImpact(totalWeightCleaned);
  const global = EsgService.getGlobalReport();

  return (
    <div style={{ padding: '2rem', background: '#F0FFF4', borderRadius: '16px', border: '1px solid #27AE60' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ fontSize: '2rem' }}>🌿</div>
        <div>
          <h2 style={{ margin: 0, color: '#1B5E20' }}>Your Pristine Eco-Impact</h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#2E7D32' }}>Cleaning your wardrobe, protecting Qatar’s ecosystem.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>Water Saved</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#27AE60' }}>{metrics.waterSaved.toFixed(0)} L</div>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>Eco-Points Earned</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#D4AF37' }}>{metrics.detergentEcoPoints.toFixed(0)}</div>
        </div>
      </div>

      <footer style={{ marginTop: '2rem', borderTop: '1px solid #C6F6D5', paddingTop: '1rem', fontSize: '0.8rem', color: '#2E7D32' }}>
        <strong>Global Pristine Impact:</strong> {global.totalWaterSaved} of water saved to date.
      </footer>
    </div>
  );
};
