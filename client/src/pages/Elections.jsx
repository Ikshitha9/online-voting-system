/**
 * Elections Component
 * ===================
 * Lists all elections with filtering by status (active/upcoming/completed).
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FaVoteYea, FaSearch, FaFilter } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_OPTIONS = ['all', 'active', 'upcoming', 'completed'];

const Elections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (status !== 'all') params.set('status', status);
        if (search) params.set('search', search);
        const res = await api.get(`/elections?${params}`);
        setElections(res.data?.elections || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(fetch, 300);
    return () => clearTimeout(debounce);
  }, [status, search]);

  const badgeClass = { active: 'badge-active', upcoming: 'badge-upcoming', completed: 'badge-completed' };

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Elections</h1>
        <p style={{ color: '#9ca3af' }}>Browse and participate in secure elections.</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '13px' }} />
          <input
            id="election-search"
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '40px' }}
            placeholder="Search elections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`btn ${status === s ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '10px 16px', fontSize: '0.82rem', gap: '6px' }}
            >
              <FaFilter size={10} />
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : elections.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          <FaVoteYea size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontSize: '1.1rem' }}>No elections found.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>Try adjusting the filter or search query.</p>
        </div>
      ) : (
        <div className="grid-cols-1-2-3">
          {elections.map((el) => (
            <div key={el._id} className="glass-card glass-card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1rem', flex: 1, paddingRight: '10px' }}>{el.title}</h3>
                <span className={`badge ${badgeClass[el.status] || 'badge-completed'}`}>{el.status}</span>
              </div>

              <p style={{ color: '#9ca3af', fontSize: '0.82rem', lineHeight: '1.5', flex: 1 }}>
                {el.description?.slice(0, 100)}{el.description?.length > 100 ? '...' : ''}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#6b7280' }}>
                <span>{el.candidates?.length || 0} candidates</span>
                <span>
                  {el.status === 'active' && el.endDate
                    ? `Ends ${new Date(el.endDate).toLocaleDateString()}`
                    : el.status === 'upcoming'
                    ? `Starts ${new Date(el.startDate).toLocaleDateString()}`
                    : 'Closed'}
                </span>
              </div>

              <Link
                to={`/elections/${el._id}`}
                className={`btn ${el.status === 'active' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', gap: '8px', marginTop: 'auto' }}
              >
                <FaVoteYea size={12} />
                {el.status === 'active' ? 'Vote Now' : el.status === 'completed' ? 'View Results' : 'Preview'}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Elections;
