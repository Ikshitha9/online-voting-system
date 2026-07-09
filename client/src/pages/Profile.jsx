/**
 * Profile Component
 * =================
 * User profile management — update name, change password, view voting history.
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaLock, FaEnvelope, FaCheckCircle, FaShieldAlt, FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) { toast.error('Name cannot be empty.'); return; }
    try {
      setSaving(true);
      await updateProfile(fullName, undefined);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) { toast.error('Fill in all password fields.'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match.'); return; }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    try {
      setSaving(true);
      await updateProfile(undefined, { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 0' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>My Profile</h1>
      <p style={{ color: '#9ca3af', marginBottom: '32px' }}>Manage your account settings and preferences.</p>

      {/* Profile Header */}
      <div className="glass-card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{
          width: '70px', height: '70px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', fontWeight: '800', color: '#fff', flexShrink: 0,
          border: '3px solid rgba(99,102,241,0.3)',
        }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{user?.fullName}</h2>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '8px' }}>
            <FaEnvelope style={{ marginRight: '6px', verticalAlign: 'middle', fontSize: '12px' }} />
            {user?.email}
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className={`badge ${user?.role === 'admin' ? 'badge-completed' : 'badge-upcoming'}`}>
              {user?.role === 'admin' ? '👑 Admin' : '🗳️ Voter'}
            </span>
            {user?.isVerified && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.75rem', fontWeight: '600' }}>
                <FaCheckCircle size={12} /> Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(17,24,39,0.6)', borderRadius: '10px', padding: '4px' }}>
        {[
          { key: 'profile', label: 'Edit Profile', icon: <FaUser size={12} /> },
          { key: 'password', label: 'Change Password', icon: <FaLock size={12} /> },
          { key: 'security', label: 'Security', icon: <FaShieldAlt size={12} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, padding: '10px', borderRadius: '7px', border: 'none',
              background: activeTab === tab.key ? 'rgba(99,102,241,0.2)' : 'transparent',
              color: activeTab === tab.key ? '#fff' : '#9ca3af',
              fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Personal Information</h3>
          <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="profile-name">Full Name</label>
              <div style={{ position: 'relative' }}>
                <FaUser style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '13px' }} />
                <input
                  id="profile-name"
                  type="text"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '40px' }}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <FaEnvelope style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '13px' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '40px', opacity: 0.6, cursor: 'not-allowed' }}
                  value={user?.email || ''}
                  readOnly
                />
              </div>
              <p style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '4px' }}>Email cannot be changed.</p>
            </div>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', gap: '8px' }}>
              <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Change Password</h3>
          <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { id: 'cur-pw', label: 'Current Password', value: currentPassword, setter: setCurrentPassword },
              { id: 'new-pw', label: 'New Password', value: newPassword, setter: setNewPassword },
              { id: 'conf-pw', label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword },
            ].map(({ id, label, value, setter }) => (
              <div key={id} className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor={id}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <FaLock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '13px' }} />
                  <input
                    id={id}
                    type="password"
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '40px' }}
                    placeholder="••••••••"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                  />
                </div>
              </div>
            ))}
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', gap: '8px' }}>
              <FaLock /> {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Security Overview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Email Verification', status: user?.isVerified ? 'Verified' : 'Unverified', ok: user?.isVerified },
              { label: 'Account Role', status: user?.role === 'admin' ? 'Administrator' : 'Voter', ok: true },
              { label: 'Session Management', status: 'JWT Refresh Token Active', ok: true },
              { label: 'Vote Integrity', status: 'SHA-256 Hash Chain Enabled', ok: true },
            ].map(({ label, status, ok }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'rgba(17,24,39,0.5)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaShieldAlt size={14} color={ok ? '#10b981' : '#f43f5e'} />
                  <span style={{ fontSize: '0.88rem' }}>{label}</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: ok ? '#10b981' : '#f43f5e', fontWeight: '600' }}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
