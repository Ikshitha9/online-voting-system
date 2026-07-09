/**
 * Surveys Component
 * =================
 * Listing page for all surveys with status filtering.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FaClipboardList, FaSearch } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_OPTIONS = ['all', 'active', 'upcoming', 'closed'];

const Surveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchSurveys = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (status !== 'all') params.set('status', status);
        if (search) params.set('search', search);
        const res = await api.get(`/surveys?${params}`);
        setSurveys(res.data?.surveys || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const debounce = setTimeout(fetchSurveys, 300);
    return () => clearTimeout(debounce);
  }, [status, search]);

  const badgeClass = { active: 'badge-active', upcoming: 'badge-upcoming', closed: 'badge-closed' };

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Surveys</h1>
        <p style={{ color: '#9ca3af' }}>Share your opinion through community surveys.</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <FaSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '13px' }} />
          <input
            id="survey-search"
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '40px' }}
            placeholder="Search surveys..."
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
              style={{ padding: '10px 16px', fontSize: '0.82rem' }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : surveys.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          <FaClipboardList size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p>No surveys found.</p>
        </div>
      ) : (
        <div className="grid-cols-1-2-3">
          {surveys.map((sv) => (
            <div key={sv._id} className="glass-card glass-card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1rem', flex: 1, paddingRight: '10px' }}>{sv.title}</h3>
                <span className={`badge ${badgeClass[sv.status] || 'badge-completed'}`}>{sv.status}</span>
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.82rem', lineHeight: '1.5', flex: 1 }}>
                {sv.description?.slice(0, 100)}{sv.description?.length > 100 ? '...' : ''}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginTop: 'auto' }}>
                <span>{sv.questions?.length || 0} questions</span>
                {sv.endDate && <span>Until {new Date(sv.endDate).toLocaleDateString()}</span>}
              </div>
              <Link
                to={`/surveys/${sv._id}`}
                className={`btn ${sv.status === 'active' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
              >
                {sv.status === 'active' ? 'Take Survey' : 'View Survey'}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Surveys;
