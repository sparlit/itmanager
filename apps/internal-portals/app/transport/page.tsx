"use client";

import React, { useState, useEffect } from 'react';

interface Pickup {
  id: string;
  orderNumber: string;
  zone: string;
  street: string;
  building: string;
}

/**
 * TRANSPORT DEPARTMENT PORTAL (LOGISTICS THEME)
 */
export default function TransportPortal() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingPickups();
  }, []);

  const fetchPendingPickups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transport/pending-pickups');
      if (!response.ok) throw new Error('Failed to fetch pickups');
      const data = await response.json();
      setPickups(data.pickups || []);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      // Fallback to placeholder data on error
      setPickups([
        { id: '1', orderNumber: 'PRN-1001', zone: '66', street: '840', building: '12' },
        { id: '2', orderNumber: 'PRN-1002', zone: '67', street: '841', building: '13' },
        { id: '3', orderNumber: 'PRN-1003', zone: '68', street: '842', building: '14' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onAssignDriver = async (pickupId: string) => {
    setAssigning(pickupId);
    try {
      const response = await fetch('/api/transport/assign-driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickupId })
      });

      if (!response.ok) throw new Error('Assignment failed');

      // Optimistically update UI
      setPickups(prev => prev.filter(p => p.id !== pickupId));

      // Or refetch to get fresh data
      // await fetchPendingPickups();
    } catch (err) {
      alert('Failed to assign driver: ' + (err as Error).message);
    } finally {
      setAssigning(null);
    }
  };

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
          {error && <div style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '0.5rem' }}>Error: {error}</div>}
          <div style={{ marginTop: '1rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', opacity: 0.7 }}>Loading pickups...</div>
            ) : pickups.length === 0 ? (
              <div style={{ textAlign: 'center', opacity: 0.7 }}>No pending pickups</div>
            ) : (
              pickups.map(pickup => (
                <div key={pickup.id} style={{ backgroundColor: '#333', padding: '1rem', marginBottom: '1rem', borderLeft: '4px solid #F1C40F' }}>
                  <div style={{ fontWeight: 'bold' }}>Order #{pickup.orderNumber}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Zone {pickup.zone}, St {pickup.street}, Bld {pickup.building}</div>
                  <button
                    onClick={() => onAssignDriver(pickup.id)}
                    disabled={assigning === pickup.id}
                    style={{
                      marginTop: '0.5rem',
                      background: assigning === pickup.id ? '#999' : '#F1C40F',
                      color: '#000',
                      border: 'none',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '4px',
                      cursor: assigning === pickup.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {assigning === pickup.id ? 'Assigning...' : 'Assign Driver'}
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        <main style={{ backgroundColor: '#262626', borderRadius: '8px', padding: '1.5rem', height: '600px', display: 'flex', flexDirection: 'column' }}>
          <h3>Route Optimization (Qatar North/South)</h3>
          <div style={{ flex: 1, backgroundColor: '#111', marginTop: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#444' }}>
            {/* TODO: Replace with interactive map component (Leaflet/Mapbox) */}
            {/* Example: <FleetTrackingMap pickups={pickups} /> */}
            [ OSM REAL-TIME FLEET TRACKING MAP - Integration pending ]
          </div>
        </main>
      </div>
    </div>
  );
}