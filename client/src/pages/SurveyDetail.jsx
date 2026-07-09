/**
 * SurveyDetail Component
 * ======================
 * Single survey view with multi-question form, submission, and results display.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { FaArrowLeft, FaClipboardCheck, FaCheckCircle } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const SurveyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await api.get(`/surveys/${id}`);
        const sv = res.data?.survey;
        setSurvey(sv);
        // Check if already responded
        try {
          const rRes = await api.get(`/surveys/${id}/my-response`);
          if (rRes.data?.hasResponded) setSubmitted(true);
        } catch {}
      } catch (err) {
        toast.error('Failed to load survey.');
        navigate('/surveys');
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [id, navigate]);

  const handleAnswer = (questionId, value, isMultiple = false) => {
    if (isMultiple) {
      setAnswers((prev) => {
        const current = prev[questionId] || [];
        const exists = current.includes(value);
        return {
          ...prev,
          [questionId]: exists ? current.filter((v) => v !== value) : [...current, value],
        };
      });
    } else {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required questions
    const unanswered = survey.questions?.filter(
      (q) => q.required && !answers[q._id]?.length && !answers[q._id]
    );
    if (unanswered?.length) {
      toast.error(`Please answer all required questions (${unanswered.length} remaining).`);
      return;
    }
    try {
      setSubmitting(true);
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer: Array.isArray(answer) ? answer : [answer],
      }));
      await api.post(`/surveys/${id}/respond`, { answers: formattedAnswers });
      setSubmitted(true);
      toast.success('Survey response submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit survey.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!survey) return null;

  if (submitted) {
    return (
      <div style={{ maxWidth: '560px', margin: '60px auto', padding: '0 16px' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ width: '72px', height: '72px', background: 'rgba(16,185,129,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <FaCheckCircle size={34} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '1.7rem', marginBottom: '10px', color: '#10b981' }}>Response Recorded!</h2>
          <p style={{ color: '#9ca3af', marginBottom: '28px' }}>Thank you for participating in <strong style={{ color: '#fff' }}>{survey.title}</strong>.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/surveys')} className="btn btn-primary">Browse Surveys</button>
            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const badgeClass = { active: 'badge-active', upcoming: 'badge-upcoming', closed: 'badge-closed' };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 0' }}>
      <Link to="/surveys" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '24px' }}>
        <FaArrowLeft size={12} /> Back to Surveys
      </Link>

      {/* Header */}
      <div className="glass-card" style={{ marginBottom: '28px', background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ fontSize: '1.7rem', flex: 1 }}>{survey.title}</h1>
          <span className={`badge ${badgeClass[survey.status] || 'badge-completed'}`}>{survey.status}</span>
        </div>
        <p style={{ color: '#9ca3af', marginBottom: '12px', lineHeight: '1.6' }}>{survey.description}</p>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#6b7280' }}>
          <span>{survey.questions?.length || 0} questions</span>
          {survey.endDate && <span>Closes {new Date(survey.endDate).toLocaleDateString()}</span>}
        </div>
      </div>

      {/* Questions */}
      {survey.status !== 'active' ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <p>This survey is {survey.status === 'closed' ? 'closed' : 'not yet open'}.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {survey.questions?.map((q, idx) => (
            <div key={q._id} className="glass-card" style={{ gap: '14px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{
                  width: '28px', height: '28px', background: 'rgba(99,102,241,0.12)', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem',
                  fontWeight: '700', color: '#6366f1', flexShrink: 0,
                }}>
                  {idx + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                    {q.question}
                    {q.required && <span style={{ color: '#f43f5e', marginLeft: '4px' }}>*</span>}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px', textTransform: 'capitalize' }}>
                    {q.type?.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Render by question type */}
              {(q.type === 'multiple_choice' || q.type === 'checkbox') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '38px' }}>
                  {q.options?.map((opt, oIdx) => {
                    const isChecked = q.type === 'checkbox'
                      ? (answers[q._id] || []).includes(opt)
                      : answers[q._id] === opt;
                    return (
                      <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', background: isChecked ? 'rgba(99,102,241,0.1)' : 'transparent', border: `1px solid ${isChecked ? 'rgba(99,102,241,0.3)' : 'transparent'}`, transition: 'all 0.15s' }}>
                        <input
                          type={q.type === 'checkbox' ? 'checkbox' : 'radio'}
                          name={`q-${q._id}`}
                          value={opt}
                          checked={isChecked}
                          onChange={() => handleAnswer(q._id, opt, q.type === 'checkbox')}
                          style={{ accentColor: '#6366f1' }}
                        />
                        <span style={{ fontSize: '0.88rem' }}>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {q.type === 'rating' && (
                <div style={{ display: 'flex', gap: '8px', paddingLeft: '38px' }}>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleAnswer(q._id, r.toString())}
                      style={{
                        width: '40px', height: '40px', borderRadius: '50%', border: '2px solid',
                        borderColor: answers[q._id] === r.toString() ? '#6366f1' : 'rgba(255,255,255,0.08)',
                        background: answers[q._id] === r.toString() ? 'rgba(99,102,241,0.2)' : 'transparent',
                        color: answers[q._id] === r.toString() ? '#6366f1' : '#9ca3af',
                        fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'text' && (
                <textarea
                  className="form-input"
                  style={{ width: '100%', minHeight: '80px', resize: 'vertical', paddingTop: '12px' }}
                  placeholder="Your answer..."
                  value={answers[q._id] || ''}
                  onChange={(e) => handleAnswer(q._id, e.target.value)}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start', gap: '8px', padding: '12px 32px' }}
          >
            <FaClipboardCheck /> {submitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </form>
      )}
    </div>
  );
};

export default SurveyDetail;
