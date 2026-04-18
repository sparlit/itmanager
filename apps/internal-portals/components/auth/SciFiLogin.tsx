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
  const [userId, setUserId] = useState('');
  const [encryptedPass, setEncryptedPass] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password: encryptedPass })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Check if 2FA is required
      if (data.requires2FA) {
        setShowOTP(true);
      } else {
        // Successful login - redirect or update state
        window.location.href = data.redirectUrl || '/dashboard';
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otpCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '2FA verification failed');
      }

      // Successful 2FA - redirect
      window.location.href = data.redirectUrl || '/dashboard';
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#050505',
      color: '#00ff41',
      height: '100dvh',
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

        {!booting && !showOTP && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{ color: '#ff0000', fontSize: '0.8rem', padding: '0.5rem', border: '1px solid #ff0000' }}>
                ERROR: {error}
              </div>
            )}
            <div>
              <label htmlFor="userId" style={{ display: 'block', marginBottom: '0.5rem' }}>USER_ID</label>
              <input
                id="userId"
                name="userId"
                type="text"
                autoComplete="username"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={loading}
                required
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
              <label htmlFor="encryptedPass" style={{ display: 'block', marginBottom: '0.5rem' }}>ENCRYPTED_PASS</label>
              <input
                id="encryptedPass"
                name="encryptedPass"
                type="password"
                autoComplete="current-password"
                value={encryptedPass}
                onChange={(e) => setEncryptedPass(e.target.value)}
                disabled={loading}
                required
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
              type="submit"
              disabled={loading}
              style={{
                marginTop: '1rem',
                background: loading ? '#666' : '#00ff41',
                color: '#000',
                border: 'none',
                padding: '1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '2px',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'AUTHENTICATING...' : 'INITIALIZE_SESSION'}
            </button>
          </form>
        )}

        {!booting && showOTP && (
          <form onSubmit={handleOTPSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{ color: '#ff0000', fontSize: '0.8rem', padding: '0.5rem', border: '1px solid #ff0000' }}>
                ERROR: {error}
              </div>
            )}
            <div>
              <label htmlFor="otpCode" style={{ display: 'block', marginBottom: '0.5rem' }}>2FA_CODE</label>
              <input
                id="otpCode"
                name="otpCode"
                type="text"
                autoComplete="one-time-code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                disabled={loading}
                required
                maxLength={6}
                placeholder="Enter 6-digit code"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: '1px solid #00ff41',
                  color: '#00ff41',
                  padding: '0.5rem',
                  outline: 'none',
                  letterSpacing: '4px',
                  textAlign: 'center',
                  fontSize: '1.2rem'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '1rem',
                background: loading ? '#666' : '#00ff41',
                color: '#000',
                border: 'none',
                padding: '1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '2px',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'VERIFYING...' : 'VERIFY_2FA'}
            </button>
            <button
              type="button"
              onClick={() => { setShowOTP(false); setError(''); }}
              disabled={loading}
              style={{
                background: 'transparent',
                color: '#00ff41',
                border: '1px solid #00ff41',
                padding: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem'
              }}
            >
              BACK_TO_LOGIN
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