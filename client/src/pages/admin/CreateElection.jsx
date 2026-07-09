/**
 * CreateElection Component
 * ========================
 * Multi-step admin form for creating elections with candidates, timing, and eligibility.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FaPlus, FaTrash, FaArrowLeft, FaVoteYea } from 'react-icons/fa';
import toast from 'react-hot-toast';

const emptyCandidate = () => ({ name: '', party: '', bio: '' });

const CreateElection = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    candidates: [emptyCandidate(), emptyCandidate()],
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCandidateChange = (idx, field, value) => {
    setForm((prev) => {
      const updated = [...prev.candidates];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, candidates: updated };
    });
  };

  const addCandidate = () => {
    if (form.candidates.length >= 10) { toast.error('Maximum 10 candidates allowed.'); return; }
    setForm((prev) => ({ ...prev, candidates: [...prev.candidates, emptyCandidate()] }));
  };

  const removeCandidate = (idx) => {
    if (form.candidates.length <= 2) { toast.error('Minimum 2 candidates required.'); return; }
    setForm((prev) => ({ ...prev, candidates: prev.candidates.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.startDate || !form.endDate) {
      toast.error('Please fill in all required fields.'); return;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      toast.error('End date must be after start date.'); return;
    }
    const validCandidates = form.candidates.filter((c) => c.name.trim());
    if (validCandidates.length < 2) {
      toast.error('At least 2 candidates with names are required.'); return;
    }

    try {
      setSaving(true);
      const res = await api.post('/elections', { ...form, candidates: validCandidates });
      if (res.data?.success) {
        toast.success('Election created successfully!');
        navigate('/admin/elections');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create election.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '20px 0' }}>
      <button
        onClick={() => navigate('/admin')}
        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginBottom: '24px', padding: 0 }}
      >
        <FaArrowLeft size={12} /> Back to Admin
      </button>

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.9rem', marginBottom: '6px' }}>Create Election</h1>
        <p style={{ color: '#9ca3af' }}>Configure the election parameters and add candidates.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Basic Info */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#6366f1' }}>📋 Basic Information</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="el-title">Election Title *</label>
              <input id="el-title" name="title" type="text" className="form-input" style={{ width: '100%' }}
                placeholder="e.g., 2025 Student Council Election" value={form.title} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="el-description">Description</label>
              <textarea id="el-description" name="description" className="form-input"
                style={{ width: '100%', minHeight: '80px', resize: 'vertical', paddingTop: '12px' }}
                placeholder="Brief description of this election..." value={form.description} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Timing */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#6366f1' }}>🕐 Election Timing</h2>
          <div className="grid-cols-1-2" style={{ gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="el-start">Start Date & Time *</label>
              <input id="el-start" name="startDate" type="datetime-local" className="form-input" style={{ width: '100%' }}
                value={form.startDate} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="el-end">End Date & Time *</label>
              <input id="el-end" name="endDate" type="datetime-local" className="form-input" style={{ width: '100%' }}
                value={form.endDate} onChange={handleChange} required />
            </div>
          </div>
        </div>

        {/* Candidates */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#6366f1' }}>🗳️ Candidates ({form.candidates.length})</h2>
            <button type="button" onClick={addCandidate} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem', gap: '6px' }}>
              <FaPlus size={11} /> Add Candidate
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {form.candidates.map((c, idx) => (
              <div key={idx} style={{ background: 'rgba(17,24,39,0.5)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6366f1' }}>Candidate #{idx + 1}</span>
                  {form.candidates.length > 2 && (
                    <button type="button" onClick={() => removeCandidate(idx)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
                      <FaTrash size={11} /> Remove
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="grid-cols-1-2" style={{ gap: '10px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor={`c-name-${idx}`}>Full Name *</label>
                      <input id={`c-name-${idx}`} type="text" className="form-input" style={{ width: '100%' }}
                        placeholder="Candidate name" value={c.name}
                        onChange={(e) => handleCandidateChange(idx, 'name', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor={`c-party-${idx}`}>Party / Affiliation</label>
                      <input id={`c-party-${idx}`} type="text" className="form-input" style={{ width: '100%' }}
                        placeholder="e.g., Independent" value={c.party}
                        onChange={(e) => handleCandidateChange(idx, 'party', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor={`c-bio-${idx}`}>Brief Bio</label>
                    <input id={`c-bio-${idx}`} type="text" className="form-input" style={{ width: '100%' }}
                      placeholder="Short bio or tagline" value={c.bio}
                      onChange={(e) => handleCandidateChange(idx, 'bio', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/admin/elections')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ gap: '8px' }}>
            <FaVoteYea /> {saving ? 'Creating...' : 'Create Election'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateElection;
