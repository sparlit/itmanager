"use client";

import React, { useState } from 'react';

/**
 * AI STAIN DETECTION COMPONENT (YOLOv8 Interface)
 * Uses Computer Vision to assist QC staff on the factory floor.
 */
export const AIStainDetector = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{status: string, confidence: number} | null>(null);

  const simulateScan = () => {
    setScanning(true);
    setResult(null);

    // Simulate YOLOv8 processing time
    setTimeout(() => {
      setScanning(false);
      setResult({ status: 'ANOMALY_DETECTED: STAIN_ON_CUFF', confidence: 0.94 });
    }, 2000);
  };

  return (
    <div style={{
      border: '2px solid #E67E22',
      borderRadius: '12px',
      padding: '1.5rem',
      backgroundColor: '#fff',
      textAlign: 'center'
    }}>
      <h3 style={{ color: '#E67E22', marginBottom: '1rem' }}>AI_VISION: QUALITY_CONTROL</h3>

      <div style={{
        width: '100%',
        height: '250px',
        backgroundColor: '#000',
        borderRadius: '8px',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        {scanning ? (
          <div className="scanner-line" style={{
            width: '100%',
            height: '2px',
            backgroundColor: '#00FF41',
            position: 'absolute',
            boxShadow: '0 0 15px #00FF41',
            top: 0,
            animation: 'scan 2s linear infinite'
          }} />
        ) : (
          <span style={{ color: '#444' }}>[ CAMERA_INPUT_OFF ]</span>
        )}

        {result && (
          <div style={{
            position: 'absolute',
            border: '2px solid red',
            top: '40%', left: '30%', width: '100px', height: '100px',
            color: 'red', fontSize: '0.7rem', fontWeight: 'bold'
          }}>
            {result.status}
          </div>
        )}
      </div>

      <button
        onClick={simulateScan}
        disabled={scanning}
        style={{
          marginTop: '1.5rem',
          width: '100%',
          padding: '1rem',
          backgroundColor: scanning ? '#ccc' : '#E67E22',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        {scanning ? 'ANALYZING...' : 'START_AI_SCAN'}
      </button>

      {result && (
        <div style={{ marginTop: '1rem', color: '#B71C1C', fontWeight: 'bold' }}>
          ALERT: REJECT_ITEM - CONFIDENCE: {(result.confidence * 100).toFixed(1)}%
        </div>
      )}

      <style jsx>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};
