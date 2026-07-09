/**
 * ResultsChart Component
 * =====================
 * Generates rich, responsive pie and bar visualizations for election and survey data.
 * Utilizes recharts for dynamic animations.
 */

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { FaChartPie, FaChartBar } from 'react-icons/fa';

// Harmonious premium colors for chart data cells
const CHART_COLORS = ['#6366f1', '#a855f7', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#ec4899'];

const ResultsChart = ({ data = [], title = 'Results Tally' }) => {
  const [chartType, setChartType] = useState('pie'); // 'pie' | 'bar'

  // Pre-process data: rename votesCount/count to value for Recharts compatibility
  const processedData = data.map((item) => ({
    name: item.name,
    value: item.votesCount !== undefined ? item.votesCount : (item.count !== undefined ? item.count : 0),
  }));

  const totalVotes = processedData.reduce((acc, curr) => acc + curr.value, 0);

  if (totalVotes === 0) {
    return (
      <div
        className="glass-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '320px',
          color: '#6b7280',
        }}
      >
        <p style={{ fontSize: '1rem', fontStyle: 'italic' }}>No votes or submissions recorded yet.</p>
        <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Results will render dynamically when participation begins.</p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          paddingBottom: '12px',
        }}
      >
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>{title}</h3>
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '6px',
            padding: '2px',
          }}
        >
          <button
            onClick={() => setChartType('pie')}
            style={{
              padding: '6px 12px',
              border: 'none',
              background: chartType === 'pie' ? '#6366f1' : 'none',
              color: '#ffffff',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: '500',
              transition: 'background 0.2s',
            }}
          >
            <FaChartPie /> Pie
          </button>
          <button
            onClick={() => setChartType('bar')}
            style={{
              padding: '6px 12px',
              border: 'none',
              background: chartType === 'bar' ? '#6366f1' : 'none',
              color: '#ffffff',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: '500',
              transition: 'background 0.2s',
            }}
          >
            <FaChartBar /> Bar
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#111827', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }}
              />
            </PieChart>
          ) : (
            <BarChart data={processedData}>
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#111827', borderColor: 'rgba(255,255,255,0.1)', color: '#ffffff' }}
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div
        style={{
          marginTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '16px',
          fontSize: '0.8rem',
        }}
      >
        {processedData.map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: CHART_COLORS[index % CHART_COLORS.length],
              }}
            />
            <span style={{ color: '#f3f4f6' }}>{item.name}</span>
            <span style={{ color: '#9ca3af', fontWeight: '600' }}>
              ({item.value} {item.value === 1 ? 'vote' : 'votes'})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsChart;
