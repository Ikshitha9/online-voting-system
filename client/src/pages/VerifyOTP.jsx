/**
 * VerifyOTP Component
 * ===================
 * Email OTP verification screen after registration.
 * Includes countdown timer and resend OTP functionality.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const RESEND_COOLDOWN = 60; // seconds

const VerifyOTP = () => {
  const { verifyOTP, resendOTP, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location.state?.email || '';
  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (user && user.isVerified) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Please enter the complete 6-digit code.');
      return;
    }
    if (!email) {
      toast.error('Email address is required.');
      return;
    }
    try {
      setLoading(true);
      const res = await verifyOTP(email, code);
      if (res && res.success) navigate('/dashboard', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) { toast.error('Email is required to resend OTP.'); return; }
    const res = await resendOTP(email);
    if (res && res.success) {
      setCountdown(RESEND_COOLDOWN);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '60px auto 0', padding: '0 16px' }}>
      <div className="glass-card" style={{ padding: '40px 30px', textAlign: 'center' }}>

        <div style={{ width: '64px', height: '64px', background: 'rgba(99,102,241,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid rgba(99,102,241,0.2)' }}>
          <FaShieldAlt size={28} color="#6366f1" />
        </div>

        <h2 style={{ fontSize: '1.7rem', marginBottom: '10px' }}>Verify Your Email</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '6px' }}>
          We sent a 6-digit code to
        </p>
        {email && (
          <p style={{ color: '#6366f1', fontWeight: '600', fontSize: '0.9rem', marginBottom: '28px' }}>
            <FaEnvelope size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            {email}
          </p>
        )}

        {!emailFromState && (
          <div className="form-group" style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label className="form-label" htmlFor="otp-email">Your Email</label>
            <input
              id="otp-email"
              type="email"
              className="form-input"
              style={{ width: '100%' }}
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* OTP Digit Inputs */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '28px' }} onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                id={`otp-digit-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                style={{
                  width: '48px',
                  height: '56px',
                  textAlign: 'center',
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  background: 'rgba(17,24,39,0.8)',
                  border: `2px solid ${digit ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '10px',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  caretColor: '#6366f1',
                }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.join('').length < 6}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '16px' }}
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
          {canResend ? (
            <button
              onClick={handleResend}
              style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
            >
              Resend Code
            </button>
          ) : (
            <span>Resend in <span style={{ color: '#6366f1', fontWeight: '600' }}>{countdown}s</span></span>
          )}
        </div>

      </div>
    </div>
  );
};

export default VerifyOTP;
