/**
 * ManageElections Component
 * =========================
 * Admin view for listing, editing status, and deleting elections.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FaPlus, FaTrash, FaChartBar, FaArrowLeft, FaVoteYea } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ManageElections = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchElections = async () => {
    try {
      const res = await api.get('/elections?limit=100');
      setElections(res.data?.elections || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchElections(); }, []);

  const handleDelete = async (elId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    try {
      setDeleting(elId);
      await api.delete(`/elections/${elId}`);
      toast.success('Election deleted.');
      setElections((prev) => prev.filter((e) => e._id !== elId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleting(null);
    }
  };

  const badgeClass = { active: 'badge-active', upcoming: 'badge-upcoming', completed: 'badge-completed' };

  return (
    <div style={{ padding: '20px 0' }}>
      <button
        onClick={() => navigate('/admin')}
        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginBottom: '24px', padding: 0 }}
      >
        <FaArrowLeft size={12} /> Back to Admin
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', marginBottom: '6px' }}>Manage Elections</h1>
          <p style={{ color: '#9ca3af' }}>Edit, delete, and monitor all elections.</p>
        </div>
        <Link to="/admin/elections/create" className="btn btn-primary" style={{ gap: '8px' }}>
          <FaPlus size={12} /> New Election
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : elections.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          <FaVoteYea size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p>No elections yet.</p>
          <Link to="/admin/elections/create" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Create First Election
          </Link>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Title', 'Status', 'Candidates', 'Start', 'End', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.78rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {elections.map((el, idx) => (
                <tr key={el._id} style={{ borderBottom: idx < elections.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.88rem', color: '#fff' }}>{el.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '2px' }}>{el.description?.slice(0, 50)}...</div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className={`badge ${badgeClass[el.status] || 'badge-completed'}`}>{el.status}</span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: '#9ca3af' }}>{el.candidates?.length || 0}</td>
                  <td style={{ padding: '14px 20px', fontSize: '0.78rem', color: '#9ca3af' }}>
                    {new Date(el.startDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '0.78rem', color: '#9ca3af' }}>
                    {new Date(el.endDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link
                        to={`/results/${el._id}`}
                        title="View Results"
                        style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '6px', padding: '6px 10px', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: '600' }}
                      >
                        <FaChartBar size={11} /> Results
                      </Link>
                      <button
                        onClick={() => handleDelete(el._id, el.title)}
                        disabled={deleting === el._id}
                        title="Delete Election"
                        style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)', borderRadius: '6px', padding: '6px 10px', color: '#f43f5e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: '600' }}
                      >
                        <FaTrash size={11} /> {deleting === el._id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageElections;
