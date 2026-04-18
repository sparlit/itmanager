"use client";

import React from 'react';
import { CalendarService } from '../../../../packages/logic/calendar/calendar-service';

/**
 * CULTURALLY LOCALIZED PROMOTION BANNER
 * Supports Ramadan, Eid, and National Day promotions using Hijri calendar.
 */
export const CulturalPromotionBanner = () => {
  const holiday = CalendarService.isHolidayPeriod();

  if (!holiday.active) return null;

  const content = {
    'RAMADAN': {
      title: 'Ramadan Kareem from Pristine',
      text: 'Enjoy 20% off all laundry services during the Holy Month.',
      theme: '#1A365D' // Deep Night Blue
    },
    'EID_AL_FITR': {
      title: 'Eid Mubarak!',
      text: 'Look your best this Eid. Express 24h service on all traditional wear.',
      theme: '#27AE60' // Festive Green
    },
    'EID_AL_ADHA': {
      title: 'Blessed Eid Al-Adha',
      text: 'Special bulk rates for family linens and hospitality partners.',
      theme: '#D4AF37' // Luxury Gold
    }
  };

  const activePromo = content[holiday.type as keyof typeof content];

  return (
    <div style={{
      backgroundColor: activePromo.theme,
      color: 'white',
      padding: '1.5rem',
      textAlign: 'center',
      fontFamily: 'Playfair Display, serif',
      borderBottom: '4px solid rgba(255,255,255,0.2)'
    }}>
      <h2 style={{ margin: 0 }}>{activePromo.title}</h2>
      <p style={{ margin: '0.5rem 0', fontFamily: 'Inter, sans-serif' }}>{activePromo.text}</p>
      <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
        * Based on official Qatar Hijri Sighting: {CalendarService.toHijri()}
      </div>
    </div>
  );
};
