/**
 * VoteConfirmation Component
 * ===========================
 * Modal overlay to verify the user's vote choice.
 * Explains integrity tracking (SHA-256 generation) and blocks action if double voting occurs.
 */

import React from 'react';
import { FaShieldAlt, FaTimes } from 'react-icons/fa';

const VoteConfirmation = ({ candidateName, candidateParty, onConfirm, onCancel, loading }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 5, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#111827',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          textAlign: 'center',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
          >
            <FaTimes size={18} />
          </button>
        </div>

        <div style={{ color: '#6366f1', marginBottom: '16px' }}>
          <FaShieldAlt size={48} />
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Confirm Your Selection</h2>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '24px' }}>
          You are about to cast your vote. This action is irreversible.
        </p>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em' }}>
            Selected Candidate
          </span>
          <h3 style={{ fontSize: '1.25rem', marginTop: '4px', color: '#ffffff' }}>{candidateName}</h3>
          <p style={{ fontSize: '0.85rem', color: '#a855f7', fontWeight: '600', marginTop: '2px' }}>
            {candidateParty || 'Independent'}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            background: 'rgba(245, 158, 11, 0.05)',
            border: '1px solid rgba(245, 158, 11, 0.1)',
            borderRadius: '6px',
            padding: '12px',
            textAlign: 'left',
            marginBottom: '24px',
            fontSize: '0.8rem',
            color: '#fbbf24',
          }}
        >
          <span>⚠️</span>
          <span>
            <strong>Security Note:</strong> Cast votes are encrypted with SHA-256 keys and recorded to the audit trail ledger. Multiple submissions from the same voter ID are rejected.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            {loading ? 'Casting Vote...' : 'Confirm & Cast'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoteConfirmation;
