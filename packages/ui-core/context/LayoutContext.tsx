"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * DEEP RTL (RIGHT-TO-LEFT) CONTEXT
 * Handles dynamic layout flipping for Arabic support in Qatar.
 */
type Direction = 'ltr' | 'rtl';

interface LayoutContextType {
  direction: Direction;
  toggleDirection: () => void;
  isRtl: boolean;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [direction, setDirection] = useState<Direction>('ltr');

  const toggleDirection = () => {
    setDirection(prev => prev === 'ltr' ? 'rtl' : 'ltr');
  };

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = direction === 'rtl' ? 'ar' : 'en';
  }, [direction]);

  return (
    <LayoutContext.Provider value={{ direction, toggleDirection, isRtl: direction === 'rtl' }}>
      <div className={direction === 'rtl' ? 'font-arabic' : 'font-sans'}>
        {children}
      </div>
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) throw new Error('useLayout must be used within LayoutProvider');
  return context;
};
