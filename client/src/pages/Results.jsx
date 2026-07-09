/**
 * Results Component
 * =================
 * Public results viewer for completed elections and surveys.
 * Displays full results with visual charts.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { FaArrowLeft, FaChartBar, FaTrophy } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultsChart from '../components/ResultsChart';

const Results = () => {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [results, setResults] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [elRes, rRes] = await Promise.all([
          api.get(`/elections/${id}`),
          api.get(`/votes/results/${id}`),
        ]);
        setElection(elRes.data?.election);
        const resultData = rRes.data?.results || [];
        setResults(resultData);
        setTotalVotes(resultData.reduce((sum, r) => sum + (r.votes || 0), 0));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!election) return (
    <div className="glass-card" style={{ textAlign: 'center', padding: '60px', marginTop: '40px', color: '#6b7280' }}>
      <p>Election not found.</p>
      <Link to="/elections" className="btn btn-secondary" style={{ marginTop: '16px' }}>Back to Elections</Link>
    </div>
  );

  const winner = results.reduce((best, r) => (!best || r.votes > best.votes) ? r : best, null);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 0' }}>
      <Link to="/elections" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '24px' }}>
        <FaArrowLeft size={12} /> Back to Elections
      </Link>

      {/* Header */}
      <div className="glass-card" style={{ marginBottom: '28px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.06) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <FaChartBar color="#6366f1" size={20} />
          <h1 style={{ fontSize: '1.7rem' }}>{election.title}</h1>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '16px' }}>{election.description}</p>
        <div style={{ display: 'flex', gap: '20px', fontSize: '0.82rem', color: '#6b7280' }}>
          <span>Total votes cast: <strong style={{ color: '#fff' }}>{totalVotes}</strong></span>
          <span>Status: <span className={`badge badge-${election.status === 'completed' ? 'completed' : 'active'}`} style={{ fontSize: '0.72rem' }}>{election.status}</span></span>
        </div>
      </div>

      {/* Winner Banner */}
      {election.status === 'completed' && winner && totalVotes > 0 && (
        <div className="glass-card" style={{
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(251,191,36,0.06) 100%)',
          border: '1px solid rgba(245,158,11,0.2)',
          display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          <div style={{ background: 'rgba(245,158,11,0.15)', borderRadius: '50%', padding: '14px' }}>
            <FaTrophy size={26} color="#f59e0b" />
          </div>
          <div>
            <p style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Winner</p>
            <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>{winner.candidateName}</p>
            {winner.party && <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{winner.party}</p>}
            <p style={{ fontSize: '0.82rem', color: '#f59e0b', marginTop: '2px' }}>
              {winner.votes} votes · {totalVotes > 0 ? ((winner.votes / totalVotes) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      {results.length > 0 ? (
        <>
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '20px' }}>Vote Distribution</h2>
            <ResultsChart results={results} />
          </div>

          {/* Detailed Breakdown */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.15rem', marginBottom: '20px' }}>Detailed Breakdown</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[...results].sort((a, b) => b.votes - a.votes).map((r, idx) => {
                const pct = totalVotes > 0 ? (r.votes / totalVotes) * 100 : 0;
                return (
                  <div key={r.candidateId || idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {idx === 0 && <FaTrophy size={12} color="#f59e0b" />}
                        <span style={{ fontWeight: idx === 0 ? '600' : '400' }}>{r.candidateName}</span>
                        {r.party && <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>· {r.party}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', color: '#9ca3af' }}>
                        <span style={{ fontWeight: '600', color: '#fff' }}>{r.votes}</span>
                        <span>{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div style={{ height: '6px', background: '#1f2937', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: idx === 0
                            ? 'linear-gradient(90deg, #6366f1, #a855f7)'
                            : 'linear-gradient(90deg, #374151, #4b5563)',
                          borderRadius: '999px',
                          transition: 'width 0.8s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          <FaChartBar size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p>No results available yet.</p>
        </div>
      )}
    </div>
  );
};

export default Results;
