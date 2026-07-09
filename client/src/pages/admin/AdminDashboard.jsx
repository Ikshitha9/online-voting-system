/**
 * Admin Dashboard
 * ===============
 * Overview panel for admins showing platform-wide statistics and quick action links.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { FaVoteYea, FaClipboardList, FaUsers, FaPlus, FaChartBar, FaHistory, FaArrowRight } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner';

const QuickAction = ({ to, icon, label, description, color }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div className="glass-card glass-card-hover" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', cursor: 'pointer' }}>
      <div style={{ background: `${color}18`, borderRadius: '10px', padding: '12px', flexShrink: 0 }}>
        {React.cloneElement(icon, { size: 20, color })}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '4px', color: '#fff' }}>{label}</div>
        <div style={{ color: '#9ca3af', fontSize: '0.78rem' }}>{description}</div>
      </div>
      <FaArrowRight size={12} color="#6b7280" style={{ marginTop: '4px' }} />
    </div>
  </Link>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ elections: 0, surveys: 0, users: 0, votes: 0, active: 0 });
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/audit-logs?limit=8'),
        ]);
        setStats(statsRes.data?.stats || {});
        setAuditLogs(logsRes.data?.logs || []);
      } catch (err) {
        console.error('Admin dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { label: 'Total Elections', value: stats.elections, color: '#6366f1', icon: <FaVoteYea /> },
    { label: 'Active Elections', value: stats.active, color: '#10b981', icon: <FaChartBar /> },
    { label: 'Total Surveys', value: stats.surveys, color: '#f59e0b', icon: <FaClipboardList /> },
    { label: 'Total Users', value: stats.users, color: '#a855f7', icon: <FaUsers /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', padding: '20px 0' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>
          Admin <span style={{ color: '#6366f1' }}>Control Panel</span>
        </h1>
        <p style={{ color: '#9ca3af' }}>Manage elections, surveys, and platform activity from one place.</p>
      </div>

      {/* Stats */}
      <div className="grid-cols-1-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {statCards.map(({ label, value, color, icon }) => (
          <div key={label} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: `${color}18`, borderRadius: '10px', padding: '13px', flexShrink: 0 }}>
              {React.cloneElement(icon, { size: 20, color })}
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fff' }}>{value ?? 0}</div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: '500' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Quick Actions</h2>
        <div className="grid-cols-1-2">
          <QuickAction to="/admin/elections/create" icon={<FaPlus />} label="Create Election" description="Launch a new election with candidates and timing" color="#6366f1" />
          <QuickAction to="/admin/elections" icon={<FaVoteYea />} label="Manage Elections" description="Edit, delete, and view results for all elections" color="#10b981" />
          <QuickAction to="/admin/surveys/create" icon={<FaPlus />} label="Create Survey" description="Build a new survey with custom questions" color="#f59e0b" />
          <QuickAction to="/admin/users" icon={<FaUsers />} label="Manage Users" description="View voters, admins, and verification status" color="#a855f7" />
        </div>
      </section>

      {/* Recent Audit Logs */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Recent Audit Logs</h2>
          <Link to="/admin/logs" style={{ fontSize: '0.82rem', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '5px' }}>
            View All <FaArrowRight size={10} />
          </Link>
        </div>
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          {auditLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
              <FaHistory size={28} style={{ marginBottom: '10px', opacity: 0.3 }} />
              <p>No audit logs yet.</p>
            </div>
          ) : (
            <div>
              {auditLogs.map((log, idx) => (
                <div key={log._id || idx} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 20px',
                  borderBottom: idx < auditLogs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#6b7280', marginTop: '3px', minWidth: '140px' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: '700', padding: '2px 8px', borderRadius: '4px',
                      background: log.action?.includes('vote') ? 'rgba(16,185,129,0.12)' : log.action?.includes('delete') ? 'rgba(244,63,94,0.12)' : 'rgba(99,102,241,0.12)',
                      color: log.action?.includes('vote') ? '#10b981' : log.action?.includes('delete') ? '#f43f5e' : '#6366f1',
                      marginRight: '8px',
                    }}>
                      {log.action?.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#d1d5db' }}>{log.details || log.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
