/**
 * CandidateCard Component
 * =======================
 * Displays a candidate participating in an election.
 * Supports select states, manifestos, party names, and profile avatars.
 */

import React from 'react';
import { FaUserCircle } from 'react-icons/fa';

const CandidateCard = ({ candidate, index, isSelected, onSelect, disabled }) => {
  const { name, party, manifesto, image } = candidate;

  return (
    <div
      className="glass-card"
      style={{
        border: isSelected ? '2px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.06)',
        boxShadow: isSelected ? '0 0 16px rgba(99, 102, 241, 0.2)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px',
        textAlign: 'center',
        height: '100%',
        transition: 'all 0.2s ease',
        background: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'rgba(17, 24, 39, 0.65)',
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        {image ? (
          <img
            src={image}
            alt={name}
            style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
          />
        ) : (
          <FaUserCircle size={96} style={{ color: '#4b5563' }} />
        )}
      </div>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{name}</h3>
      
      <span
        style={{
          fontSize: '0.8rem',
          fontWeight: '600',
          color: party ? '#a855f7' : '#6b7280',
          background: party ? 'rgba(168, 85, 247, 0.1)' : 'rgba(107, 114, 128, 0.1)',
          padding: '2px 8px',
          borderRadius: '4px',
          marginBottom: '16px',
        }}
      >
        {party || 'Independent'}
      </span>

      <p
        style={{
          fontSize: '0.875rem',
          color: '#9ca3af',
          flexGrow: 1,
          marginBottom: '24px',
          lineHeight: '1.5',
          fontStyle: 'italic',
        }}
      >
        "{manifesto || 'No manifesto provided by the candidate.'}"
      </p>

      {onSelect && (
        <button
          onClick={() => onSelect(index)}
          disabled={disabled}
          className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
          style={{ width: '100%', fontSize: '0.9rem' }}
        >
          {isSelected ? 'Selected Candidate' : 'Select Candidate'}
        </button>
      )}
    </div>
  );
};

export default CandidateCard;
