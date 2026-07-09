/**
 * Register Component
 * ==================
 * New voter/admin account registration with OTP email verification flow.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaKey, FaUserShield, FaUserCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'voter',
    adminKey: '',
  });
  const [loading, setLoading] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'role') setShowAdminKey(value === 'admin');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    try {
      setLoading(true);
      const res = await register(form.fullName, form.email, form.password, form.role, form.adminKey);
      if (res && res.success) {
        navigate('/verify-otp', { state: { email: form.email } });
      }
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = pwStrength(form.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#f43f5e', '#f59e0b', '#6366f1', '#10b981'][strength];

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto 0', padding: '0 16px' }}>
      <div className="glass-card" style={{ padding: '36px 30px' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(99,102,241,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FaUserCheck size={26} color="#6366f1" />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Create Account</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            Join TrustVote — secure your digital ballot
          </p>
        </div>

        {/* Role Toggle */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          {['voter', 'admin'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleChange({ target: { name: 'role', value: r } })}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${form.role === r ? '#6366f1' : 'rgba(255,255,255,0.06)'}`,
                background: form.role === r ? 'rgba(99,102,241,0.15)' : 'rgba(17,24,39,0.6)',
                color: form.role === r ? '#6366f1' : '#9ca3af',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              {r === 'voter' ? <FaUserCheck size={14} /> : <FaUserShield size={14} />}
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Full Name */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="reg-fullname">Full Name</label>
            <div style={{ position: 'relative' }}>
              <FaUser style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '13px' }} />
              <input
                id="reg-fullname"
                name="fullName"
                type="text"
                className="form-input"
                style={{ width: '100%', paddingLeft: '40px' }}
                placeholder="John Doe"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '13px' }} />
              <input
                id="reg-email"
                name="email"
                type="email"
                className="form-input"
                style={{ width: '100%', paddingLeft: '40px' }}
                placeholder="you@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '13px' }} />
              <input
                id="reg-password"
                name="password"
                type="password"
                className="form-input"
                style={{ width: '100%', paddingLeft: '40px' }}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            {form.password && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <div style={{ flex: 1, height: '4px', background: '#1f2937', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${(strength / 4) * 100}%`, height: '100%', background: strengthColor, transition: 'all 0.3s' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: strengthColor, fontWeight: '600' }}>{strengthLabel}</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '13px' }} />
              <input
                id="reg-confirm"
                name="confirmPassword"
                type="password"
                className="form-input"
                style={{ width: '100%', paddingLeft: '40px', borderColor: form.confirmPassword && form.password !== form.confirmPassword ? '#f43f5e' : '' }}
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Admin Key (conditional) */}
          {showAdminKey && (
            <div className="form-group" style={{ marginBottom: 0, background: 'rgba(245,158,11,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.15)' }}>
              <label className="form-label" htmlFor="reg-adminkey" style={{ color: '#f59e0b' }}>
                Admin Registration Key
              </label>
              <div style={{ position: 'relative' }}>
                <FaKey style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#f59e0b', fontSize: '13px' }} />
                <input
                  id="reg-adminkey"
                  name="adminKey"
                  type="password"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '40px', borderColor: 'rgba(245,158,11,0.3)' }}
                  placeholder="Secret admin key from .env"
                  value={form.adminKey}
                  onChange={handleChange}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '6px' }}>Required for admin accounts. Contact your system administrator.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? 'Creating Account...' : 'Create Account & Verify Email'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '24px', paddingTop: '18px', textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: '#9ca3af' }}>Already have an account? </span>
          <Link to="/login" style={{ fontWeight: '600' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
