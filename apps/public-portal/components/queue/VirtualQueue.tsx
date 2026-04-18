"use client";

import React, { useState } from 'react';

/**
 * VIRTUAL QUEUE & TOKEN SYSTEM (WCAG 2.1 AA COMPLIANT)
 * Allows walk-in customers to join the retail branch queue digitally.
 */
export const VirtualQueue = () => {
  const [ticket, setTicket] = useState<string | null>(null);
  const [waitingCount, setWaitingCount] = useState(12);

  const joinQueue = () => {
    setTicket(`PRN-${Math.floor(100 + Math.random() * 900)}`);
  };

  return (
    <div
      style={{ padding: '2rem', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '2px solid #1A365D' }}
      aria-labelledby="queue-heading"
    >
      <h2 id="queue-heading" style={{ color: '#1A365D' }}>Branch Queue Monitor</h2>
      <p style={{ fontSize: '1.2rem' }} aria-live="polite">Current Wait Time: <strong>~15 mins</strong></p>
      <p style={{ color: '#666' }}>{waitingCount} customers ahead of you.</p>

      {!ticket ? (
        <button
          onClick={joinQueue}
          aria-label="Join the virtual queue for West Bay branch"
          style={{
            marginTop: '1.5rem',
            background: '#1A365D',
            color: '#fff',
            padding: '1rem 2rem',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            outline: '3px solid transparent' // For high-contrast focus
          }}
          onFocus={(e) => e.currentTarget.style.outline = '3px solid #D4AF37'}
          onBlur={(e) => e.currentTarget.style.outline = '3px solid transparent'}
        >
          Join Virtual Queue
        </button>
      ) : (
        <div style={{ marginTop: '2rem', padding: '2rem', background: '#EBF8FF', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.9rem', color: '#1A365D' }}>YOUR VIRTUAL TICKET</div>
          <div
            style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#1A365D' }}
            aria-label={`Your ticket number is ${ticket}`}
          >
            {ticket}
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>We will send a WhatsApp when it is your turn.</p>
        </div>
      )}
    </div>
  );
};
