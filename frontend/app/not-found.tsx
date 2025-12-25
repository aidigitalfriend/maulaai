'use client'

import React from 'react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-center ca-text-primary">
        <div className="text-6xl mb-4">🤖</div>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="ca-text-secondary">The page you're looking for doesn't exist.</p>
      </div>
    </div>
  );
};

export default NotFound;