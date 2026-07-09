/**
 * VotePage Component
 * ==================
 * Secure ballot casting interface with candidate selection, hash preview, and confirmation.
 * Implements double-voting guard and receipt generation on success.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FaShieldAlt, FaCheckCircle, FaArrowLeft, FaVoteYea } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import VoteConfirmation from '../components/VoteConfirmation';
import toast from 'react-hot-toast';

const VotePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [election, setElection] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const res = await api.get(`/elections/${id}`);
        const el = res.data?.election;
        if (!el) { toast.error('Election not found.'); navigate('/elections'); return; }
        if (el.status !== 'active') { toast.error('This election is not active.'); navigate(`/elections/${id}`); return; }

        // Check already voted
        try {
          const vRes = await api.get(`/votes/my-vote/${id}`);
          if (vRes.data?.vote) { toast.error('You have already voted in this election.'); navigate(`/elections/${id}`); return; }
        } catch {}

        setElection(el);
      } catch (err) {
        toast.error('Failed to load election.');
        navigate('/elections');
      } finally {
        setLoading(false);
      }
    };
    fetchElection();
  }, [id, navigate]);

  const handleVote = async () => {
    if (!selected) return;
    try {
      setSubmitting(true);
      const res = await api.post('/votes', { electionId: id, candidateId: selected._id });
      if (res.data?.success) {
        setReceipt(res.data.vote);
        setConfirming(false);
        toast.success('Vote cast successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cast vote.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!election) return null;

  // Show receipt after successful vote
  if (receipt) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 16px' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px', border: '1px solid rgba(16,185,129,0.25)' }}>
          <div style={{ width: '72px', height: '72px', background: 'rgba(16,185,129,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <FaCheckCircle size={34} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', color: '#10b981' }}>Vote Confirmed!</h2>
          <p style={{ color: '#9ca3af', marginBottom: '28px' }}>Your ballot has been recorded securely.</p>

          <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: '10px', padding: '20px', marginBottom: '28px', textAlign: 'left' }}>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vote Receipt Hash</p>
            <p style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#10b981', wordBreak: 'break-all', lineHeight: '1.6' }}>
              {receipt.voteHash}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Back to Dashboard
            </button>
            <button onClick={() => navigate('/elections')} className="btn btn-secondary">
              Browse Elections
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation dialog
  if (confirming && selected) {
    return (
      <div style={{ maxWidth: '540px', margin: '60px auto', padding: '0 16px' }}>
        <VoteConfirmation
          election={election}
          candidate={selected}
          onConfirm={handleVote}
          onCancel={() => setConfirming(false)}
          loading={submitting}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 0' }}>
      <button
        onClick={() => navigate(`/elections/${id}`)}
        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginBottom: '24px', padding: 0 }}
      >
        <FaArrowLeft size={12} /> Back to Election
      </button>

      {/* Header */}
      <div className="glass-card" style={{ marginBottom: '28px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <FaShieldAlt color="#6366f1" />
          <h1 style={{ fontSize: '1.6rem' }}>{election.title}</h1>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Select one candidate. Your vote is final, anonymous, and tamper-evident.</p>
      </div>

      {/* Candidate Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {election.candidates?.map((c, idx) => {
          const isSelected = selected?._id === c._id;
          return (
            <div
              key={c._id || idx}
              onClick={() => setSelected(c)}
              style={{
                background: isSelected ? 'rgba(99,102,241,0.12)' : 'var(--glass-bg)',
                border: `2px solid ${isSelected ? '#6366f1' : 'rgba(255,255,255,0.06)'}`,
                backdropFilter: 'blur(12px)',
                borderRadius: '12px',
                padding: '18px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.2s',
              }}
            >
              {/* Radio circle */}
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                border: `2px solid ${isSelected ? '#6366f1' : '#4b5563'}`,
                background: isSelected ? '#6366f1' : 'transparent',
                flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
              </div>

              {/* Avatar */}
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: `hsl(${(idx * 60 + 200) % 360}, 55%, 30%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: '700', color: '#fff',
                flexShrink: 0,
              }}>
                {c.name?.charAt(0)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: isSelected ? '#ffffff' : '#e5e7eb' }}>{c.name}</div>
                {c.party && <div style={{ fontSize: '0.78rem', color: '#6366f1', fontWeight: '500', marginTop: '2px' }}>{c.party}</div>}
                {c.bio && <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px', lineHeight: '1.4' }}>{c.bio?.slice(0, 80)}</div>}
              </div>

              {isSelected && <FaCheckCircle color="#6366f1" size={18} />}
            </div>
          );
        })}
      </div>

      {/* Cast Vote Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => { if (!selected) { toast.error('Please select a candidate.'); return; } setConfirming(true); }}
          className="btn btn-primary"
          disabled={!selected}
          style={{ fontSize: '1rem', padding: '14px 48px', gap: '10px' }}
        >
          <FaVoteYea /> Review & Cast Vote
        </button>
        <p style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '10px' }}>
          Your selection will be shown for final review before submission.
        </p>
      </div>
    </div>
  );
};

export default VotePage;
