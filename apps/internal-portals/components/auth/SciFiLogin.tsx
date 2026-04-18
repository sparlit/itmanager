"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * SCI-FI EDEX-UI STYLE LOGIN COMPONENT
 * Specifically designed for the IT and Internal Main portals.
 */
export const SciFiLogin = () => {
  const [terminalText, setTerminalText] = useState<string[]>([]);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const logs = [
      "> INITIALIZING SECURE KERNEL...",
      "> CONNECTING TO QATAR CENTRAL DATABASE...",
      "> AUTHENTICATION MODULE LOADED.",
      "> READY FOR BIOMETRIC / ENCRYPTED INPUT."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setTerminalText(prev => [...prev, logs[i]]);
        i++;
      } else {
        setBooting(false);
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      backgroundColor: '#050505',
      color: '#00ff41',
      height: '100vh',
      fontFamily: 'monospace',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Background Scanline Effect */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
        backgroundSize: '100% 2px, 3px 100%',
        pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          width: '100%',
          maxWidth: '500px',
          border: '1px solid #00ff41',
          padding: '2rem',
          boxShadow: '0 0 20px rgba(0, 255, 65, 0.2)',
          backgroundColor: 'rgba(0,0,0,0.8)'
        }}
      >
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #00ff41', paddingBottom: '0.5rem' }}>
          <h2 style={{ margin: 0, letterSpacing: '4px' }}>ACCESS_GATEWAY v1.0</h2>
        </div>

        <div style={{ height: '100px', fontSize: '0.8rem', opacity: 0.8, marginBottom: '1rem' }}>
          {terminalText.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>

        {!booting && (
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>USER_ID</label>
              <input
                type="text"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: '1px solid #00ff41',
                  color: '#00ff41',
                  padding: '0.5rem',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>ENCRYPTED_PASS</label>
              <input
                type="password"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: '1px solid #00ff41',
                  color: '#00ff41',
                  padding: '0.5rem',
                  outline: 'none'
                }}
              />
            </div>
            <button
              type="button"
              style={{
                marginTop: '1rem',
                background: '#00ff41',
                color: '#000',
                border: 'none',
                padding: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                letterSpacing: '2px'
              }}
              onClick={() => alert('AUTHENTICATING...')}
            >
              INITIALIZE_SESSION
            </button>
          </form>
        )}
      </motion.div>

      <div style={{ marginTop: '2rem', fontSize: '0.7rem', opacity: 0.5 }}>
        SECURED BY PRISTINE_FOSS_SHIELD || QATAR_NET_PROTOCOL
      </div>
    </div>
  );
};
