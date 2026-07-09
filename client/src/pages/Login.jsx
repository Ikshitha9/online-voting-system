/**
 * Login Component
 * ===============
 * Handles voter and administrator sign in form.
 * Triggers toast alerts and routes successful credentials.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Parse session expiry message if redirect occurred
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('session_expired')) {
      toast.error('Session expired. Please sign in again.');
    }
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (!user.isVerified) {
        navigate('/verify-otp');
      } else {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res && res.success) {
        if (!res.user.isVerified) {
          navigate('/verify-otp');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto 0', padding: '0 16px' }}>
      <div className="glass-card" style={{ padding: '36px 30px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Sign In</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            Enter your credentials to access the voting lobby
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{ position: 'absolute', left: '16px', top: '16px', color: '#6b7280' }} />
              <input
                id="email-input"
                type="email"
                className="form-input"
                style={{ width: '100%', paddingLeft: '44px' }}
                placeholder="voter@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', left: '16px', top: '16px', color: '#6b7280' }} />
              <input
                id="password-input"
                type="password"
                className="form-input"
                style={{ width: '100%', paddingLeft: '44px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px' }}
          >
            <FaSignInAlt />
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '24px', paddingTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: '#9ca3af' }}>New to TrustVote? </span>
          <Link to="/register" style={{ fontWeight: '600' }}>
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
