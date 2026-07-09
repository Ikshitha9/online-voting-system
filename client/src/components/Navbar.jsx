/**
 * Navbar Component
 * ================
 * Sticky navigation header. Provides client links based on user roles
 * (Voter vs. Admin) and handles signing out.
 */

import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaVoteYea, FaLock, FaChartBar, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <FaVoteYea className="text-indigo-500" style={{ fontSize: '1.5rem', color: '#6366f1' }} />
        <span className="gradient-text">TrustVote</span>
      </Link>

      {user ? (
        <div className="navbar-menu">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/elections"
            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
          >
            Elections
          </NavLink>
          <NavLink
            to="/surveys"
            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
          >
            Surveys
          </NavLink>

          {user.role === 'admin' && (
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
              style={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <FaLock size={12} /> Admin
            </NavLink>
          )}

          <div className="navbar-profile" style={{ marginLeft: '12px' }}>
            <Link to="/profile" className="navbar-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaUser size={14} />
              <span style={{ fontSize: '0.85rem' }} className="hidden sm:inline">
                {user.fullName.split(' ')[0]}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <FaSignOutAlt size={12} /> Logout
            </button>
          </div>
        </div>
      ) : (
        <div className="navbar-menu">
          <Link to="/login" className="navbar-link">
            Login
          </Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Register
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
