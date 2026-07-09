/**
 * Home Component
 * ==============
 * Landing page of the Secure Online Voting Platform.
 * Displays platform overview, security guarantees, and navigation shortcuts.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaShieldAlt, FaVoteYea, FaKey, FaClipboardCheck, FaArrowRight } from 'react-icons/fa';

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', padding: '40px 0' }}>
      
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '20px' }}>
          The Future of <span className="gradient-text" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Secure Decision Making</span>
        </h1>
        
        <p style={{ fontSize: '1.15rem', color: '#9ca3af', marginBottom: '40px', lineHeight: '1.6' }}>
          Conduct secure, double-voting free elections and surveys. Built with tamper-evident SHA-256 hash chains, role authorizations, and real-time auditable verification.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Go to Dashboard</span>
              <FaArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Get Started</span>
                <FaArrowRight size={14} />
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Security Features Grid */}
      <section>
        <h2 style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '12px' }}>Engineered for Integrity</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '48px', fontSize: '1rem' }}>
          Robust protection parameters guarding every cast ballot
        </p>

        <div className="grid-cols-1-2-3">
          
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '12px', borderRadius: '8px' }}>
              <FaShieldAlt size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>SHA-256 Vote Hashing</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Every vote creates an immutable cryptographic checksum (hash) computed from the voter ID, election ID, candidate choice, and timestamp, offering tamper-evident audits.
            </p>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '12px', borderRadius: '8px' }}>
              <FaVoteYea size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>Double-Voting Prevention</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.5' }}>
              MongoDB compound unique index schemas guarantee that a voter can record exactly one vote per election, preventing duplicate votes even under network concurrency.
            </p>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px', borderRadius: '8px' }}>
              <FaKey size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>Email OTP Verification</h3>
            <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Two-factor voter identification using cryptographically secure 6-digit OTP codes sent straight to email addresses prevents automated bot registration.
            </p>
          </div>

        </div>
      </section>

      {/* Info Banner */}
      <section className="glass-card" style={{ display: 'flex', flexDirection: 'column', mdDirection: 'row', alignItems: 'center', gap: '30px', background: 'radial-gradient(ellipse at right, rgba(99, 102, 241, 0.1), transparent)' }}>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '14px' }}>Cast Auditable, Transparent Votes</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
            Upon casting a ballot, the platform issues an autogenerated voter receipt. You can cross-reference the checksum at any time to verify your vote was counted.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '600', fontSize: '0.9rem' }}>
            <FaClipboardCheck />
            <span>End-to-End Auditable Ballots</span>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
