/**
 * ElectionResults (Admin)
 * =======================
 * Admin-only detailed election results view with raw vote counts and audit info.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { FaArrowLeft, FaTrophy, FaDownload } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner';
import ResultsChart from '../../components/ResultsChart';

const AdminElectionResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [results, setResults] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [elRes, rRes] = await Promise.all([
          api.get(`/elections/${id}`),
          api.get(`/votes/results/${id}`),
        ]);
        setElection(elRes.data?.election);
        const rData = rRes.data?.results || [];
        setResults(rData);
        setTotalVotes(rData.reduce((s, r) => s + r.votes, 0));

        // Admin-only audit summary
        try {
          const aRes = await api.get(`/admin/election-audit/${id}`);
          setAuditData(aRes.data);
        } catch {}
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const exportCSV = () => {
    if (!results.length) return;
    const header = 'Candidate,Party,Votes,Percentage\n';
    const rows = results.map((r) =>
      `"${r.candidateName}","${r.party || ''}",${r.votes},${totalVotes > 0 ? ((r.votes / totalVotes) * 100).toFixed(2) : 0}%`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${election?.title?.replace(/\s+/g, '_')}_results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSpinner />;
  if (!election) return (
    <div className="glass-card" style={{ textAlign: 'center', padding: '60px', marginTop: '40px', color: '#6b7280' }}>
      <p>Election not found.</p>
      <button onClick={() => navigate('/admin/elections')} className="btn btn-secondary" style={{ marginTop: '16px' }}>Back</button>
    </div>
  );

  const winner = results.reduce((best, r) => (!best || r.votes > best.votes) ? r : best, null);

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '20px 0' }}>
      <button
        onClick={() => navigate('/admin/elections')}
        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginBottom: '24px', padding: 0 }}
      >
        <FaArrowLeft size={12} /> Back to Elections
      </button>

      {/* Header */}
      <div className="glass-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h1 style={{ fontSize: '1.7rem', marginBottom: '6px' }}>{election.title}</h1>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
              Total votes: <strong style={{ color: '#fff' }}>{totalVotes}</strong> ·
              Status: <span className={`badge badge-${election.status === 'completed' ? 'completed' : 'active'}`} style={{ fontSize: '0.7rem', marginLeft: '4px' }}>{election.status}</span>
            </p>
          </div>
          <button onClick={exportCSV} className="btn btn-secondary" style={{ gap: '8px', fontSize: '0.82rem' }}>
            <FaDownload size={12} /> Export CSV
          </button>
        </div>
      </div>

      {/* Winner Banner */}
      {winner && totalVotes > 0 && (
        <div className="glass-card" style={{ marginBottom: '24px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(245,158,11,0.15)', borderRadius: '50%', padding: '12px' }}>
            <FaTrophy size={22} color="#f59e0b" />
          </div>
          <div>
            <p style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Leading / Winner</p>
            <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>{winner.candidateName}</p>
            <p style={{ fontSize: '0.8rem', color: '#f59e0b' }}>{winner.votes} votes · {((winner.votes / totalVotes) * 100).toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {results.length > 0 && (
        <div className="glass-card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Vote Distribution Chart</h2>
          <ResultsChart results={results} />
        </div>
      )}

      {/* Detailed Table */}
      <div className="glass-card" style={{ marginBottom: '24px', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Candidate Breakdown</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Rank', 'Candidate', 'Party', 'Votes', 'Share', 'Bar'].map((h) => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...results].sort((a, b) => b.votes - a.votes).map((r, idx) => {
              const pct = totalVotes > 0 ? (r.votes / totalVotes) * 100 : 0;
              return (
                <tr key={r.candidateId || idx} style={{ borderBottom: idx < results.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: idx === 0 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', color: idx === 0 ? '#f59e0b' : '#9ca3af' }}>
                      {idx + 1}
                    </div>
                  </td>
                  <td style={{ padding: '12px 20px', fontWeight: idx === 0 ? '600' : '400', fontSize: '0.88rem', color: '#fff' }}>{r.candidateName}</td>
                  <td style={{ padding: '12px 20px', fontSize: '0.82rem', color: '#9ca3af' }}>{r.party || '—'}</td>
                  <td style={{ padding: '12px 20px', fontWeight: '700', color: idx === 0 ? '#f59e0b' : '#fff' }}>{r.votes}</td>
                  <td style={{ padding: '12px 20px', fontSize: '0.85rem', color: '#9ca3af' }}>{pct.toFixed(1)}%</td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ width: '120px', height: '6px', background: '#1f2937', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: idx === 0 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#374151,#4b5563)', borderRadius: '9999px' }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Audit Info */}
      {auditData && (
        <div className="glass-card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Audit Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {Object.entries(auditData).map(([k, v]) => (
              <div key={k} style={{ padding: '14px', background: 'rgba(17,24,39,0.5)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <p style={{ fontSize: '0.72rem', color: '#6b7280', textTransform: 'capitalize', marginBottom: '4px' }}>{k.replace(/_/g, ' ')}</p>
                <p style={{ fontWeight: '700', color: '#fff' }}>{String(v)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminElectionResults;
