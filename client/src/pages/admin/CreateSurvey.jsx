/**
 * CreateSurvey Component
 * ======================
 * Admin form for creating multi-question surveys with various question types.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FaPlus, FaTrash, FaArrowLeft, FaClipboardList } from 'react-icons/fa';
import toast from 'react-hot-toast';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Checkboxes (multi-select)' },
  { value: 'rating', label: 'Rating (1–5)' },
  { value: 'text', label: 'Open Text' },
];

const emptyQuestion = () => ({
  question: '',
  type: 'multiple_choice',
  options: ['', ''],
  required: true,
});

const CreateSurvey = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    questions: [emptyQuestion()],
  });
  const [saving, setSaving] = useState(false);

  const handleBaseChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (qIdx, field, value) => {
    setForm((prev) => {
      const qs = [...prev.questions];
      qs[qIdx] = { ...qs[qIdx], [field]: value };
      // Add default options for choice types
      if (field === 'type' && (value === 'multiple_choice' || value === 'checkbox') && !qs[qIdx].options?.length) {
        qs[qIdx].options = ['', ''];
      }
      return { ...prev, questions: qs };
    });
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    setForm((prev) => {
      const qs = [...prev.questions];
      const opts = [...qs[qIdx].options];
      opts[oIdx] = value;
      qs[qIdx] = { ...qs[qIdx], options: opts };
      return { ...prev, questions: qs };
    });
  };

  const addOption = (qIdx) => {
    setForm((prev) => {
      const qs = [...prev.questions];
      qs[qIdx] = { ...qs[qIdx], options: [...qs[qIdx].options, ''] };
      return { ...prev, questions: qs };
    });
  };

  const removeOption = (qIdx, oIdx) => {
    setForm((prev) => {
      const qs = [...prev.questions];
      const opts = qs[qIdx].options.filter((_, i) => i !== oIdx);
      qs[qIdx] = { ...qs[qIdx], options: opts };
      return { ...prev, questions: qs };
    });
  };

  const addQuestion = () => {
    if (form.questions.length >= 20) { toast.error('Maximum 20 questions.'); return; }
    setForm((prev) => ({ ...prev, questions: [...prev.questions, emptyQuestion()] }));
  };

  const removeQuestion = (qIdx) => {
    if (form.questions.length <= 1) { toast.error('At least 1 question required.'); return; }
    setForm((prev) => ({ ...prev, questions: prev.questions.filter((_, i) => i !== qIdx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.startDate || !form.endDate) {
      toast.error('Fill in all required fields.'); return;
    }
    const valid = form.questions.every((q) => q.question.trim());
    if (!valid) { toast.error('All questions must have text.'); return; }

    try {
      setSaving(true);
      const res = await api.post('/surveys', form);
      if (res.data?.success) {
        toast.success('Survey created!');
        navigate('/admin');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create survey.');
    } finally {
      setSaving(false);
    }
  };

  const needsOptions = (type) => type === 'multiple_choice' || type === 'checkbox';

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '20px 0' }}>
      <button
        onClick={() => navigate('/admin')}
        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginBottom: '24px', padding: 0 }}
      >
        <FaArrowLeft size={12} /> Back to Admin
      </button>

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.9rem', marginBottom: '6px' }}>Create Survey</h1>
        <p style={{ color: '#9ca3af' }}>Build a multi-question survey for community feedback.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Basic Info */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#f59e0b' }}>📋 Survey Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="sv-title">Survey Title *</label>
              <input id="sv-title" name="title" type="text" className="form-input" style={{ width: '100%' }}
                placeholder="e.g., Platform Satisfaction Survey" value={form.title} onChange={handleBaseChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="sv-desc">Description</label>
              <textarea id="sv-desc" name="description" className="form-input"
                style={{ width: '100%', minHeight: '72px', resize: 'vertical', paddingTop: '12px' }}
                placeholder="What is this survey about?" value={form.description} onChange={handleBaseChange} />
            </div>
            <div className="grid-cols-1-2" style={{ gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="sv-start">Start Date *</label>
                <input id="sv-start" name="startDate" type="datetime-local" className="form-input" style={{ width: '100%' }}
                  value={form.startDate} onChange={handleBaseChange} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="sv-end">End Date *</label>
                <input id="sv-end" name="endDate" type="datetime-local" className="form-input" style={{ width: '100%' }}
                  value={form.endDate} onChange={handleBaseChange} required />
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#f59e0b' }}>❓ Questions ({form.questions.length})</h2>
            <button type="button" onClick={addQuestion} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem', gap: '6px' }}>
              <FaPlus size={11} /> Add Question
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {form.questions.map((q, qIdx) => (
              <div key={qIdx} style={{ background: 'rgba(17,24,39,0.5)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#f59e0b' }}>Q{qIdx + 1}</span>
                  {form.questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(qIdx)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f43f5e', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaTrash size={11} /> Remove
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor={`q-text-${qIdx}`}>Question Text *</label>
                    <input id={`q-text-${qIdx}`} type="text" className="form-input" style={{ width: '100%' }}
                      placeholder="Enter your question..." value={q.question}
                      onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)} />
                  </div>

                  <div className="grid-cols-1-2" style={{ gap: '10px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor={`q-type-${qIdx}`}>Question Type</label>
                      <select id={`q-type-${qIdx}`} className="form-input form-select" style={{ width: '100%' }}
                        value={q.type} onChange={(e) => handleQuestionChange(qIdx, 'type', e.target.value)}>
                        {QUESTION_TYPES.map((t) => (
                          <option key={t.value} value={t.value} style={{ background: '#111827' }}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, display: 'flex', alignItems: 'flex-end' }}>
                      <label className="checkbox-group" style={{ paddingBottom: '12px' }}>
                        <input type="checkbox" checked={q.required}
                          onChange={(e) => handleQuestionChange(qIdx, 'required', e.target.checked)}
                          style={{ accentColor: '#6366f1', width: '16px', height: '16px' }} />
                        <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Required</span>
                      </label>
                    </div>
                  </div>

                  {needsOptions(q.type) && (
                    <div>
                      <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Answer Options</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input type="text" className="form-input" style={{ flex: 1 }}
                              placeholder={`Option ${oIdx + 1}`} value={opt}
                              onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)} />
                            {q.options.length > 2 && (
                              <button type="button" onClick={() => removeOption(qIdx, oIdx)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f43f5e', padding: '8px' }}>
                                <FaTrash size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={() => addOption(qIdx)}
                          style={{ background: 'none', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '6px', color: '#9ca3af', cursor: 'pointer', padding: '8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}>
                          <FaPlus size={10} /> Add Option
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/admin')} className="btn btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ gap: '8px' }}>
            <FaClipboardList /> {saving ? 'Creating...' : 'Create Survey'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSurvey;
