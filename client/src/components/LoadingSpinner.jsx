/**
 * Loading Spinner Component
 * =========================
 * Renders a highly-performant, responsive loading spinner using custom CSS transitions.
 */

import React from 'react';

const LoadingSpinner = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-12 h-12 border-4',
    large: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={`${sizeClasses[size] || sizeClasses.medium} border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      />
    </div>
  );
};

export default LoadingSpinner;
