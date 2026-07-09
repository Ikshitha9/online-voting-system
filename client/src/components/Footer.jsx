/**
 * Footer Component
 * ================
 * Renders the global footer of the application.
 */

import React from 'react';

const Footer = () => {
  return (
    <footer
      style={{
        background: '#0b0f19',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '30px 24px',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#6b7280',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p>© {new Date().getFullYear()} TrustVote Secure Voting Platform. All rights reserved.</p>
        <p style={{ fontSize: '0.75rem', color: '#4b5563' }}>
          Protected by SHA-256 integrity checks, JWT token rotation, and multi-factor email verification.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
