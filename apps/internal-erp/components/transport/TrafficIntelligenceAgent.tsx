"use client";

import React, { useState, useEffect } from 'react';

/**
 * DOHA TRAFFIC INTELLIGENCE AGENT (OSRM Integration)
 * Predicts delivery delays based on real-time Qatari traffic data.
 */
export const TrafficIntelligenceAgent = () => {
  const [trafficLevel, setTrafficLevel] = useState('NORMAL');
  const [impactedZones, setImpactedZones] = useState<string[]>([]);

  useEffect(() => {
    // Simulate real-time data fetch from Doha Traffic API / OSRM
    const zones = ["Zone 66 (West Bay)", "Zone 61 (Dafna)", "Corniche Street"];
    setImpactedZones(zones);
    setTrafficLevel('HEAVY');
  }, []);

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      color: '#FFB703',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid #FFB703',
      boxShadow: '0 0 15px rgba(255, 183, 3, 0.2)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>AI_TRAFFIC_AGENT</h3>
        <span style={{
          backgroundColor: trafficLevel === 'HEAVY' ? '#B71C1C' : '#27AE60',
          color: '#fff',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.7rem'
        }}>
          {trafficLevel}
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#fff', opacity: 0.8 }}>
        Congestion detected near <strong>Lusail Expressway</strong>. ETAs for Zone 66 adjusted +15 mins.
      </p>

      <div style={{ marginTop: '1rem' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.5rem' }}>Impacted Delivery Areas:</div>
        <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
          {impactedZones.map(zone => (
            <li key={zone} style={{ marginBottom: '4px' }}>{zone}</li>
          ))}
        </ul>
      </div>

      <button style={{
        marginTop: '1.5rem',
        width: '100%',
        backgroundColor: 'transparent',
        border: '1px solid #FFB703',
        color: '#FFB703',
        padding: '0.5rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8rem'
      }}>
        REOPTIMIZE_ACTIVE_ROUTES
      </button>
    </div>
  );
};
