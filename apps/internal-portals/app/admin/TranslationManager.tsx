"use client";

import React, { useState } from 'react';

/**
 * TRANSLATION MANAGEMENT SYSTEM (TMS)
 * Weblate-style JSON editor for dynamic Arabic updates.
 */
export const TranslationManager = () => {
  const [translations, setTranslations] = useState({
    'ORDER_READY': 'طلبك جاهز للتسليم',
    'PICKUP_SCHEDULED': 'تم تحديد موعد الاستلام',
    'WASHING': 'جاري الغسيل'
  });

  const updateTranslation = (key: string, value: string) => {
    setTranslations({ ...translations, [key]: value });
  };

  return (
    <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #ddd' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h3>Arabic (Qatar) Translation Management</h3>
        <button style={{ background: '#1A365D', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px' }}>Deploy to Portal</button>
      </header>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
            <th style={{ padding: '0.5rem' }}>System Key</th>
            <th style={{ padding: '0.5rem' }}>Arabic Translation</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(translations).map(([key, val]) => (
            <tr key={key} style={{ borderBottom: '1px solid #f9f9f9' }}>
              <td style={{ padding: '0.8rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>{key}</td>
              <td style={{ padding: '0.8rem' }}>
                <input
                  value={val}
                  onChange={(e) => updateTranslation(key, e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', direction: 'rtl', fontFamily: 'Inter, sans-serif' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
