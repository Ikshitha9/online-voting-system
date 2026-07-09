/**
 * ElectionDetail Component
 * ========================
 * Detailed view of a single election showing candidates and cast-vote interface.
 * Routes to VotePage if election is active and user hasn't voted.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FaVoteYea, FaArrowLeft, FaUsers, FaClock, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultsChart from '../components/ResultsChart';

const ElectionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [election, setElection] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [elRes] = await Promise.all([
          api.get(`/elections/${id}`),
        ]);
        const el = elRes.data?.election;
        setElection(el);

        // Check if user already voted
        try {
          const vRes = await api.get(`/votes/my-vote/${id}`);
          setMyVote(vRes.data?.vote || null);
        } catch {}

        // Fetch results if completed or admin
        if (el?.status === 'completed' || user?.role === 'admin') {
          try {
            const rRes = await api.get(`/votes/results/${id}`);
            setResults(rRes.data?.results || []);
          } catch {}
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, user]);

  if (loading) return <LoadingSpinner />;
  if (!election) return (
    <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: '#6b7280', marginTop: '40px' }}>
      <p>Election not found.</p>
      <Link to="/elections" className="btn btn-secondary" style={{ marginTop: '16px' }}>Back to Elections</Link>
    </div>
  );

  const badgeClass = { active: 'badge-active', upcoming: 'badge-upcoming', completed: 'badge-completed' };
  const canVote = election.status === 'active' && !myVote && user?.isVerified;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 0' }}>
      <Link to="/elections" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '24px', fontWeight: '500' }}>
        <FaArrowLeft size={12} /> Back to Elections
      </Link>

      {/* Header Card */}
      <div className="glass-card" style={{ marginBottom: '28px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '1.8rem', flex: 1 }}>{election.title}</h1>
          <span className={`badge ${badgeClass[election.status] || 'badge-completed'}`} style={{ fontSize: '0.8rem' }}>
            {election.status}
          </span>
        </div>
        <p style={{ color: '#9ca3af', marginBottom: '20px', lineHeight: '1.6' }}>{election.description}</p>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.82rem', color: '#6b7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaCalendarAlt /> Start: {new Date(election.startDate).toLocaleString()}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaClock /> End: {new Date(election.endDate).toLocaleString()}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaUsers /> {election.candidates?.length || 0} Candidates
          </span>
        </div>

        {/* Already Voted Banner */}
        {myVote && (
          <div style={{ marginTop: '20px', padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981' }}>
            <FaCheckCircle />
            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>You have already voted in this election.</span>
          </div>
        )}
      </div>

      {/* Results Chart */}
      {results && results.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
            {election.status === 'completed' ? 'Final Results' : 'Live Tally'}
          </h2>
          <ResultsChart results={results} />
        </div>
      )}

      {/* Candidates */}
      <div>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Candidates</h2>
        <div className="grid-cols-1-2" style={{ gap: '16px' }}>
          {election.candidates?.map((c, idx) => (
            <div key={c._id || idx} className="glass-card glass-card-hover" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                background: `hsl(${(idx * 60) % 360}, 60%, 30%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: '700', color: '#fff',
                border: '2px solid rgba(255,255,255,0.1)',
              }}>
                {c.name?.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{c.name}</h3>
                {c.party && <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: '600' }}>{c.party}</span>}
                {c.bio && <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '6px', lineHeight: '1.4' }}>{c.bio}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vote CTA */}
      {canVote && (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            onClick={() => navigate(`/vote/${id}`)}
            className="btn btn-primary"
            style={{ fontSize: '1rem', padding: '14px 40px', gap: '10px' }}
          >
            <FaVoteYea /> Cast Your Vote
          </button>
          <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '10px' }}>
            Your vote is anonymous and cryptographically secured.
          </p>
        </div>
      )}

      {election.status === 'upcoming' && (
        <div style={{ textAlign: 'center', marginTop: '40px', color: '#f59e0b' }}>
          <FaClock size={24} style={{ marginBottom: '10px' }} />
          <p>This election hasn't started yet. Check back on {new Date(election.startDate).toLocaleDateString()}.</p>
        </div>
      )}
    </div>
  );
};

export default ElectionDetail;
