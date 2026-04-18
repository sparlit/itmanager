"use client";

import React, { useState } from 'react';
import { QatarLocationPicker } from '../../components/checkout/QatarLocationPicker';

export default function OrderPage() {
  const [address, setAddress] = useState({
    zone: '',
    street: '',
    building: '',
    unit: '',
    lat: 25.2854,
    lng: 51.5310
  });

  const handleLocationSelect = (lat: number, lng: number) => {
    setAddress(prev => ({ ...prev, lat, lng }));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ color: '#1A365D', fontFamily: 'Playfair Display, serif' }}>Schedule Your Luxury Pickup</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Qatar Zone</label>
          <input
            type="text"
            placeholder="e.g. 66"
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
            onChange={(e) => setAddress(prev => ({ ...prev, zone: e.target.value }))}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Street Number</label>
          <input
            type="text"
            placeholder="e.g. 840"
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
            onChange={(e) => setAddress(prev => ({ ...prev, street: e.target.value }))}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Building / Villa Number</label>
          <input
            type="text"
            placeholder="e.g. 12"
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
            onChange={(e) => setAddress(prev => ({ ...prev, building: e.target.value }))}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Unit / Apt (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Apt 4B"
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
            onChange={(e) => setAddress(prev => ({ ...prev, unit: e.target.value }))}
          />
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Pin Your Exact Location</h3>
      <QatarLocationPicker onLocationSelect={handleLocationSelect} />

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#EBF8FF', borderRadius: '12px' }}>
        <h4 style={{ color: '#1A365D' }}>Selected Coordinates:</h4>
        <p>Latitude: {address.lat.toFixed(6)} | Longitude: {address.lng.toFixed(6)}</p>
        <button
          style={{
            marginTop: '1rem',
            background: '#1A365D',
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            width: '100%',
            fontWeight: 'bold'
          }}
          onClick={() => alert(`Order scheduled for Zone ${address.zone}`)}
        >
          Confirm Pickup Schedule
        </button>
      </div>
    </div>
  );
}
