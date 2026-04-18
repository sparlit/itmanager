"use client";

import React, { useState } from 'react';

/**
 * ARRIVAL CONDITION CAPTURE MODULE
 * Mandatory for luxury items > 1,000 QAR.
 * Prevents damage disputes with timestamped visual evidence.
 */
export const ArrivalConditionCapture = ({ itemId, itemName = "Silk Abaya" }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [status, setStatus] = useState('PENDING_PHOTOS');

  const addPhoto = (url: string) => {
    if (photos.length < 3) {
      setPhotos([...photos, url]);
    }
  };

  return (
    <div style={{ padding: '2rem', background: '#fff', borderRadius: '12px', border: '2px solid #D4AF37' }}>
      <h3 style={{ color: '#D4AF37' }}>Pre-Wash Condition Proof: {itemName}</h3>
      <p style={{ fontSize: '0.85rem', color: '#666' }}>
        Rule: 3 distinct photos (Front, Back, Details) required for luxury garments.
      </p>

      <div style={{ display: 'flex', gap: '1rem', margin: '1.5rem 0' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: '100px', height: '100px', background: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #ccc' }}>
            {photos[i] ? <img src={photos[i]} style={{ width: '100%' }} /> : <span style={{ fontSize: '2rem', color: '#ccc' }}>+</span>}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          disabled={photos.length < 3}
          style={{
            background: photos.length < 3 ? '#ccc' : '#27AE60',
            color: 'white',
            padding: '0.8rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold'
          }}
        >
          {photos.length < 3 ? `Upload ${3 - photos.length} more` : 'Authorize Wash Cycle'}
        </button>
        <div style={{ fontSize: '0.7rem', color: '#888' }}>
          Geo-Tag: 25.2854, 51.5310 | 12:45:01 PM
        </div>
      </div>
    </div>
  );
};
