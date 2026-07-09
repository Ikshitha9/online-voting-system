/**
 * Dashboard Component
 * ===================
 * Main voter dashboard showing active elections, recent activity, and quick stats.
 * Admin users see additional management shortcuts.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FaVoteYea, FaClipboardList, FaChartBar, FaUserShield, FaBolt, FaArrowRight, FaClock } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

const StatCard = ({ icon, label, value, color }) => (
  <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ background: `${color}18`, borderRadius: '12px', padding: '14px', flexShrink: 0 }}>
      {React.cloneElement(icon, { size: 22, color })}
    </div>
    <div>
      <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff' }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '500', marginTop: '2px' }}>{label}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, voted: 0, total: 0, surveys: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [elRes, svRes] = await Promise.all([
          api.get('/elections?status=active&limit=4'),
          api.get('/surveys?status=active&limit=3'),
        ]);
        const elData = elRes.data?.elections || [];
        const svData = svRes.data?.surveys || [];
        setElections(elData);
        setSurveys(svData);

        // Count voted elections
        let votedCount = 0;
        for (const el of elData) {
          try {
            const vRes = await api.get(`/votes/my-vote/${el._id}`);
            if (vRes.data?.vote) votedCount++;
          } catch {}
        }

        setStats({
          active: elData.length,
          voted: votedCount,
          total: elRes.data?.total || elData.length,
          surveys: svData.length,
        });
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const isAdmin = user?.role === 'admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '20px 0' }}>

      {/* Welcome Banner */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.08) 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
        padding: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
            Welcome back, <span style={{ color: '#6366f1' }}>{user?.fullName?.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            {isAdmin ? 'You have administrative privileges.' : 'Your identity is verified. Cast your vote securely.'}
          </p>
        </div>
        {isAdmin && (
          <Link to="/admin" className="btn btn-primary" style={{ gap: '8px' }}>
            <FaUserShield /> Admin Panel
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid-cols-1-2-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard icon={<FaBolt />} label="Active Elections" value={stats.active} color="#6366f1" />
        <StatCard icon={<FaVoteYea />} label="Votes Cast" value={stats.voted} color="#10b981" />
        <StatCard icon={<FaClipboardList />} label="Active Surveys" value={stats.surveys} color="#f59e0b" />
      </div>

      {/* Active Elections */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.35rem' }}>Active Elections</h2>
          <Link to="/elections" style={{ fontSize: '0.85rem', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '6px' }}>
            View All <FaArrowRight size={12} />
          </Link>
        </div>

        {elections.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <FaClock size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <p>No active elections at the moment.</p>
          </div>
        ) : (
          <div className="grid-cols-1-2">
            {elections.map((el) => (
              <div key={el._id} className="glass-card glass-card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '1rem', flex: 1, paddingRight: '12px' }}>{el.title}</h3>
                  <span className="badge badge-active">Live</span>
                </div>
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', flex: 1 }}>{el.description?.slice(0, 80)}...</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {el.candidates?.length || 0} candidates
                  </span>
                  <Link
                    to={`/elections/${el._id}`}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.8rem', gap: '6px' }}
                  >
                    <FaVoteYea size={12} /> Vote Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Surveys */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.35rem' }}>Open Surveys</h2>
          <Link to="/surveys" style={{ fontSize: '0.85rem', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '6px' }}>
            View All <FaArrowRight size={12} />
          </Link>
        </div>

        {surveys.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <FaClipboardList size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <p>No open surveys at the moment.</p>
          </div>
        ) : (
          <div className="grid-cols-1-2-3">
            {surveys.map((sv) => (
              <div key={sv._id} className="glass-card glass-card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '0.95rem', flex: 1 }}>{sv.title}</h3>
                  <span className="badge badge-active">Open</span>
                </div>
                <p style={{ color: '#9ca3af', fontSize: '0.78rem', flex: 1 }}>{sv.description?.slice(0, 60)}...</p>
                <Link
                  to={`/surveys/${sv._id}`}
                  style={{ fontSize: '0.8rem', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', marginTop: 'auto' }}
                >
                  Take Survey <FaArrowRight size={10} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Dashboard;
