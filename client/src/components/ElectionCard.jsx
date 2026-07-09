/**
 * ElectionCard Component
 * ======================
 * Renders an election status summary in a glassmorphic card.
 * Features: status color badges, date listings, and action redirects.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaArrowRight } from 'react-icons/fa';

const ElectionCard = ({ election }) => {
  const { _id, title, description, startDate, endDate, status, totalVoters } = election;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (statusVal) => {
    const badges = {
      upcoming: <span className="badge badge-upcoming">Upcoming</span>,
      active: <span className="badge badge-active">Active</span>,
      completed: <span className="badge badge-completed">Completed</span>,
    };
    return badges[statusVal] || <span className="badge badge-upcoming">{statusVal}</span>;
  };

  return (
    <div className="glass-card glass-card-hover" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        {getStatusBadge(status)}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#9ca3af' }}>
          <FaUsers /> <span>{totalVoters} votes cast</span>
        </div>
      </div>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>{title}</h3>
      
      <p style={{ fontSize: '0.9rem', color: '#9ca3af', flexGrow: 1, marginBottom: '20px' }}>
        {description.length > 120 ? `${description.substring(0, 120)}...` : description}
      </p>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#6b7280' }}>
          <FaCalendarAlt />
          <span>Starts: {formatDate(startDate)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#6b7280' }}>
          <FaCalendarAlt />
          <span>Closes: {formatDate(endDate)}</span>
        </div>
      </div>

      <Link
        to={`/elections/${_id}`}
        className="btn btn-secondary"
        style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.9rem' }}
      >
        <span>View Details</span>
        <FaArrowRight size={12} />
      </Link>
    </div>
  );
};

export default ElectionCard;
