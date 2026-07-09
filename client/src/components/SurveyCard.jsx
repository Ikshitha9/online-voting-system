/**
 * SurveyCard Component
 * ====================
 * Renders a survey overview in a glassmorphic block.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaUsers, FaArrowRight } from 'react-icons/fa';

const SurveyCard = ({ survey }) => {
  const { _id, title, description, questions, status, totalResponses } = survey;

  const getStatusBadge = (statusVal) => {
    const badges = {
      draft: <span className="badge badge-upcoming">Draft</span>,
      active: <span className="badge badge-active">Active</span>,
      closed: <span className="badge badge-closed">Closed</span>,
    };
    return badges[statusVal] || <span className="badge badge-upcoming">{statusVal}</span>;
  };

  return (
    <div className="glass-card glass-card-hover" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        {getStatusBadge(status)}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#9ca3af' }}>
          <FaUsers /> <span>{totalResponses} responses</span>
        </div>
      </div>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>{title}</h3>

      <p style={{ fontSize: '0.9rem', color: '#9ca3af', flexGrow: 1, marginBottom: '20px' }}>
        {description.length > 120 ? `${description.substring(0, 120)}...` : description}
      </p>

      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '14px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.8rem',
          color: '#6b7280',
        }}
      >
        <FaClipboardList />
        <span>Contains {questions.length} questions</span>
      </div>

      <Link
        to={`/surveys/${_id}`}
        className="btn btn-secondary"
        style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.9rem' }}
      >
        <span>Open Survey</span>
        <FaArrowRight size={12} />
      </Link>
    </div>
  );
};

export default SurveyCard;
