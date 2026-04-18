"use client";

import React from 'react';
import { PORTAL_CONFIG } from '../../config/portals';

/**
 * THE NAVIGATOR (PORTAL SELECTION INTERFACE)
 * Post-login central hub for authorized staff.
 */
export default function NavigatorPage() {
  // In production, this would be filtered by user.authorizedPortals
  const activePortals = PORTAL_CONFIG;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#121212',
      color: 'white',
      padding: '4rem 2rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'Playfair Display, serif', color: '#EBF8FF' }}>
            Internal Portal Navigator
          </h1>
          <p style={{ opacity: 0.7 }}>Select an authorized department to initialize session.</p>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          {activePortals.map(portal => (
            <div
              key={portal.id}
              onClick={() => alert(`Initializing ${portal.name}...`)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: `1px solid ${portal.color}44`,
                borderRadius: '12px',
                padding: '2rem 1rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${portal.color}22`;
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 10px 20px ${portal.color}33`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                fontSize: '2rem',
                marginBottom: '1rem',
                color: portal.color
              }}>
                ●
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{portal.name}</h3>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '4px',
                backgroundColor: portal.color
              }} />
            </div>
          ))}
        </div>

        <footer style={{ marginTop: '5rem', textAlign: 'center', opacity: 0.3, fontSize: '0.8rem' }}>
          SYSTEM CORE: PRISTINE_FOSS_V1 || QATAR_INSTANCE_01
        </footer>
      </div>
    </div>
  );
}
