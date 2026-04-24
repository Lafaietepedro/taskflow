import React from 'react';

const FILTER_OPTIONS = [
  { key: 'all', label: 'Todas' },
  { key: 'active', label: 'Pendentes' },
  { key: 'in_progress', label: 'Em andamento' },
  { key: 'completed', label: 'Concluídas' },
];

function TaskStats({ totalTasks, pendingTasks, inProgressTasks, completedTasks, filter, setFilter }) {
  const cards = [
    {
      key: 'total',
      label: 'Total',
      value: totalTasks,
      note: 'Carteira completa de OS cadastradas',
      tone: 'blue',
    },
    {
      key: 'pending',
      label: 'Pendentes',
      value: pendingTasks,
      note: 'Aguardando despacho ou confirmação',
      tone: 'amber',
    },
    {
      key: 'progress',
      label: 'Em rota',
      value: inProgressTasks,
      note: 'Ordens em andamento no campo',
      tone: 'orange',
    },
    {
      key: 'done',
      label: 'Concluídas',
      value: completedTasks,
      note: 'Prontas para faturar ou arquivar',
      tone: 'green',
    },
  ];

  return (
    <div className="page-section">
      <div className="stats-grid">
        {cards.map((card) => (
          <article key={card.key} className={`stat-card stat-card--${card.tone}`}>
            <span className="stat-card__label">{card.label}</span>
            <span className="stat-card__value">{card.value}</span>
            <span className="stat-card__sub">{card.note}</span>
          </article>
        ))}
      </div>

      <div className="filter-chip-group" aria-label="Filtros de ordens">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilter(option.key)}
            className={`filter-chip ${filter === option.key ? 'is-active' : ''}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TaskStats;
