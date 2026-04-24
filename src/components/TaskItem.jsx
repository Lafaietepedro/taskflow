import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const STATUS_LABELS = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  done: 'Concluido',
};

const PRIORITY_LABELS = {
  low: 'Baixa',
  medium: 'Media',
  high: 'Alta',
};

function formatServiceDate(serviceDate) {
  if (!serviceDate) {
    return {
      date: 'Sem agenda',
      time: 'Data pendente',
    };
  }

  const parsedDate = new Date(serviceDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return {
      date: 'Data invalida',
      time: 'Revisar OS',
    };
  }

  return {
    date: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(parsedDate),
    time: new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(parsedDate),
  };
}

function formatTimestamp(dateValue) {
  if (!dateValue) {
    return 'sem registro';
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'sem registro';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsedDate);
}

function getAccentFromText(text) {
  const palette = [
    'linear-gradient(135deg, #f5a623, #ff6b35)',
    'linear-gradient(135deg, #4a9eff, #67c3ff)',
    'linear-gradient(135deg, #2ecc71, #9be15d)',
    'linear-gradient(135deg, #f97316, #fb7185)',
  ];

  const value = String(text || 'taskflow')
    .split('')
    .reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0);

  return palette[value % palette.length];
}

function buildInitials(name) {
  return String(name || 'TF')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() || '')
    .join('') || 'TF';
}

function TaskItem({ task, technicianName, onStatusChange, onChecklistToggle, onEdit, onDelete }) {
  const checklistItems = Array.isArray(task.checklistItems) ? task.checklistItems : [];
  const checklistDoneCount = checklistItems.filter((item) => item.done).length;
  const checklistTotal = checklistItems.length;
  const progressPercentage = checklistTotal > 0 ? Math.round((checklistDoneCount / checklistTotal) * 100) : 0;
  const serviceDate = formatServiceDate(task.serviceDate);
  const technicianLabel = technicianName || 'Equipe';
  const accent = getAccentFromText(technicianLabel);
  const shortId = `#${String(task.id || '').slice(-6).toUpperCase() || 'OS0000'}`;

  return (
    <article className="order-row" style={{ '--row-accent': accent }}>
      <div className="order-row__header">
        <div className="order-cell order-cell--id">
          <div className="order-id">{shortId}</div>
          <span className="order-id__stamp">Atualizada {formatTimestamp(task.updatedAt || task.createdAt)}</span>
        </div>

        <div className="order-cell order-cell--service">
          <div className="order-service__title">{task.title}</div>
          <div className="order-service__client">{task.customerName || 'Cliente nao informado'}</div>
          <div className="order-service__meta">
            <span>{task.customerPhone || 'Telefone pendente'}</span>
            <span>{task.address || 'Endereco nao informado'}</span>
          </div>
        </div>

        <div className="order-cell order-cell--date">
          <div className="order-date">
            <span className="order-date__main">{serviceDate.date}</span>
            <span className="order-date__time">{serviceDate.time}</span>
          </div>
        </div>

        <div className="order-cell order-cell--status">
          <div className={`status-badge status-${task.status || 'pending'}`}>
            {STATUS_LABELS[task.status] || STATUS_LABELS.pending}
          </div>
          <div style={{ marginTop: '8px' }}>
            <span className={`priority-badge priority-${task.priority || 'medium'}`}>
              {PRIORITY_LABELS[task.priority] || PRIORITY_LABELS.medium}
            </span>
          </div>
        </div>

        <div className="order-cell order-cell--tech">
          <div className="order-tech">
            <span className="technician-avatar" style={{ background: accent }}>
              {buildInitials(technicianLabel)}
            </span>
            <div>
              <span className="order-tech__name">{technicianLabel}</span>
              <span className="order-tech__role">Tecnico responsavel</span>
            </div>
          </div>
        </div>

        <div className="order-cell order-cell--progress">
          <div className="progress-meta">
            <span>{checklistDoneCount}/{checklistTotal || 0}</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        <div className="order-cell order-cell--actions">
          <div className="order-actions">
            <button type="button" className="button-ghost" onClick={() => onEdit(task)}>
              <FiEdit2 size={14} />
              Editar
            </button>
            <button
              type="button"
              className="button-ghost"
              onClick={() => onDelete(task.id)}
              aria-label={`Excluir ordem ${task.title}`}
            >
              <FiTrash2 size={14} />
              Excluir
            </button>
          </div>
        </div>
      </div>

      <div className="order-row__details">
        {task.notes ? (
          <div className="note-box">
            <div className="mini-panel__title">Observacoes</div>
            <div className="note-box__body">{task.notes}</div>
          </div>
        ) : null}

        <div className="details-grid">
          <div className="mini-panel">
            <div className="mini-panel__title">Fluxo da OS</div>
            <div className="status-switcher">
              {Object.entries(STATUS_LABELS).map(([statusKey, statusLabel]) => (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => onStatusChange(task.id, statusKey)}
                  className={`filter-chip ${task.status === statusKey ? 'is-active' : ''}`}
                >
                  {statusLabel}
                </button>
              ))}
            </div>
          </div>

          <div className="mini-panel">
            <div className="mini-panel__title">Checklist da visita</div>
            {checklistTotal > 0 ? (
              <ul className="checklist-items">
                {checklistItems.map((item) => (
                  <li key={item.id || item.label}>
                    <button
                      type="button"
                      onClick={() => onChecklistToggle(task, item.id)}
                      className={`checklist-item ${item.done ? 'is-done' : ''}`}
                    >
                      <span className="checklist-item__check">OK</span>
                      <span className="checklist-item__label">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="note-box__body">Nenhum checklist cadastrado para esta ordem.</div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default TaskItem;
