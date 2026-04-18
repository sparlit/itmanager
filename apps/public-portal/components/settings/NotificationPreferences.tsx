"use client";

import React, { useState } from 'react';

/**
 * NOTIFICATION PREFERENCE CENTER
 * Allows customers to opt-in/out of WhatsApp, SMS, and Email alerts.
 */
export const NotificationPreferences = () => {
  const [prefs, setPrefs] = useState({
    whatsapp: true,
    sms: false,
    email: true,
    marketing: false
  });

  return (
    <div style={{ maxWidth: '500px', padding: '2rem', background: '#fff', borderRadius: '12px', border: '1px solid #ddd' }}>
      <h3 style={{ color: '#1A365D', marginBottom: '1.5rem' }}>Communication Preferences</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Object.entries(prefs).map(([key, val]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{key} Alerts</span>
            <input
              type="checkbox"
              checked={val}
              onChange={() => setPrefs(prev => ({ ...prev, [key]: !val }))}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>
        ))}
      </div>

      <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#666' }}>
        * Critical order status updates (Ready for Pickup/Delivery) will always be sent via your primary channel (WhatsApp).
      </p>

      <button style={{
        marginTop: '1.5rem', width: '100%', padding: '1rem',
        background: '#1A365D', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
      }}>
        Save Preferences
      </button>
    </div>
  );
};
