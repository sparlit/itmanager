"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const QatarLocationPicker = dynamic(
  () => import('../../components/checkout/QatarLocationPicker').then(mod => ({ default: mod.QatarLocationPicker })),
  { ssr: false }
);

export default function OrderPage() {
  const [address, setAddress] = useState({
    label: '',
    zone: '',
    street: '',
    building: '',
    unit: '',
    lat: 25.2854,
    lng: 51.5310
  });
  const [hasPinned, setHasPinned] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleLocationSelect = (lat: number, lng: number) => {
    setAddress(prev => ({ ...prev, lat, lng }));
    setHasPinned(true);
    setErrors(prev => ({ ...prev, map: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!address.label.trim()) {
      newErrors.label = 'Address label is required';
    }
    if (!address.zone.trim()) {
      newErrors.zone = 'Zone is required';
    }
    if (!address.street.trim()) {
      newErrors.street = 'Street number is required';
    }
    if (!address.building.trim()) {
      newErrors.building = 'Building/Villa number is required';
    }
    if (!hasPinned) {
      newErrors.map = 'Please pin your exact location on the map';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        label: address.label,
        zone: address.zone,
        street: address.street,
        building: address.building,
        unitNumber: address.unit || undefined,
        lat: address.lat,
        lng: address.lng
      };

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const result = await response.json();
      // Redirect to success page or order details
      window.location.href = `/order/confirmation/${result.orderId}`;
    } catch (error) {
      setErrors({ submit: (error as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ color: '#1A365D', fontFamily: 'Playfair Display, serif' }}>Schedule Your Luxury Pickup</h1>

      {errors.submit && (
        <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#fee', color: '#c00', borderRadius: '8px', border: '1px solid #c00' }}>
          {errors.submit}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Address Label *</label>
          <input
            type="text"
            placeholder="e.g. Home, Office"
            value={address.label}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '8px',
              border: errors.label ? '2px solid #c00' : '1px solid #ddd'
            }}
            onChange={(e) => {
              setAddress(prev => ({ ...prev, label: e.target.value }));
              setErrors(prev => ({ ...prev, label: '' }));
            }}
          />
          {errors.label && <div style={{ color: '#c00', fontSize: '0.85rem', marginTop: '0.25rem' }}>{errors.label}</div>}
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Qatar Zone *</label>
          <input
            type="text"
            placeholder="e.g. 66"
            value={address.zone}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '8px',
              border: errors.zone ? '2px solid #c00' : '1px solid #ddd'
            }}
            onChange={(e) => {
              setAddress(prev => ({ ...prev, zone: e.target.value }));
              setErrors(prev => ({ ...prev, zone: '' }));
            }}
          />
          {errors.zone && <div style={{ color: '#c00', fontSize: '0.85rem', marginTop: '0.25rem' }}>{errors.zone}</div>}
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Street Number *</label>
          <input
            type="text"
            placeholder="e.g. 840"
            value={address.street}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '8px',
              border: errors.street ? '2px solid #c00' : '1px solid #ddd'
            }}
            onChange={(e) => {
              setAddress(prev => ({ ...prev, street: e.target.value }));
              setErrors(prev => ({ ...prev, street: '' }));
            }}
          />
          {errors.street && <div style={{ color: '#c00', fontSize: '0.85rem', marginTop: '0.25rem' }}>{errors.street}</div>}
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Building / Villa Number *</label>
          <input
            type="text"
            placeholder="e.g. 12"
            value={address.building}
            style={{
              width: '100%',
              padding: '0.8rem',
              borderRadius: '8px',
              border: errors.building ? '2px solid #c00' : '1px solid #ddd'
            }}
            onChange={(e) => {
              setAddress(prev => ({ ...prev, building: e.target.value }));
              setErrors(prev => ({ ...prev, building: '' }));
            }}
          />
          {errors.building && <div style={{ color: '#c00', fontSize: '0.85rem', marginTop: '0.25rem' }}>{errors.building}</div>}
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold' }}>Unit / Apt (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Apt 4B"
            value={address.unit}
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
            onChange={(e) => setAddress(prev => ({ ...prev, unit: e.target.value }))}
          />
        </div>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Pin Your Exact Location *</h3>
      <QatarLocationPicker onLocationSelect={handleLocationSelect} />
      {errors.map && <div style={{ color: '#c00', fontSize: '0.85rem', marginTop: '0.5rem' }}>{errors.map}</div>}

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#EBF8FF', borderRadius: '12px' }}>
        <h4 style={{ color: '#1A365D' }}>Selected Coordinates:</h4>
        <p>
          Latitude: {address.lat.toFixed(6)} | Longitude: {address.lng.toFixed(6)}
          {hasPinned && <span style={{ color: '#2ecc71', marginLeft: '1rem' }}>✓ Pinned</span>}
        </p>
        <button
          style={{
            marginTop: '1rem',
            background: submitting ? '#999' : '#1A365D',
            color: 'white',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '8px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            width: '100%',
            fontWeight: 'bold',
            opacity: submitting ? 0.6 : 1
          }}
          onClick={submitOrder}
          disabled={submitting}
        >
          {submitting ? 'Scheduling...' : 'Confirm Pickup Schedule'}
        </button>
      </div>
    </div>
  );
}