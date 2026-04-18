"use client";

import React from 'react';
import { CalendarService } from '../../../../packages/logic/calendar/calendar-service';

/**
 * HR PORTAL (CULTURAL LOCALIZATION & STAFF MANAGEMENT)
 */
export default function HRPortal() {
  const dates = CalendarService.getDualDisplay();

  return (
    <div style={{ backgroundColor: '#FDFCFB', color: '#795548', minHeight: '100vh', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #795548', paddingBottom: '1rem', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Human Resources & Payroll</h1>
          <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            Today: {dates.gregorian} || <strong>Hijri: {dates.hijri}</strong>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <button style={{ backgroundColor: '#795548', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px' }}>
            Biometric Sync Status: OK
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
        <section>
          <h3>Staff Holiday Planner (Qatar Official)</h3>
          <div style={{ background: '#fff', border: '1px solid #79554833', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ padding: '1rem', background: '#F9FBE7', borderLeft: '4px solid #AFB42B', marginBottom: '1rem' }}>
              <strong>Upcoming: Eid Al-Adha Holidays</strong>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Scheduled: Dhu al-Hijjah 10 - 13 (approx. 4 days).</p>
            </div>
            <div style={{ padding: '1rem', background: '#E3F2FD', borderLeft: '4px solid #1976D2' }}>
              <strong>Qatar National Day</strong>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Scheduled: 18th December.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>Attendance MFA Activity</h3>
          <div style={{ background: '#fff', border: '1px solid #79554833', borderRadius: '12px', padding: '1.5rem', fontSize: '0.8rem' }}>
            <div style={{ marginBottom: '10px' }}>[12:01] FINANCE_DEPT: MFA_TOTP_SUCCESS (User_002)</div>
            <div style={{ marginBottom: '10px' }}>[12:04] ADMIN_DEPT: MFA_TOTP_SUCCESS (User_001)</div>
            <div style={{ marginBottom: '10px' }}>[12:15] HR_DEPT: MFA_TOTP_DENIED (User_088)</div>
          </div>
        </section>
      </div>
    </div>
  );
}
