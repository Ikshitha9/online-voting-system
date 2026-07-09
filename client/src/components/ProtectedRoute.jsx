/**
 * Protected Route Wrapper
 * =======================
 * Secures specific routes on the client side:
 * - Redirects anonymous users to the `/login` page.
 * - Redirects logged-in but unverified users (`isVerified === false`)
 *   to `/verify-otp` page to complete their registration.
 * - Restricts administrator routes to users with `role === 'admin'`.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requireAdmin = false, requireVerified = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading indicator while session bootstrap completes
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  // Case 1: Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Case 2: Logged in but not verified via OTP (only enforced when requireVerified=true)
  // Exclude the /verify-otp page itself from recursion redirect loop
  if (requireVerified && !user.isVerified && location.pathname !== '/verify-otp') {
    return <Navigate to="/verify-otp" replace />;
  }

  // Case 3: Admin privileges check
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and meets all validation parameters
  return children;
};

export default ProtectedRoute;
