'use client';
import React, { useEffect } from 'react';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div style={{ padding: '1rem', textAlign: 'center' }}>
      <h2>Failed to load Dashboard</h2>
      <p style={{ color: 'red' }}>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
} 