"use client";

import React, { useState } from 'react';

/**
 * IT DEPARTMENT PORTAL (SCI-FI THEME)
 */
export default function ITPortal() {
  const [loading, setLoading] = useState<string | null>(null);
  const [hasPermission] = useState(true); // TODO: Replace with actual auth/session check

  const stats = [
    { label: "Server Load", value: "24%", color: "#00FF41" },
    { label: "Active Nodes", value: "12/12", color: "#00FF41" },
    { label: "Database Ping", value: "14ms", color: "#00FF41" },
    { label: "Security Status", value: "OPTIMAL", color: "#00FF41" }
  ];

  const handleRebootModuleBus = async () => {
    if (!hasPermission) return;

    if (!confirm('CONFIRM: REBOOT_MODULE_BUS? This will restart all application modules.')) {
      return;
    }

    setLoading('reboot');
    try {
      const response = await fetch('/api/it/reboot-module-bus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Reboot failed');

      // Record audit event
      await fetch('/api/audit/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REBOOT_MODULE_BUS',
          module: 'IT_PORTAL',
          details: { timestamp: new Date().toISOString() }
        })
      });

      alert('MODULE_BUS reboot initiated successfully');
    } catch (error) {
      alert('ERROR: Reboot failed - ' + (error as Error).message);
    } finally {
      setLoading(null);
    }
  };

  const handleFlushRedisCache = async () => {
    if (!hasPermission) return;

    if (!confirm('CONFIRM: FLUSH_REDIS_CACHE? This will clear all cached data.')) {
      return;
    }

    setLoading('flush');
    try {
      const response = await fetch('/api/it/flush-redis-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Cache flush failed');

      // Record audit event
      await fetch('/api/audit/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'FLUSH_REDIS_CACHE',
          module: 'IT_PORTAL',
          details: { timestamp: new Date().toISOString() }
        })
      });

      alert('REDIS_CACHE flushed successfully');
    } catch (error) {
      alert('ERROR: Cache flush failed - ' + (error as Error).message);
    } finally {
      setLoading(null);
    }
  };

  const handleInitSecurityScan = async () => {
    if (!hasPermission) return;

    if (!confirm('CONFIRM: INIT_SECURITY_SCAN? This will initiate a full security audit.')) {
      return;
    }

    setLoading('scan');
    try {
      const response = await fetch('/api/it/init-security-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Security scan failed');

      // Record audit event
      await fetch('/api/audit/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'INIT_SECURITY_SCAN',
          module: 'IT_PORTAL',
          details: { timestamp: new Date().toISOString() }
        })
      });

      alert('SECURITY_SCAN initiated successfully');
    } catch (error) {
      alert('ERROR: Security scan failed - ' + (error as Error).message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{
      backgroundColor: '#000',
      color: '#00FF41',
      minHeight: '100vh',
      fontFamily: 'monospace',
      padding: '2rem'
    }}>
      <header style={{ borderBottom: '1px solid #00FF41', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>[ DEPT_IT // CORE_MONITOR ]</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
        {stats.map(s => (
          <div key={s.label} style={{ border: '1px solid #00FF41', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{s.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ border: '1px solid #00FF41', padding: '1.5rem' }}>
          <h3>SYSTEM_LOGS</h3>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, height: '300px', overflowY: 'auto' }}>
            <p>[12:04:01] AUTH_SUCCESS: USER_743_ADMIN</p>
            <p>[12:05:22] DB_SYNC_COMPLETED: QATAR_MAIN_CLUSTER</p>
            <p>[12:08:44] BACKUP_INITIATED: WEEKLY_SNAPSHOT_02</p>
            <p>[12:15:00] API_KEY_ROTATED: QPAY_SECURE_V3</p>
            <p style={{ color: '#fff' }}>_</p>
          </div>
        </div>

        <div style={{ border: '1px solid #00FF41', padding: '1.5rem' }}>
          <h3>QUICK_ACTIONS</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '1rem' }}>
              <button
                onClick={handleRebootModuleBus}
                disabled={!hasPermission || loading === 'reboot'}
                aria-disabled={!hasPermission}
                title={!hasPermission ? 'Insufficient permissions' : ''}
                style={{
                  background: 'transparent',
                  color: hasPermission ? '#00FF41' : '#666',
                  border: `1px solid ${hasPermission ? '#00FF41' : '#666'}`,
                  width: '100%',
                  padding: '0.5rem',
                  cursor: hasPermission ? 'pointer' : 'not-allowed',
                  opacity: loading === 'reboot' ? 0.6 : 1
                }}
              >
                {loading === 'reboot' ? 'REBOOTING...' : 'REBOOT_MODULE_BUS'}
              </button>
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <button
                onClick={handleFlushRedisCache}
                disabled={!hasPermission || loading === 'flush'}
                aria-disabled={!hasPermission}
                title={!hasPermission ? 'Insufficient permissions' : ''}
                style={{
                  background: 'transparent',
                  color: hasPermission ? '#00FF41' : '#666',
                  border: `1px solid ${hasPermission ? '#00FF41' : '#666'}`,
                  width: '100%',
                  padding: '0.5rem',
                  cursor: hasPermission ? 'pointer' : 'not-allowed',
                  opacity: loading === 'flush' ? 0.6 : 1
                }}
              >
                {loading === 'flush' ? 'FLUSHING...' : 'FLUSH_REDIS_CACHE'}
              </button>
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <button
                onClick={handleInitSecurityScan}
                disabled={!hasPermission || loading === 'scan'}
                aria-disabled={!hasPermission}
                title={!hasPermission ? 'Insufficient permissions' : ''}
                style={{
                  background: 'transparent',
                  color: hasPermission ? '#00FF41' : '#666',
                  border: `1px solid ${hasPermission ? '#00FF41' : '#666'}`,
                  width: '100%',
                  padding: '0.5rem',
                  cursor: hasPermission ? 'pointer' : 'not-allowed',
                  opacity: loading === 'scan' ? 0.6 : 1
                }}
              >
                {loading === 'scan' ? 'SCANNING...' : 'INIT_SECURITY_SCAN'}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}